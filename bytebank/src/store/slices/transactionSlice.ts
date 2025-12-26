import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  createTransactionAsync, 
  updateTransactionAsync, 
  deleteTransactionAsync, 
  fetchTransactionsAsync,
  fetchTransactionsByFiltersAsync,
  fetchTransactionByIdAsync,
  fetchTransactionStatisticsAsync,
  uploadReceiptAsync,
  removeReceiptAsync
} from '../../presentation/adapters/transactionThunks';
import { TransactionStatistics } from '../../domain/repositories/ITransactionRepository';
import { ITransaction } from '../../interface/transaction';
import { transactionToLegacy, transactionsToLegacy } from '../../shared/adapters/transactionAdapter';

interface TransactionFilters {
  category?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string; // ISO string para serialização
  endDate?: string; // ISO string para serialização
  minValue?: number;
  maxValue?: number;
}

export interface TransactionState {
  transactions: ITransaction[];
  filteredTransactions: ITransaction[];
  currentTransaction: ITransaction | null;
  isLoading: boolean;
  error: string | null;
  filters: TransactionFilters;
  pagination: {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
  statistics: TransactionStatistics | null;
  subscriptionActive: boolean;
  page?: number;
  hasMore?: boolean;
  loading?: boolean;
}

// Helper functions
const applyFilters = (transactions: ITransaction[], filters: TransactionFilters): ITransaction[] => {
  console.log('DEBUG applyFilters: Transações antes do filtro:', transactions.length);
  console.log('DEBUG applyFilters: Filtros aplicados:', filters);
  
  const filteredTransactions = transactions.filter(transaction => {
    console.log('DEBUG applyFilters: Verificando transação:', {
      id: transaction.id,
      category: transaction.category,
      paymentMethod: transaction.payment,
      status: transaction.status,
      date: transaction.dataTransaction,
      value: transaction.value
    });
    
    if (filters.startDate && new Date(transaction.dataTransaction) < new Date(filters.startDate)) {
      console.log('DEBUG applyFilters: Rejeitada por startDate');
      return false;
    }
    if (filters.endDate && new Date(transaction.dataTransaction) > new Date(filters.endDate)) {
      console.log('DEBUG applyFilters: Rejeitada por endDate');
      return false;
    }
    if (filters.category && transaction.category !== filters.category) {
      console.log('DEBUG applyFilters: Rejeitada por category', {
        transactionCategory: transaction.category,
        filterCategory: filters.category,
        areEqual: transaction.category === filters.category
      });
      return false;
    }
    // Verificar payment para compatibilidade
    if (filters.paymentMethod && transaction.payment !== filters.paymentMethod) {
      console.log('DEBUG applyFilters: Rejeitada por paymentMethod', {
        transactionPayment: transaction.payment,
        filterPaymentMethod: filters.paymentMethod,
        paymentEqual: transaction.payment === filters.paymentMethod
      });
      return false;
    }
    if (filters.status && transaction.status !== filters.status) {
      console.log('DEBUG applyFilters: Rejeitada por status', transaction.status, '!==', filters.status);
      return false;
    }
    if (filters.minValue && transaction.value < filters.minValue) {
      console.log('DEBUG applyFilters: Rejeitada por minValue');
      return false;
    }
    if (filters.maxValue && transaction.value > filters.maxValue) {
      console.log('DEBUG applyFilters: Rejeitada por maxValue');
      return false;
    }
    console.log('DEBUG applyFilters: Transação aprovada');
    return true;
  });
  
  console.log('DEBUG applyFilters: Transações após filtro:', filteredTransactions.length);
  return filteredTransactions;
};

// Initial State
const initialState: TransactionState = {
  transactions: [],
  filteredTransactions: [],
  currentTransaction: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    currentPage: 0,
    itemsPerPage: 10,
    totalPages: 0,
  },
  statistics: null,
  subscriptionActive: false,
  page: 0,
  hasMore: true,
  loading: false,
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
      state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      state.pagination.currentPage = 0;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.filteredTransactions = state.transactions;
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
    setCurrentTransaction: (state, action: PayloadAction<ITransaction | null>) => {
      state.currentTransaction = action.payload;
    },
    resetTransactionState: () => initialState,
    
    // Actions para sincronização em tempo real
    subscriptionUpdate: (state, action: PayloadAction<ITransaction[]>) => {
      state.transactions = action.payload;
      state.filteredTransactions = applyFilters(action.payload, state.filters);
      state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      state.subscriptionActive = true;
    },
    setSubscriptionStatus: (state, action: PayloadAction<boolean>) => {
      state.subscriptionActive = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder
      .addCase(fetchTransactionsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const legacyTransactions = transactionsToLegacy(action.payload as any);
        state.transactions = legacyTransactions;
        state.filteredTransactions = applyFilters(legacyTransactions, state.filters);
        state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchTransactionsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch transactions by filters
    builder
      .addCase(fetchTransactionsByFiltersAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByFiltersAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredTransactions = transactionsToLegacy(action.payload as any);
        state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      })
      .addCase(fetchTransactionsByFiltersAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch transaction by ID
    builder
      .addCase(fetchTransactionByIdAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionByIdAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTransaction = action.payload ? transactionToLegacy(action.payload as any) : null;
      })
      .addCase(fetchTransactionByIdAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create transaction
    builder
      .addCase(createTransactionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTransactionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions.unshift(transactionToLegacy(action.payload as any));
        state.filteredTransactions = applyFilters(state.transactions, state.filters);
        state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      })
      .addCase(createTransactionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update transaction
    builder
      .addCase(updateTransactionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTransactionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.transactions.findIndex((t: ITransaction) => t.id === (action.payload as any).id);
        if (index !== -1) {
          state.transactions[index] = transactionToLegacy(action.payload as any);
        }
        state.filteredTransactions = applyFilters(state.transactions, state.filters);
      })
      .addCase(updateTransactionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete transaction
    builder
      .addCase(deleteTransactionAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransactionAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = state.transactions.filter((t: ITransaction) => t.id !== action.payload);
        state.filteredTransactions = applyFilters(state.transactions, state.filters);
        state.pagination.totalPages = Math.ceil(state.filteredTransactions.length / state.pagination.itemsPerPage);
      })
      .addCase(deleteTransactionAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch statistics
    builder
      .addCase(fetchTransactionStatisticsAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionStatisticsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statistics = action.payload;
      })
      .addCase(fetchTransactionStatisticsAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Upload receipt
    builder
      .addCase(uploadReceiptAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadReceiptAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const { transactionId, receiptUrl } = action.payload;
        const index = state.transactions.findIndex((t: ITransaction) => t.id === transactionId);
        if (index !== -1) {
          state.transactions[index].comprovanteURL = receiptUrl;
        }
        state.filteredTransactions = applyFilters(state.transactions, state.filters);
      })
      .addCase(uploadReceiptAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Remove receipt
    builder
      .addCase(removeReceiptAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeReceiptAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        const transactionId = action.payload;
        const index = state.transactions.findIndex((t: ITransaction) => t.id === transactionId);
        if (index !== -1) {
          state.transactions[index].comprovanteURL = undefined;
        }
        state.filteredTransactions = applyFilters(state.transactions, state.filters);
      })
      .addCase(removeReceiptAsync.rejected, (state, action) => {
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
  setCurrentTransaction,
  resetTransactionState,
  subscriptionUpdate,
  setSubscriptionStatus
} = transactionSlice.actions;

export default transactionSlice.reducer;