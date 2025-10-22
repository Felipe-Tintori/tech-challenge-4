import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { db, storage } from '../../services/firebaseConfig';
import { 
  Transaction, 
  CreateTransactionData, 
  UpdateTransactionData,
  TransactionFilters,
  TransactionCategory,
  PaymentMethod,
  TransactionStatus
} from '../../domain/entities/Transaction';
import { 
  ITransactionRepository, 
  TransactionStatistics 
} from '../../domain/repositories/ITransactionRepository';
import { IFirebaseCollection, IFirebaseStorage } from '../../enum/firebaseCollection';

export class FirebaseTransactionRepository implements ITransactionRepository {
  
  // Função auxiliar para converter timestamp
  private convertTimestamp(timestamp: any): Date {
    if (!timestamp) {
      return new Date();
    }
    
    // Se já é um Date
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // Se tem método toDate (Firestore Timestamp nativo)
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Se é um objeto com seconds e nanoseconds (timestamp serializado)
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000 + Math.floor(timestamp.nanoseconds / 1000000));
    }
    
    // Se é string, tentar parsear
    if (typeof timestamp === 'string') {
      return new Date(timestamp);
    }
    
    // Fallback
    return new Date();
  }

  // Função auxiliar para normalizar strings de enum
  private normalizeEnumValue(value: string): string {
    if (!value) return '';
    
    // Capitalizar primeira letra e manter o resto
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  
  async create(data: CreateTransactionData): Promise<Transaction> {
    try {
      const docRef = doc(collection(db, IFirebaseCollection.TRANSACTION));
      
      const transaction = new Transaction(
        docRef.id,
        data.userId,
        data.category,
        data.paymentMethod,
        data.value,
        data.date,
        TransactionStatus.REALIZADA,
        data.description,
        data.receiptUrl
      );

      await setDoc(docRef, {
        userId: transaction.userId,
        category: transaction.category,
        paymentMethod: transaction.paymentMethod,
        value: transaction.value,
        date: Timestamp.fromDate(transaction.date),
        status: transaction.status,
        description: transaction.description,
        receiptUrl: transaction.receiptUrl,
        createdAt: Timestamp.fromDate(transaction.createdAt),
        updatedAt: Timestamp.fromDate(transaction.updatedAt)
      });

      return transaction;
    } catch (error: any) {
      throw error;
    }
  }

  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    try {
      const updateData: any = {
        ...data,
        updatedAt: Timestamp.fromDate(new Date())
      };

      if (data.date) {
        updateData.date = Timestamp.fromDate(data.date);
      }

      await updateDoc(doc(db, IFirebaseCollection.TRANSACTION, id), updateData);

      const transactionDoc = await getDoc(doc(db, IFirebaseCollection.TRANSACTION, id));
      const transactionData = transactionDoc.data();

      if (!transactionData) {
        throw new Error('Transação não encontrada após atualização');
      }

      return new Transaction(
        id,
        transactionData.userId,
        transactionData.category,
        transactionData.paymentMethod || transactionData.payment,
        transactionData.value,
        this.convertTimestamp(transactionData.date || transactionData.dataTransaction),
        transactionData.status,
        transactionData.description,
        transactionData.receiptUrl || transactionData.comprovanteURL,
        this.convertTimestamp(transactionData.createdAt),
        this.convertTimestamp(transactionData.updatedAt)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, IFirebaseCollection.TRANSACTION, id));
    } catch (error: any) {
      throw error;
    }
  }

  async getById(id: string): Promise<Transaction | null> {
    try {
      const transactionDoc = await getDoc(doc(db, IFirebaseCollection.TRANSACTION, id));
      
      if (!transactionDoc.exists()) {
        return null;
      }

      const data = transactionDoc.data();
      
      return new Transaction(
        transactionDoc.id,
        data.userId,
        data.category,
        data.paymentMethod || data.payment,
        data.value,
        this.convertTimestamp(data.date || data.dataTransaction),
        data.status,
        data.description,
        data.receiptUrl || data.comprovanteURL,
        this.convertTimestamp(data.createdAt),
        this.convertTimestamp(data.updatedAt)
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getByUserId(userId: string): Promise<Transaction[]> {
    try {
      console.log('FirebaseTransactionRepository.getByUserId: Buscando transações para userId:', userId);
      
      // Simplificando a query - removendo orderBy que pode estar causando problemas
      const q = query(
        collection(db, IFirebaseCollection.TRANSACTION),
        where('userId', '==', userId)
      );

      console.log('FirebaseTransactionRepository.getByUserId: Executando query no Firestore...');
      const querySnapshot = await getDocs(q);
      console.log('FirebaseTransactionRepository.getByUserId: Query executada, documentos encontrados:', querySnapshot.docs.length);

      const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('FirebaseTransactionRepository.getByUserId: Documento data:', data);
        
        return new Transaction(
          doc.id,
          data.userId,
          data.category as any, // Usar 'as any' para permitir flexibilidade temporariamente
          (data.paymentMethod || data.payment) as any,
          data.value,
          this.convertTimestamp(data.date || data.dataTransaction),
          this.normalizeEnumValue(data.status) as any,
          data.description,
          data.comprovanteURL || data.receiptUrl,
          this.convertTimestamp(data.createdAt),
          this.convertTimestamp(data.updatedAt)
        );
      });

      // Ordenar no código em vez do Firestore
      return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error: any) {
      console.error('FirebaseTransactionRepository.getByUserId: Erro:', error);
      throw error;
    }
  }

  async getByFilters(userId: string, filters: TransactionFilters): Promise<Transaction[]> {
    try {
      let queryConstraints: any[] = [
        where('userId', '==', userId),
        orderBy('date', 'desc')
      ];

      if (filters.startDate) {
        queryConstraints.push(where('date', '>=', Timestamp.fromDate(filters.startDate)));
      }

      if (filters.endDate) {
        queryConstraints.push(where('date', '<=', Timestamp.fromDate(filters.endDate)));
      }

      if (filters.category) {
        queryConstraints.push(where('category', '==', filters.category));
      }

      if (filters.paymentMethod) {
        queryConstraints.push(where('paymentMethod', '==', filters.paymentMethod));
      }

      if (filters.status) {
        queryConstraints.push(where('status', '==', filters.status));
      }

      const q = query(collection(db, IFirebaseCollection.TRANSACTION), ...queryConstraints);
      const querySnapshot = await getDocs(q);

      let transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return new Transaction(
          doc.id,
          data.userId,
          data.category,
          data.paymentMethod,
          data.value,
          data.date.toDate(),
          data.status,
          data.description,
          data.receiptUrl,
          data.createdAt.toDate(),
          data.updatedAt.toDate()
        );
      });

      // Filtros aplicados após a busca (limitações do Firestore)
      if (filters.minValue !== undefined) {
        transactions = transactions.filter(t => t.value >= filters.minValue!);
      }

      if (filters.maxValue !== undefined) {
        transactions = transactions.filter(t => t.value <= filters.maxValue!);
      }

      return transactions;
    } catch (error: any) {
      throw error;
    }
  }

  async getByCategory(userId: string, category: string): Promise<Transaction[]> {
    return this.getByFilters(userId, { category: category as TransactionCategory });
  }

  async getByPeriod(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.getByFilters(userId, { startDate, endDate });
  }

  async getStatistics(userId: string): Promise<TransactionStatistics> {
    try {
      const transactions = await this.getByUserId(userId);
      
      let totalValue = 0;
      let totalIncome = 0;
      let totalExpense = 0;
      const transactionsByCategory: Record<string, number> = {};
      const transactionsByPaymentMethod: Record<string, number> = {};

      transactions.forEach(transaction => {
        totalValue += transaction.value;
        
        if (transaction.category === TransactionCategory.SAQUE) {
          totalExpense += transaction.value;
        } else {
          totalIncome += transaction.value;
        }

        // Contagem por categoria
        transactionsByCategory[transaction.category] = 
          (transactionsByCategory[transaction.category] || 0) + 1;

        // Contagem por método de pagamento
        transactionsByPaymentMethod[transaction.paymentMethod] = 
          (transactionsByPaymentMethod[transaction.paymentMethod] || 0) + 1;
      });

      return {
        totalTransactions: transactions.length,
        totalValue,
        totalIncome,
        totalExpense,
        averageValue: transactions.length > 0 ? totalValue / transactions.length : 0,
        transactionsByCategory,
        transactionsByPaymentMethod
      };
    } catch (error: any) {
      throw error;
    }
  }

  subscribeToChanges(
    userId: string,
    callback: (transactions: Transaction[]) => void
  ): () => void {
    try {
      const q = query(
        collection(db, IFirebaseCollection.TRANSACTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot: QuerySnapshot<DocumentData>) => {
          const transactions = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return new Transaction(
              doc.id,
              data.userId,
              data.category,
              data.paymentMethod,
              data.value,
              data.date.toDate(),
              data.status,
              data.description,
              data.comprovanteURL || data.receiptUrl,
              data.createdAt.toDate(),
              data.updatedAt.toDate()
            );
          });

          callback(transactions);
        },
        (error) => {
          console.error('Erro na subscription de transações:', error);
        }
      );

      return unsubscribe;
    } catch (error: any) {
      return () => {}; // Retorna função vazia em caso de erro
    }
  }

  async uploadReceipt(file: File | Blob, transactionId: string): Promise<string> {
    try {
      const fileName = `${transactionId}-${Date.now()}`;
      const storageRef = ref(storage, `${IFirebaseStorage.COMPROVANTES}/${fileName}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (error: any) {
      throw error;
    }
  }

  async removeReceipt(receiptUrl: string): Promise<void> {
    try {
      const storageRef = ref(storage, receiptUrl);
      await deleteObject(storageRef);
    } catch (error: any) {
      throw error;
    }
  }
}