import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { setUser } from '../../store/slices/authSlice';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { selectUser, selectIsAuthenticated } from '../../store/selectors';

/**
 * Hook for managing Firebase Auth state synchronization with Redux
 */
export const useFirebaseAuthSync = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          _id: firebaseUser.uid,
          email: firebaseUser.email as string,
          name: firebaseUser.displayName as string,
        };
        dispatch(setUser(userData));
        
        // Load user's transactions when authenticated
        dispatch(fetchTransactions(firebaseUser.uid));
      } else {
        dispatch(setUser(null));
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
  };
};

/**
 * Hook for automatic transaction refresh
 */
export const useTransactionAutoRefresh = (intervalMs: number = 30000) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoRefresh = useCallback(() => {
    if (user && intervalMs > 0) {
      intervalRef.current = setInterval(() => {
        dispatch(fetchTransactions(user._id));
      }, intervalMs);
    }
  }, [dispatch, user, intervalMs]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoRefresh();
    
    return () => {
      stopAutoRefresh();
    };
  }, [startAutoRefresh, stopAutoRefresh]);

  return {
    startAutoRefresh,
    stopAutoRefresh,
  };
};

/**
 * Hook for optimistic updates
 */
export const useOptimisticTransaction = () => {
  const dispatch = useAppDispatch();
  
  const addTransactionOptimistic = useCallback(async (transactionData: any) => {
    // Add temporary transaction with optimistic ID
    const tempTransaction = {
      ...transactionData,
      id: `temp_${Date.now()}`,
      createdAt: new Date(),
      status: 'pending'
    };

    try {
      // Dispatch optimistic update
      // You could create a specific action for optimistic updates
      
      // Then dispatch the real action
      const result = await dispatch(fetchTransactions(transactionData.userId));
      
      return result;
    } catch (error) {
      // Rollback optimistic update on error
      console.error('Failed to add transaction:', error);
      throw error;
    }
  }, [dispatch]);

  return {
    addTransactionOptimistic,
  };
};