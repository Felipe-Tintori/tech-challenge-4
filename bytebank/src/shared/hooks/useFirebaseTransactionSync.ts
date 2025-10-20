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
import { ITransaction } from '../../interface/transaction';

/**
 * Hook personalizado para sincronização em tempo real das transações com Firebase
 * Usa onSnapshot para ouvir mudanças na collection de transações
 */
export const useFirebaseTransactionSync = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    // Cleanup do listener anterior se existir
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // Se não há usuário autenticado, limpa as transações
    if (!isAuthenticated || !user?._id) {
      // Dispatch action para limpar transações
      dispatch({ 
        type: 'transactions/syncTransactions', 
        payload: [] 
      });
      return;
    }

    // Configura listener para mudanças em tempo real
    const setupRealtimeListener = () => {
      try {
        const q = query(
          collection(db, IFirebaseCollection.TRANSACTION),
          where("userId", "==", user._id),
          orderBy("createdAt", "desc")
        );

        unsubscribeRef.current = onSnapshot(
          q,
          (querySnapshot) => {
            const transactions: ITransaction[] = [];

            querySnapshot.forEach((doc) => {
              const data = doc.data() as ITransaction;
              transactions.push({
                id: doc.id,
                ...data,
                createdAt: new Date(data.createdAt),
              });
            });

            // Dispatch action para atualizar transações no Redux
            dispatch({ 
              type: 'transactions/syncTransactions', 
              payload: transactions 
            });
          },
          (error) => {
            console.error('Erro na sincronização em tempo real:', error);
            // Dispatch error para o Redux
            dispatch({ 
              type: 'transactions/syncError', 
              payload: error.message 
            });
          }
        );
      } catch (error: any) {
        console.error('Erro ao configurar listener:', error);
        dispatch({ 
          type: 'transactions/syncError', 
          payload: error.message 
        });
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
  }, [dispatch, isAuthenticated, user?._id]);

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
    userId: user?._id || null,
    isAuthenticated,
  };
};