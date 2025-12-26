import { useEffect, useRef } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { useAuth } from '../../store/hooks/useAuth';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Unsubscribe 
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { IFirebaseCollection } from '../../enum/firebaseCollection';
import { Transaction } from '../../domain/entities/Transaction';
import { subscriptionUpdate } from '../../store/slices/transactionSlice';
import { transactionsToLegacy } from '../adapters/transactionAdapter';

/**
 * Hook personalizado para sincronização em tempo real das transações com Firebase
 * Usa onSnapshot para ouvir mudanças na collection de transações
 */
export const useFirebaseTransactionSync = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const unsubscribeRef = useRef<Unsubscribe | null>(null);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    console.log('useFirebaseTransactionSync: useEffect triggered', {
      isAuthenticated,
      userId: user?.id || user?._id,
      lastUserId: lastUserIdRef.current
    });
    // Cleanup do listener anterior se existir
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Se não há usuário autenticado, limpa as transações apenas se mudou de usuário
    const currentUserId = user?.id || user?._id;
    if (!isAuthenticated || !currentUserId) {
      // Só limpa se realmente houve uma mudança de estado de autenticação
      if (lastUserIdRef.current && !currentUserId) {
        console.log('useFirebaseTransactionSync: Limpando transações - logout detectado');
        dispatch(subscriptionUpdate([]));
        lastUserIdRef.current = null;
      }
      return;
    }

    // Se é um novo usuário, atualiza a referência
    if (lastUserIdRef.current !== currentUserId) {
      console.log('useFirebaseTransactionSync: Mudança de usuário detectada', {
        from: lastUserIdRef.current,
        to: currentUserId
      });
      lastUserIdRef.current = currentUserId;
    }

    // Configura listener para mudanças em tempo real
    const setupRealtimeListener = () => {
      try {
        const q = query(
          collection(db, IFirebaseCollection.TRANSACTION),
          where("userId", "==", currentUserId),
          orderBy("createdAt", "desc")
        );

        unsubscribeRef.current = onSnapshot(
          q,
          (querySnapshot) => {
            console.log('useFirebaseTransactionSync: Firebase snapshot received', {
              size: querySnapshot.size,
              userId: currentUserId
            });
            
            const transactions: Transaction[] = [];

            querySnapshot.forEach((doc) => {
              const data = doc.data();
              
              console.log('DEBUG useFirebaseTransactionSync: Documento Firebase completo:', data);
              console.log('DEBUG useFirebaseTransactionSync: categoryId no Firebase:', data.categoryId);
              console.log('DEBUG useFirebaseTransactionSync: paymentId no Firebase:', data.paymentId);
              console.log('DEBUG useFirebaseTransactionSync: category no Firebase:', data.category);
              console.log('DEBUG useFirebaseTransactionSync: payment no Firebase:', data.payment);
              
              // Converter dados do Firebase para entidade Transaction
              const transaction = new Transaction(
                doc.id,
                data.userId,
                data.category || data.categoryId, // Compatibilidade com formato antigo
                data.paymentMethod || data.payment, // Compatibilidade com formato antigo
                data.value,
                data.date?.toDate() || data.dataTransaction, // Compatibilidade com formato antigo
                data.status || 'completed',
                data.description || '',
                data.comprovanteURL || data.receiptUrl || null,
                data.createdAt?.toDate() || new Date(),
                data.updatedAt?.toDate() || new Date()
              );
              
              console.log('DEBUG useFirebaseTransactionSync: Transaction criada:', transaction);
              
              transactions.push(transaction);
            });

            // Converter para formato ITransaction usando o adapter
            const legacyTransactions = transactionsToLegacy(transactions);
            
            console.log('useFirebaseTransactionSync: Processadas', transactions.length, 'transações via Firebase');
            
            dispatch(subscriptionUpdate(legacyTransactions));
          },
          (error) => {
            console.error('Erro na sincronização em tempo real:', error);
            // Para erros, mantem as transações atuais mas loga o erro
            console.error('Firebase sync error:', error.message);
          }
        );
      } catch (error: any) {
        console.error('Erro ao configurar listener:', error);
        console.error('Setup listener error:', error.message);
      }
    };

    setupRealtimeListener();

    // Cleanup quando o componente desmonta ou dependências mudam
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [dispatch, isAuthenticated, user?.id, user?._id]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    // Retorna informações úteis sobre o estado da sincronização
    isListening: !!unsubscribeRef.current,
    userId: user?.id || user?._id || null,
    isAuthenticated,
  };
};