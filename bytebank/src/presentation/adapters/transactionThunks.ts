import { createAsyncThunk } from '@reduxjs/toolkit';
import { DIContainer } from '../../infrastructure/di/DIContainer';
import { 
  CreateTransactionData, 
  UpdateTransactionData, 
  TransactionFilters 
} from '../../domain/entities/Transaction';

// Instância do container DI
const diContainer = DIContainer.getInstance();

/**
 * Thunks de transações usando Clean Architecture
 */

export const createTransactionAsync = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData: CreateTransactionData, { rejectWithValue }) => {
    try {
      const transaction = await diContainer.createTransactionUseCase.execute(transactionData);
      const plainObject = transaction.toPlainObject();
      // Garantir que as datas são strings
      return {
        ...plainObject,
        date: plainObject.date instanceof Date ? plainObject.date.toISOString() : plainObject.date,
        createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
        updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao criar transação');
    }
  }
);

export const updateTransactionAsync = createAsyncThunk(
  'transactions/updateTransaction',
  async (
    { id, data }: { id: string; data: UpdateTransactionData }, 
    { rejectWithValue }
  ) => {
    try {
      const transaction = await diContainer.updateTransactionUseCase.execute(id, data);
      const plainObject = transaction.toPlainObject();
      // Garantir que as datas são strings
      return {
        ...plainObject,
        date: plainObject.date instanceof Date ? plainObject.date.toISOString() : plainObject.date,
        createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
        updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao atualizar transação');
    }
  }
);

export const deleteTransactionAsync = createAsyncThunk(
  'transactions/deleteTransaction',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      await diContainer.deleteTransactionUseCase.execute(transactionId);
      return transactionId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao deletar transação');
    }
  }
);

export const fetchTransactionsAsync = createAsyncThunk(
  'transactions/fetchTransactions',
  async (userId: string, { rejectWithValue }) => {
    try {
      console.log('fetchTransactionsAsync: Iniciando busca para userId:', userId);
      const transactions = await diContainer.getTransactionsUseCase.execute(userId);
      console.log('fetchTransactionsAsync: Transações encontradas:', transactions.length);
      return transactions.map(transaction => {
        const plainObject = transaction.toPlainObject();
        // Garantir que as datas são strings serializáveis
        return {
          ...plainObject,
          date: plainObject.date instanceof Date ? plainObject.date.toISOString() : plainObject.date,
          createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
          updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
        };
      });
    } catch (error: any) {
      console.error('fetchTransactionsAsync: Erro:', error);
      return rejectWithValue(error.message || 'Erro ao buscar transações');
    }
  }
);

export const fetchTransactionsByFiltersAsync = createAsyncThunk(
  'transactions/fetchTransactionsByFilters',
  async (
    { userId, filters }: { userId: string; filters: TransactionFilters }, 
    { rejectWithValue }
  ) => {
    try {
      const transactions = await diContainer.getTransactionsUseCase.executeWithFilters(userId, filters);
      return transactions.map(transaction => {
        const plainObject = transaction.toPlainObject();
        // Garantir que as datas são strings serializáveis
        return {
          ...plainObject,
          date: plainObject.date instanceof Date ? plainObject.date.toISOString() : plainObject.date,
          createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
          updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
        };
      });
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao buscar transações filtradas');
    }
  }
);

export const fetchTransactionByIdAsync = createAsyncThunk(
  'transactions/fetchTransactionById',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const transaction = await diContainer.transactionRepository.getById(transactionId);
      if (!transaction) return null;
      
      const plainObject = transaction.toPlainObject();
      // Garantir que as datas são strings serializáveis
      return {
        ...plainObject,
        date: plainObject.date instanceof Date ? plainObject.date.toISOString() : plainObject.date,
        createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
        updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao buscar transação');
    }
  }
);

export const fetchTransactionStatisticsAsync = createAsyncThunk(
  'transactions/fetchStatistics',
  async (userId: string, { rejectWithValue }) => {
    try {
      const statistics = await diContainer.transactionRepository.getStatistics(userId);
      return statistics;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao buscar estatísticas');
    }
  }
);

export const subscribeToTransactionsAsync = createAsyncThunk(
  'transactions/subscribeToTransactions',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      const unsubscribe = diContainer.transactionRepository.subscribeToChanges(
        userId,
        (transactions) => {
          const serializedTransactions = transactions.map(transaction => {
            const plainObject = transaction.toPlainObject();
            // Garantir que as datas são strings serializáveis
            return {
              ...plainObject,
              date: plainObject.date instanceof Date ? plainObject.date.toISOString() : plainObject.date,
              createdAt: plainObject.createdAt instanceof Date ? plainObject.createdAt.toISOString() : plainObject.createdAt,
              updatedAt: plainObject.updatedAt instanceof Date ? plainObject.updatedAt.toISOString() : plainObject.updatedAt,
            };
          });
          
          dispatch({
            type: 'transactions/subscriptionUpdate',
            payload: serializedTransactions
          });
        }
      );
      
      return unsubscribe;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao assinar mudanças em transações');
    }
  }
);

export const uploadReceiptAsync = createAsyncThunk(
  'transactions/uploadReceipt',
  async (
    { file, transactionId }: { file: File | Blob; transactionId: string }, 
    { rejectWithValue }
  ) => {
    try {
      const receiptUrl = await diContainer.transactionRepository.uploadReceipt(file, transactionId);
      
      // Atualiza a transação com a URL do comprovante
      await diContainer.updateTransactionUseCase.execute(transactionId, { receiptUrl });
      
      return { transactionId, receiptUrl };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao fazer upload do comprovante');
    }
  }
);

export const removeReceiptAsync = createAsyncThunk(
  'transactions/removeReceipt',
  async (
    { transactionId, receiptUrl }: { transactionId: string; receiptUrl: string }, 
    { rejectWithValue }
  ) => {
    try {
      await diContainer.transactionRepository.removeReceipt(receiptUrl);
      
      // Remove a URL do comprovante da transação
      await diContainer.updateTransactionUseCase.execute(transactionId, { receiptUrl: undefined });
      
      return transactionId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erro ao remover comprovante');
    }
  }
);