import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { selectAllTransactions, selectTransactionLoading } from '../../store/selectors';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import { ITransaction } from '../../interface/transaction';

interface VirtualizationConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

/**
 * Hook for virtual scrolling of large lists
 */
export const useVirtualization = <T>(
  items: T[],
  config: VirtualizationConfig
) => {
  const { itemHeight, containerHeight, overscan = 5 } = config;
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

    return {
      startIndex,
      endIndex,
      visibleStart,
      visibleEnd,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((event: any) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
  };
};

/**
 * Hook for debounced values
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttled functions
 */
export const useThrottle = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Hook for pagination with performance optimization
 */
export const useOptimizedPagination = (pageSize: number = 20) => {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector(selectAllTransactions) as ITransaction[];
  const loading = useAppSelector(selectTransactionLoading);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set([1]));
  
  // Cache for paginated data
  const paginatedCache = useRef<Map<number, any[]>>(new Map());

  const totalPages = Math.ceil(transactions.length / pageSize);

  const currentPageData = useMemo(() => {
    const cacheKey = currentPage;
    
    if (paginatedCache.current.has(cacheKey)) {
      return paginatedCache.current.get(cacheKey);
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageData = transactions.slice(startIndex, endIndex);
    
    paginatedCache.current.set(cacheKey, pageData);
    return pageData;
  }, [transactions, currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setLoadedPages(prev => new Set(prev).add(page));
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Preload adjacent pages for smooth navigation
  const preloadAdjacentPages = useCallback(() => {
    const pagesToPreload = [currentPage - 1, currentPage + 1].filter(
      page => page >= 1 && page <= totalPages && !loadedPages.has(page)
    );

    pagesToPreload.forEach(page => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageData = transactions.slice(startIndex, endIndex);
      paginatedCache.current.set(page, pageData);
    });
  }, [currentPage, totalPages, pageSize, transactions, loadedPages]);

  useEffect(() => {
    preloadAdjacentPages();
  }, [preloadAdjacentPages]);

  // Clear cache when transactions change
  useEffect(() => {
    paginatedCache.current.clear();
    setLoadedPages(new Set([currentPage]));
  }, [transactions.length, currentPage]);

  return {
    currentPage,
    currentPageData,
    totalPages,
    loading,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * Hook for intersection observer (infinite scroll)
 */
export const useIntersectionObserver = (
  callback: () => void,
  options: IntersectionObserverInit = {}
) => {
  const targetRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { threshold = 0, rootMargin = '0px' } = options;

  useEffect(() => {
    if (!targetRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(targetRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, threshold, rootMargin]);

  return targetRef;
};

/**
 * Hook for memory usage optimization
 */
export const useMemoryOptimization = () => {
  const cleanupTasks = useRef<Array<() => void>>([]);

  const addCleanupTask = useCallback((task: () => void) => {
    cleanupTasks.current.push(task);
  }, []);

  const runCleanup = useCallback(() => {
    cleanupTasks.current.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    cleanupTasks.current = [];
  }, []);

  useEffect(() => {
    // Run cleanup on unmount
    return () => {
      runCleanup();
    };
  }, [runCleanup]);

  // Detect memory pressure (if available)
  useEffect(() => {
    const handleMemoryPressure = () => {
      console.log('Memory pressure detected, running cleanup...');
      runCleanup();
    };

    // Modern browsers may support this
    if ('memory' in performance) {
      const checkMemory = () => {
        const memInfo = (performance as any).memory;
        const usage = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        
        if (usage > 0.8) { // 80% memory usage
          handleMemoryPressure();
        }
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30s
      
      return () => clearInterval(interval);
    }
  }, [runCleanup]);

  return {
    addCleanupTask,
    runCleanup,
  };
};