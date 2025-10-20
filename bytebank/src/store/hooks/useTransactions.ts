import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from './index';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  clearError,
  setFilters,
  clearFilters,
  setCurrentPage,
  setItemsPerPage,
  resetTransactionState
} from '../slices/transactionSlice';
import {
  selectAllTransactions,
  selectFilteredTransactions,
  selectPaginatedTransactions,
  selectTransactionLoading,
  selectTransactionError,
  selectTransactionFilters,
  selectTransactionStatistics,
  selectTransactionPagination,
  selectTransactionsByCategory,
  selectRecentTransactions,
  selectMonthlyTransactionData
} from '../selectors';

export const useTransactions = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const allTransactions = useAppSelector(selectAllTransactions);
  const filteredTransactions = useAppSelector(selectFilteredTransactions);
  const paginatedTransactions = useAppSelector(selectPaginatedTransactions);
  const isLoading = useAppSelector(selectTransactionLoading);
  const error = useAppSelector(selectTransactionError);
  const filters = useAppSelector(selectTransactionFilters);
  const statistics = useAppSelector(selectTransactionStatistics);
  const pagination = useAppSelector(selectTransactionPagination);
  const transactionsByCategory = useAppSelector(selectTransactionsByCategory);
  const recentTransactions = useAppSelector(selectRecentTransactions);
  const monthlyData = useAppSelector(selectMonthlyTransactionData);

  // Actions
  const loadTransactions = useCallback((userId: string) => {
    return dispatch(fetchTransactions(userId));
  }, [dispatch]);

  const addTransaction = useCallback((transactionData: any) => {
    return dispatch(createTransaction(transactionData));
  }, [dispatch]);

  const editTransaction = useCallback((transactionData: any) => {
    return dispatch(updateTransaction(transactionData));
  }, [dispatch]);

  const removeTransaction = useCallback((id: string) => {
    return dispatch(deleteTransaction(id));
  }, [dispatch]);

  const clearTransactionError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  const applyFilters = useCallback((newFilters: any) => {
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

  const resetTransactions = useCallback(() => {
    dispatch(resetTransactionState());
  }, [dispatch]);

  return {
    // State
    allTransactions,
    filteredTransactions,
    paginatedTransactions,
    isLoading,
    error,
    filters,
    statistics,
    pagination,
    transactionsByCategory,
    recentTransactions,
    monthlyData,

    // Actions
    loadTransactions,
    addTransaction,
    editTransaction,
    removeTransaction,
    clearTransactionError,
    applyFilters,
    removeFilters,
    changePage,
    changeItemsPerPage,
    resetTransactions,
  };
};