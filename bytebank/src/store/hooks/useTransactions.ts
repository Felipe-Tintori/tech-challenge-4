import { useCallback, useMemo } from 'react';
import { createSelector } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from './index';
import {
  clearError,
  setFilters,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  setCurrentTransaction,
  resetTransactionState,
  setSubscriptionStatus
} from '../slices/transactionSlice';
import {
  createTransactionAsync,
  updateTransactionAsync,
  deleteTransactionAsync,
  fetchTransactionsAsync,
  fetchTransactionsByFiltersAsync,
  fetchTransactionByIdAsync,
  fetchTransactionStatisticsAsync,
  subscribeToTransactionsAsync,
  uploadReceiptAsync,
  removeReceiptAsync
} from '../../presentation/adapters/transactionThunks';
import { 
  CreateTransactionData, 
  UpdateTransactionData, 
  TransactionFilters as DomainTransactionFilters 
} from '../../domain/entities/Transaction';
import { transactionsToLegacy } from '../../shared/adapters/transactionAdapter';
import { RootState } from '../store';

// Tipo de filtros para o hook (compatível com Redux)
type HookTransactionFilters = {
  category?: string;
  paymentMethod?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  minValue?: number;
  maxValue?: number;
};

// Selectors memoizados para evitar re-renders
const selectTransactionState = (state: RootState) => state.transactions;

const selectAllTransactions = createSelector(
  [selectTransactionState],
  (transactionState) => transactionState.transactions
);

const selectFilteredTransactions = createSelector(
  [selectTransactionState],
  (transactionState) => transactionState.filteredTransactions
);

const selectPaginatedTransactions = createSelector(
  [selectTransactionState],
  (transactionState) => {
    const { currentPage, itemsPerPage } = transactionState.pagination;
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return transactionState.filteredTransactions.slice(startIndex, endIndex);
  }
);

const selectTransactionsByCategory = createSelector(
  [selectAllTransactions],
  (transactions) => {
    const categoryMap: { [key: string]: typeof transactions } = {};
    
    transactions.forEach(transaction => {
      if (!categoryMap[transaction.category]) {
        categoryMap[transaction.category] = [];
      }
      categoryMap[transaction.category].push(transaction);
    });
    
    return categoryMap;
  }
);

const selectRecentTransactions = createSelector(
  [selectAllTransactions],
  (transactions) => transactions.slice(0, 5)
);

export const useTransactions = () => {
  const dispatch = useAppDispatch();

  // Selectors otimizados com memoização
  const allTransactions = useAppSelector(selectAllTransactions);
  const filteredTransactions = useAppSelector(selectFilteredTransactions);
  const paginatedTransactions = useAppSelector(selectPaginatedTransactions);
  const transactionsByCategory = useAppSelector(selectTransactionsByCategory);
  const recentTransactions = useAppSelector(selectRecentTransactions);

  // Selectors diretos para dados simples
  const currentTransaction = useAppSelector(state => state.transactions.currentTransaction);
  const isLoading = useAppSelector(state => state.transactions.isLoading);
  const error = useAppSelector(state => state.transactions.error);
  const filters = useAppSelector(state => state.transactions.filters);
  const statistics = useAppSelector(state => state.transactions.statistics);
  const pagination = useAppSelector(state => state.transactions.pagination);
  const subscriptionActive = useAppSelector(state => state.transactions.subscriptionActive);

  // Actions com Clean Architecture
  const loadTransactions = useCallback((userId: string) => {
    return dispatch(fetchTransactionsAsync(userId));
  }, [dispatch]);

  const loadTransactionsByFilters = useCallback((userId: string, filters: DomainTransactionFilters) => {
    return dispatch(fetchTransactionsByFiltersAsync({ userId, filters }));
  }, [dispatch]);

  const loadTransactionById = useCallback((transactionId: string) => {
    return dispatch(fetchTransactionByIdAsync(transactionId));
  }, [dispatch]);

  const addTransaction = useCallback((transactionData: CreateTransactionData) => {
    return dispatch(createTransactionAsync(transactionData));
  }, [dispatch]);

  const editTransaction = useCallback((id: string, data: UpdateTransactionData) => {
    return dispatch(updateTransactionAsync({ id, data }));
  }, [dispatch]);

  const removeTransaction = useCallback((id: string) => {
    return dispatch(deleteTransactionAsync(id));
  }, [dispatch]);

  const loadStatistics = useCallback((userId: string) => {
    return dispatch(fetchTransactionStatisticsAsync(userId));
  }, [dispatch]);

  const subscribeToTransactions = useCallback((userId: string) => {
    return dispatch(subscribeToTransactionsAsync(userId));
  }, [dispatch]);

  const uploadReceipt = useCallback((file: File | Blob, transactionId: string) => {
    return dispatch(uploadReceiptAsync({ file, transactionId }));
  }, [dispatch]);

  const removeReceipt = useCallback((transactionId: string, receiptUrl: string) => {
    return dispatch(removeReceiptAsync({ transactionId, receiptUrl }));
  }, [dispatch]);

  // Filter and pagination actions
  const applyFilters = useCallback((newFilters: HookTransactionFilters) => {
    dispatch(setFilters(newFilters));
  }, [dispatch]);

  const removeFilters = useCallback(() => {
    dispatch(clearFilters());
  }, [dispatch]);

  const changePage = useCallback((page: number) => {
    dispatch(setCurrentPage(page));
  }, [dispatch]);

  const changeItemsPerPage = useCallback((itemsPerPage: number) => {
    dispatch(setItemsPerPage(itemsPerPage));
  }, [dispatch]);

  // Other actions
  const clearTransactionError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const selectTransaction = useCallback((transaction: any) => {
    dispatch(setCurrentTransaction(transaction));
  }, [dispatch]);

  const resetTransactions = useCallback(() => {
    dispatch(resetTransactionState());
  }, [dispatch]);

  const setSubscriptionActive = useCallback((status: boolean) => {
    dispatch(setSubscriptionStatus(status));
  }, [dispatch]);

  // Utility functions
  const getTransactionById = useCallback((id: string) => {
    return allTransactions.find(transaction => transaction.id === id) || null;
  }, [allTransactions]);

  const getTransactionsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return allTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.dataTransaction);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }, [allTransactions]);

  const getTransactionsByCategory = useCallback((category: string) => {
    return allTransactions.filter(transaction => transaction.category === category);
  }, [allTransactions]);

  const getTotalBalance = useCallback(() => {
    return statistics?.totalIncome ? statistics.totalIncome - statistics.totalExpense : 0;
  }, [statistics]);

  return {
    // State - ITransaction format (usado em toda aplicação agora)
    allTransactions,
    filteredTransactions,
    paginatedTransactions,
    currentTransaction,
    isLoading,
    error,
    filters,
    statistics,
    pagination,
    transactionsByCategory,
    recentTransactions,
    subscriptionActive,

    // Actions
    loadTransactions,
    loadTransactionsByFilters,
    loadTransactionById,
    addTransaction,
    editTransaction,
    removeTransaction,
    loadStatistics,
    subscribeToTransactions,
    uploadReceipt,
    removeReceipt,
    
    // Filter and pagination
    applyFilters,
    removeFilters,
    changePage,
    changeItemsPerPage,
    
    // Other actions
    clearTransactionError,
    selectTransaction,
    resetTransactions,
    setSubscriptionActive,

    // Utilities
    getTransactionById,
    getTransactionsByDateRange,
    getTransactionsByCategory,
    getTotalBalance,
  };
};