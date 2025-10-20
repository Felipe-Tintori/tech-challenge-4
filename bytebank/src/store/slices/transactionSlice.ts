import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDocs 
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { ITransaction } from '../../interface/transaction';
import { IFirebaseCollection } from '../../enum/firebaseCollection';

// Types
interface TransactionState {
  transactions: ITransaction[];
  filteredTransactions: ITransaction[];
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
  statistics: {
    totalTransactions: number;
    totalValue: number;
    totalIncome: number;
    totalExpense: number;
  };
}

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  category?: string;
  paymentMethod?: string;
  minValue?: number;
  maxValue?: number;
}

interface CreateTransactionPayload {
  userId: string;
  category: string;
  categoryId: string;
  payment: string;
  paymentId: string;
  value: number;
  dataTransaction: string;
  comprovanteURL?: string;
  status: string;
}

// Async Thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, IFirebaseCollection.TRANSACTION),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const transactions: ITransaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ITransaction;
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: new Date(data.createdAt),
        });
      });
      
      return transactions;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (transactionData: CreateTransactionPayload, { rejectWithValue }) => {
    try {
      const docRef = await addDoc(
        collection(db, IFirebaseCollection.TRANSACTION),
        {
          ...transactionData,
          createdAt: new Date(),
        }
      );
      
      return {
        id: docRef.id,
        ...transactionData,
        createdAt: new Date(),
      } as ITransaction;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, ...updateData }: Partial<ITransaction> & { id: string }, { rejectWithValue }) => {
    try {
      const transactionRef = doc(db, IFirebaseCollection.TRANSACTION, id);
      await updateDoc(transactionRef, {
        ...updateData,
        updatedAt: new Date(),
      });
      
      return { id, ...updateData };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, IFirebaseCollection.TRANSACTION, id));
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to filter transactions
const applyFilters = (transactions: ITransaction[], filters: TransactionFilters): ITransaction[] => {
  return transactions.filter(transaction => {
    if (filters.startDate && new Date(transaction.dataTransaction) < new Date(filters.startDate)) {
      return false;
    }
    if (filters.endDate && new Date(transaction.dataTransaction) > new Date(filters.endDate)) {
      return false;
    }
    if (filters.category && transaction.category !== filters.category) {
      return false;
    }
    if (filters.paymentMethod && transaction.payment !== filters.paymentMethod) {
      return false;
    }
    if (filters.minValue && transaction.value < filters.minValue) {
      return false;
    }
    if (filters.maxValue && transaction.value > filters.maxValue) {
      return false;
    }
    return true;
  });
};

// Helper function to calculate statistics
const calculateStatistics = (transactions: ITransaction[]) => {
  const totalTransactions = transactions.length;
  const totalValue = transactions.reduce((sum, t) => sum + t.value, 0);
  const totalIncome = transactions
    .filter(t => t.category !== 'Saque')
    .reduce((sum, t) => sum + t.value, 0);
  const totalExpense = transactions
    .filter(t => t.category === 'Saque')
    .reduce((sum, t) => sum + t.value, 0);

  return {
    totalTransactions,
    totalValue,
    totalIncome,
    totalExpense,
  };
};

// Initial State
const initialState: TransactionState = {
  transactions: [],
  filteredTransactions: [],
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 0,
    itemsPerPage: 10,
    totalPages: 0,
  },
  statistics: {
    totalTransactions: 0,
    totalValue: 0,
    totalIncome: 0,
    totalExpense: 0,
  },
};

// Transaction Slice
const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<TransactionFilters>) => {
      state.filters = action.payload;
      state.filteredTransactions = applyFilters(state.transactions, action.payload);
      state.statistics = calculateStatistics(state.filteredTransactions);
      state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      state.pagination.currentPage = 0;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredTransactions = state.transactions;
      state.statistics = calculateStatistics(state.transactions);
      state.pagination.totalPages = Math.ceil(state.transactions.length / state.pagination.itemsPerPage);
      state.pagination.currentPage = 0;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / action.payload);
      state.pagination.currentPage = 0;
    },
    resetTransactionState: () => initialState,
    // Actions para sincronização em tempo real
    syncTransactions: (state, action: PayloadAction<ITransaction[]>) => {
      state.transactions = action.payload;
      state.filteredTransactions = applyFilters(action.payload, state.filters);
      state.statistics = calculateStatistics(state.filteredTransactions);
      state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      state.isLoading = false;
      state.error = null;
    },
    syncError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setSyncLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.filteredTransactions = applyFilters(action.payload, state.filters);
        state.statistics = calculateStatistics(state.filteredTransactions);
        state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(action.payload);
        state.filteredTransactions = applyFilters(state.transactions, state.filters);
        state.statistics = calculateStatistics(state.filteredTransactions);
        state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update transaction
    builder
      .addCase(updateTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = { ...state.transactions[index], ...action.payload };
        }
        state.filteredTransactions = applyFilters(state.transactions, state.filters);
        state.statistics = calculateStatistics(state.filteredTransactions);
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete transaction
    builder
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
        state.filteredTransactions = applyFilters(state.transactions, state.filters);
        state.statistics = calculateStatistics(state.filteredTransactions);
        state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  setCurrentPage, 
  setItemsPerPage, 
  resetTransactionState,
  syncTransactions,
  syncError,
  setSyncLoading
} = transactionSlice.actions;

export default transactionSlice.reducer;