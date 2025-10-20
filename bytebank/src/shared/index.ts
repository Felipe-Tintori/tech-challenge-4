// Shared module exports

// Components
export { default as BytebankButton } from './components/button';
export { default as BytebankInput } from './components/input';
export { default as BytebankHeader } from './components/header';
export { default as BytebankSnackbar } from './components/snackBar';
export { default as BytebankLoading } from './components/loading';
export { default as BytebankSelect } from './components/select';
export { default as BytebankDatePicker } from './components/datePicker';
export { default as BytebankFileUpload } from './components/fileUpload';
export { default as BytebankDrawerSection } from './components/drawer';

// Hooks
export { useSnackBar } from './hooks/useSnackBar';
export { useNavigator } from './hooks/useNavigator';
export { useCategories } from './hooks/useCategories';
export { usePaymentMethods } from './hooks/usePaymentMethods';

// Advanced state management hooks
export { useFirebaseAuthSync, useTransactionAutoRefresh, useOptimisticTransaction } from './hooks/useAdvancedState';
export { useSmartCache, useBackgroundSync } from './hooks/useSmartCache';
export { 
  useVirtualization, 
  useDebounce, 
  useThrottle, 
  useOptimizedPagination, 
  useIntersectionObserver,
  useMemoryOptimization 
} from './hooks/usePerformance';