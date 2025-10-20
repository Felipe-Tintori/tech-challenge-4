import { useCallback, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTransactionError, selectTransactionLoading } from '../../store/selectors';

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxRetries?: number;
  retryDelay?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Hook for intelligent caching with retry logic
 */
export const useSmartCache = <T>(config: CacheConfig = {}) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    maxRetries = 3,
    retryDelay = 1000,
  } = config;

  const dispatch = useAppDispatch();
  const error = useAppSelector(selectTransactionError);
  const loading = useAppSelector(selectTransactionLoading);
  
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map());
  const retryCount = useRef<Map<string, number>>(new Map());
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const isExpired = useCallback((entry: CacheEntry<T>): boolean => {
    return Date.now() > entry.expiresAt;
  }, []);

  const getCached = useCallback((key: string): T | null => {
    const entry = cache.current.get(key);
    if (entry && !isExpired(entry)) {
      return entry.data;
    }
    
    // Remove expired entry
    if (entry && isExpired(entry)) {
      cache.current.delete(key);
    }
    
    return null;
  }, [isExpired]);

  const setCached = useCallback((key: string, data: T): void => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    };
    cache.current.set(key, entry);
    
    // Reset retry count on successful cache
    retryCount.current.delete(key);
  }, [ttl]);

  const executeWithRetry = useCallback(async (
    key: string,
    action: () => Promise<T>
  ): Promise<T> => {
    const currentRetries = retryCount.current.get(key) || 0;
    
    try {
      const result = await action();
      setCached(key, result);
      return result;
    } catch (err) {
      if (currentRetries < maxRetries) {
        const nextRetryCount = currentRetries + 1;
        retryCount.current.set(key, nextRetryCount);
        
        const timeout = setTimeout(() => {
          retryTimeouts.current.delete(key);
          executeWithRetry(key, action);
        }, retryDelay * nextRetryCount);
        
        retryTimeouts.current.set(key, timeout);
        
        console.warn(`Retry ${nextRetryCount}/${maxRetries} for ${key} in ${retryDelay * nextRetryCount}ms`);
      } else {
        console.error(`Max retries exceeded for ${key}:`, err);
        retryCount.current.delete(key);
      }
      throw err;
    }
  }, [maxRetries, retryDelay, setCached]);

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of cache.current) {
        if (regex.test(key)) {
          cache.current.delete(key);
        }
      }
    } else {
      cache.current.clear();
    }
  }, []);

  const invalidateCache = useCallback((key: string) => {
    cache.current.delete(key);
    retryCount.current.delete(key);
    
    const timeout = retryTimeouts.current.get(key);
    if (timeout) {
      clearTimeout(timeout);
      retryTimeouts.current.delete(key);
    }
  }, []);

  const getCacheStats = useCallback(() => {
    const entries = Array.from(cache.current.entries());
    const now = Date.now();
    
    return {
      totalEntries: entries.length,
      validEntries: entries.filter(([, entry]) => !isExpired(entry)).length,
      expiredEntries: entries.filter(([, entry]) => isExpired(entry)).length,
      retryingEntries: retryCount.current.size,
      cacheHitRate: cache.current.size > 0 ? 
        (cache.current.size - retryCount.current.size) / cache.current.size : 0,
    };
  }, [isExpired]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all retry timeouts
      for (const [, timeout] of retryTimeouts.current) {
        clearTimeout(timeout);
      }
      retryTimeouts.current.clear();
    };
  }, []);

  return {
    getCached,
    setCached,
    executeWithRetry,
    clearCache,
    invalidateCache,
    getCacheStats,
    isLoading: loading,
    hasError: !!error,
  };
};

/**
 * Hook for background sync
 */
export const useBackgroundSync = () => {
  const syncQueue = useRef<Array<() => Promise<void>>>([]);
  const isSyncing = useRef(false);

  const addToSyncQueue = useCallback((syncAction: () => Promise<void>) => {
    syncQueue.current.push(syncAction);
  }, []);

  const processSyncQueue = useCallback(async () => {
    if (isSyncing.current || syncQueue.current.length === 0) {
      return;
    }

    isSyncing.current = true;

    try {
      while (syncQueue.current.length > 0) {
        const syncAction = syncQueue.current.shift();
        if (syncAction) {
          await syncAction();
        }
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    } finally {
      isSyncing.current = false;
    }
  }, []);

  // Process queue when coming back online
  useEffect(() => {
    const handleOnline = () => {
      processSyncQueue();
    };

    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [processSyncQueue]);

  return {
    addToSyncQueue,
    processSyncQueue,
    queueLength: syncQueue.current.length,
    isSyncing: isSyncing.current,
  };
};