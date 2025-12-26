import { useState, useEffect, useRef } from 'react';
import { Subject, Observable } from 'rxjs';
import { ReactiveStreamService } from '../reactive';

/**
 * Hook para busca reativa com debounce
 * @param searchFn Função de busca
 * @param debounceMs Tempo de debounce (padrão: 300ms)
 */
export function useReactiveSearch<T>(
  searchFn: (query: string) => Promise<T>,
  debounceMs: number = 300
) {
  const [results, setResults] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<{
    search$: Subject<string>;
    results$: Observable<T | null>;
  } | null>(null);

  useEffect(() => {
    // Cria o stream na primeira renderização
    if (!streamRef.current) {
      streamRef.current = ReactiveStreamService.createSearchStream(searchFn, debounceMs);
    }

    // Subscribe nos resultados
    const subscription = streamRef.current.results$.subscribe({
      next: (data) => {
        setResults(data);
        setLoading(false);
      },
      error: (error) => {
        console.error('Erro na busca:', error);
        setLoading(false);
      },
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, [searchFn, debounceMs]);

  const search = (query: string) => {
    if (streamRef.current) {
      setLoading(true);
      streamRef.current.search$.next(query);
    }
  };

  return { results, loading, search };
}

/**
 * Hook para filtros reativos com debounce
 */
export function useReactiveFilter<T, F>(
  filterFn: (filters: F) => Promise<T[]>,
  debounceMs: number = 500
) {
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<{
    filter$: Subject<F>;
    results$: Observable<T[]>;
  } | null>(null);

  useEffect(() => {
    if (!streamRef.current) {
      streamRef.current = ReactiveStreamService.createFilterStream(filterFn, debounceMs);
    }

    const subscription = streamRef.current.results$.subscribe({
      next: (data) => {
        setResults(data);
        setLoading(false);
      },
      error: (error) => {
        console.error('Erro ao filtrar:', error);
        setLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [filterFn, debounceMs]);

  const applyFilter = (filters: F) => {
    if (streamRef.current) {
      setLoading(true);
      streamRef.current.filter$.next(filters);
    }
  };

  return { results, loading, applyFilter };
}

/**
 * Hook para scroll infinito reativo
 */
export function useReactiveInfiniteScroll(
  loadMoreFn: () => Promise<void>,
  scrollThreshold: number = 0.8
) {
  const [loading, setLoading] = useState(false);
  const streamRef = useRef<{
    scroll$: Subject<{ scrollY: number; contentHeight: number; viewportHeight: number }>;
    loadMore$: Observable<void>;
  } | null>(null);

  useEffect(() => {
    if (!streamRef.current) {
      streamRef.current = ReactiveStreamService.createInfiniteScrollStream(
        loadMoreFn,
        scrollThreshold
      );
    }

    const subscription = streamRef.current.loadMore$.subscribe({
      next: () => {
        setLoading(false);
      },
      error: (error) => {
        console.error('Erro ao carregar mais:', error);
        setLoading(false);
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadMoreFn, scrollThreshold]);

  const onScroll = (scrollY: number, contentHeight: number, viewportHeight: number) => {
    if (streamRef.current && !loading) {
      setLoading(true);
      streamRef.current.scroll$.next({ scrollY, contentHeight, viewportHeight });
    }
  };

  return { loading, onScroll };
}

/**
 * Hook para operações com retry automático
 */
export function useReactiveRetry<T>(
  operationFn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);

    const stream = ReactiveStreamService.createRetryableStream(operationFn, retries, delayMs);

    stream.subscribe({
      next: (result) => {
        setData(result);
        setLoading(false);
      },
      error: (err) => {
        setError(err.message);
        setLoading(false);
      },
    });
  };

  return { data, loading, error, execute };
}

/**
 * Hook para sync em tempo real
 */
export function useRealtimeStream<T>(
  subscriptionFn: (callback: (data: T) => void) => () => void,
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const stream = ReactiveStreamService.createRealtimeStream(subscriptionFn);
    setConnected(true);

    const subscription = stream.subscribe({
      next: (result) => {
        setData(result);
      },
      error: (error) => {
        console.error('Erro no stream em tempo real:', error);
        setConnected(false);
      },
    });

    return () => {
      subscription.unsubscribe();
      setConnected(false);
    };
  }, [subscriptionFn, enabled]);

  return { data, connected };
}

/**
 * Hook para auto-save com debounce
 */
export function useAutoSave<T>(
  saveFn: (data: T) => Promise<void>,
  debounceMs: number = 2000
) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const streamRef = useRef<{
    save$: Subject<T>;
    status$: Observable<'idle' | 'saving' | 'saved' | 'error'>;
  } | null>(null);

  useEffect(() => {
    if (!streamRef.current) {
      streamRef.current = ReactiveStreamService.createAutoSaveStream(saveFn, debounceMs);
    }

    const subscription = streamRef.current.status$.subscribe({
      next: (newStatus) => {
        setStatus(newStatus);
        
        // Volta para idle após 2s de salvo
        if (newStatus === 'saved') {
          setTimeout(() => setStatus('idle'), 2000);
        }
      },
      error: (error) => {
        console.error('Erro no auto-save:', error);
        setStatus('error');
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [saveFn, debounceMs]);

  const save = (data: T) => {
    if (streamRef.current) {
      streamRef.current.save$.next(data);
    }
  };

  return { status, save };
}
