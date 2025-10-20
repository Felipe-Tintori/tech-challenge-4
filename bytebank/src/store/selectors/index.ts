import { createSelector } from 'reselect';
import { ITransaction } from '../../interface/transaction';

// Definição de tipo local para o estado
type RootState = {
  auth: {
    user: any;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    token: string | null;
  };
  transactions: {
    transactions: ITransaction[];
    filteredTransactions: ITransaction[];
    isLoading: boolean;
    error: string | null;
    filters: any;
    statistics: any;
    pagination: any;
  };
  ui: {
    theme: string;
    isConnected: boolean;
    notifications: any[];
    modals: any;
    loading: any;
    snackbar: any;
  };
};

// Base selectors
const selectAuthState = (state: RootState) => state.auth;
const selectTransactionState = (state: RootState) => state.transactions;
const selectUIState = (state: RootState) => state.ui;

// Auth selectors
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuthState],
  (auth) => auth.error
);

export const selectUserToken = createSelector(
  [selectAuthState],
  (auth) => auth.token
);

// Transaction selectors
export const selectAllTransactions = createSelector(
  [selectTransactionState],
  (transactions) => transactions.transactions
);

export const selectFilteredTransactions = createSelector(
  [selectTransactionState],
  (transactions) => transactions.filteredTransactions
);

export const selectTransactionLoading = createSelector(
  [selectTransactionState],
  (transactions) => transactions.isLoading
);

export const selectTransactionError = createSelector(
  [selectTransactionState],
  (transactions) => transactions.error
);

export const selectTransactionFilters = createSelector(
  [selectTransactionState],
  (transactions) => transactions.filters
);

export const selectTransactionStatistics = createSelector(
  [selectTransactionState],
  (transactions) => transactions.statistics
);

export const selectTransactionPagination = createSelector(
  [selectTransactionState],
  (transactions) => transactions.pagination
);

// Paginated transactions selector
export const selectPaginatedTransactions = createSelector(
  [selectFilteredTransactions, selectTransactionPagination],
  (transactions, pagination) => {
    const start = pagination.currentPage * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return transactions.slice(start, end);
  }
);

// Transactions by category
export const selectTransactionsByCategory = createSelector(
  [selectFilteredTransactions],
  (transactions) => {
    const groupedByCategory: { [key: string]: ITransaction[] } = {};
    
    transactions.forEach((transaction: ITransaction) => {
      if (!groupedByCategory[transaction.category]) {
        groupedByCategory[transaction.category] = [];
      }
      groupedByCategory[transaction.category].push(transaction);
    });
    
    return groupedByCategory;
  }
);

// Recent transactions (last 10)
export const selectRecentTransactions = createSelector(
  [selectAllTransactions],
  (transactions) => transactions.slice(0, 10)
);

// Monthly transaction data for charts
export const selectMonthlyTransactionData = createSelector(
  [selectFilteredTransactions],
  (transactions) => {
    const monthlyData: { [key: string]: { income: number; expense: number; total: number } } = {};
    
    transactions.forEach((transaction: ITransaction) => {
      const date = new Date(transaction.dataTransaction);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, total: 0 };
      }
      
      if (transaction.category === 'Saque') {
        monthlyData[monthKey].expense += transaction.value;
      } else {
        monthlyData[monthKey].income += transaction.value;
      }
      
      monthlyData[monthKey].total = monthlyData[monthKey].income - monthlyData[monthKey].expense;
    });
    
    return monthlyData;
  }
);

// UI selectors
export const selectTheme = createSelector(
  [selectUIState],
  (ui) => ui.theme
);

export const selectIsConnected = createSelector(
  [selectUIState],
  (ui) => ui.isConnected
);

export const selectNotifications = createSelector(
  [selectUIState],
  (ui) => ui.notifications
);

export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter((n: any) => Date.now() - n.timestamp < 300000) // 5 minutes
);

export const selectModals = createSelector(
  [selectUIState],
  (ui) => ui.modals
);

export const selectIsModalOpen = (modalName: string) => createSelector(
  [selectModals],
  (modals) => modals[modalName] || false
);

export const selectLoading = createSelector(
  [selectUIState],
  (ui) => ui.loading
);

export const selectGlobalLoading = createSelector(
  [selectLoading],
  (loading) => loading.global
);

export const selectIsLoading = (key: string) => createSelector(
  [selectLoading],
  (loading) => loading[key] || false
);

export const selectSnackbar = createSelector(
  [selectUIState],
  (ui) => ui.snackbar
);

// Combined selectors
export const selectDashboardData = createSelector(
  [selectTransactionStatistics, selectRecentTransactions, selectMonthlyTransactionData],
  (statistics, recentTransactions, monthlyData) => ({
    statistics,
    recentTransactions,
    monthlyData,
  })
);

export const selectAppLoadingState = createSelector(
  [selectAuthLoading, selectTransactionLoading, selectGlobalLoading],
  (authLoading, transactionLoading, globalLoading) => 
    authLoading || transactionLoading || globalLoading
);

export const selectHasErrors = createSelector(
  [selectAuthError, selectTransactionError],
  (authError, transactionError) => !!(authError || transactionError)
);