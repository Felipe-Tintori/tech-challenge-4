import { useCallback, useRef, useEffect } from 'react';
import { useSmartCache } from './useSmartCache';

/**
 * Configuração de pre-fetch
 */
interface PrefetchConfig {
  /**
   * Prioridade do pre-fetch (maior = mais prioritário)
   */
  priority?: number;
  /**
   * Se deve fazer pre-fetch em segundo plano
   */
  background?: boolean;
  /**
   * Timeout para o pre-fetch (ms)
   */
  timeout?: number;
  /**
   * Se deve refazer pre-fetch quando os dados expiram
   */
  autoRefetch?: boolean;
}

/**
 * Item na fila de pre-fetch
 */
interface PrefetchQueueItem<T> {
  key: string;
  fetchFn: () => Promise<T>;
  priority: number;
  config: PrefetchConfig;
  addedAt: number;
}

/**
 * Hook para pre-fetch inteligente de dados
 * Gerencia uma fila de prioridade para pré-carregar dados
 */
export function useSmartPrefetch<T = any>() {
  const cache = useSmartCache<T>({
    ttl: 10 * 60 * 1000, // 10 minutos para dados pre-fetched
    maxRetries: 2,
    retryDelay: 2000,
  });

  const prefetchQueue = useRef<PrefetchQueueItem<T>[]>([]);
  const isPrefetching = useRef(false);
  const prefetchedKeys = useRef<Set<string>>(new Set());

  /**
   * Adiciona item à fila de pre-fetch
   */
  const schedulePrefetch = useCallback((
    key: string,
    fetchFn: () => Promise<T>,
    config: PrefetchConfig = {}
  ) => {
    const {
      priority = 0,
      background = true,
      timeout = 5000,
      autoRefetch = false,
    } = config;

    // Verifica se já está em cache válido
    const cached = cache.getCached(key);
    if (cached && !autoRefetch) {
      console.log(`⚡ Pre-fetch: ${key} já está em cache`);
      return;
    }

    // Verifica se já está na fila
    const existingIndex = prefetchQueue.current.findIndex(item => item.key === key);
    if (existingIndex !== -1) {
      // Atualiza prioridade se for maior
      if (priority > prefetchQueue.current[existingIndex].priority) {
        prefetchQueue.current[existingIndex].priority = priority;
        // Reordena fila
        prefetchQueue.current.sort((a, b) => b.priority - a.priority);
      }
      return;
    }

    const item: PrefetchQueueItem<T> = {
      key,
      fetchFn,
      priority,
      config,
      addedAt: Date.now(),
    };

    prefetchQueue.current.push(item);
    // Ordena por prioridade (maior primeiro)
    prefetchQueue.current.sort((a, b) => b.priority - a.priority);

    console.log(`📋 Pre-fetch agendado: ${key} (prioridade: ${priority})`);

    if (!background) {
      processPrefetchQueue();
    }
  }, [cache]);

  /**
   * Processa a fila de pre-fetch
   */
  const processPrefetchQueue = useCallback(async () => {
    if (isPrefetching.current || prefetchQueue.current.length === 0) {
      return;
    }

    isPrefetching.current = true;
    console.log(`🚀 Processando ${prefetchQueue.current.length} itens na fila de pre-fetch`);

    while (prefetchQueue.current.length > 0) {
      const item = prefetchQueue.current.shift();
      if (!item) continue;

      try {
        // Verifica timeout
        const timeInQueue = Date.now() - item.addedAt;
        if (timeInQueue > item.config.timeout!) {
          console.warn(`⏱️ Pre-fetch timeout: ${item.key}`);
          continue;
        }

        console.log(`⚡ Pre-fetching: ${item.key}`);
        const data = await Promise.race([
          item.fetchFn(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), item.config.timeout)
          ),
        ]);

        cache.setCached(item.key, data);
        prefetchedKeys.current.add(item.key);
        console.log(`✅ Pre-fetch completo: ${item.key}`);
      } catch (error) {
        console.error(`❌ Pre-fetch falhou: ${item.key}`, error);
      }

      // Pequena pausa entre pre-fetches para não bloquear a thread
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    isPrefetching.current = false;
    console.log(`✨ Fila de pre-fetch processada`);
  }, [cache]);

  /**
   * Pre-fetch com prioridade alta (executa imediatamente)
   */
  const prefetchNow = useCallback(async (
    key: string,
    fetchFn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      // Verifica cache primeiro
      const cached = cache.getCached(key);
      if (cached) {
        return cached;
      }

      console.log(`⚡ Pre-fetch imediato: ${key}`);
      const data = await fetchFn();
      cache.setCached(key, data);
      prefetchedKeys.current.add(key);
      return data;
    } catch (error) {
      console.error(`❌ Pre-fetch imediato falhou: ${key}`, error);
      return null;
    }
  }, [cache]);

  /**
   * Pre-fetch de múltiplos itens
   */
  const prefetchBatch = useCallback((
    items: Array<{
      key: string;
      fetchFn: () => Promise<T>;
      priority?: number;
    }>
  ) => {
    items.forEach(({ key, fetchFn, priority }) => {
      schedulePrefetch(key, fetchFn, { priority, background: true });
    });

    // Inicia processamento
    processPrefetchQueue();
  }, [schedulePrefetch, processPrefetchQueue]);

  /**
   * Limpa a fila de pre-fetch
   */
  const clearPrefetchQueue = useCallback(() => {
    prefetchQueue.current = [];
    console.log('🗑️ Fila de pre-fetch limpa');
  }, []);

  /**
   * Obtém estatísticas de pre-fetch
   */
  const getPrefetchStats = useCallback(() => {
    return {
      queueLength: prefetchQueue.current.length,
      isPrefetching: isPrefetching.current,
      prefetchedCount: prefetchedKeys.current.size,
      nextPriority: prefetchQueue.current[0]?.priority ?? null,
      cacheStats: cache.getCacheStats(),
    };
  }, [cache]);

  /**
   * Auto-processa fila em background
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (prefetchQueue.current.length > 0 && !isPrefetching.current) {
        processPrefetchQueue();
      }
    }, 2000); // Verifica a cada 2 segundos

    return () => clearInterval(interval);
  }, [processPrefetchQueue]);

  return {
    // Funções principais
    schedulePrefetch,
    prefetchNow,
    prefetchBatch,
    
    // Controle
    processPrefetchQueue,
    clearPrefetchQueue,
    
    // Estado
    isPrefetching: isPrefetching.current,
    queueLength: prefetchQueue.current.length,
    
    // Estatísticas
    getPrefetchStats,
    
    // Cache
    getCached: cache.getCached,
    clearCache: cache.clearCache,
  };
}

/**
 * Hook para pre-fetch baseado em interação do usuário
 * Pre-carrega dados quando o usuário interage com elementos
 */
export function useInteractionPrefetch<T = any>() {
  const prefetch = useSmartPrefetch<T>();

  /**
   * Pre-fetch quando usuário faz hover
   */
  const onHoverPrefetch = useCallback((
    key: string,
    fetchFn: () => Promise<T>
  ) => {
    prefetch.schedulePrefetch(key, fetchFn, {
      priority: 5, // Alta prioridade para hover
      background: true,
    });
  }, [prefetch]);

  /**
   * Pre-fetch quando usuário foca em input
   */
  const onFocusPrefetch = useCallback((
    key: string,
    fetchFn: () => Promise<T>
  ) => {
    prefetch.schedulePrefetch(key, fetchFn, {
      priority: 7, // Prioridade muito alta para focus
      background: false, // Executa imediatamente
    });
  }, [prefetch]);

  /**
   * Pre-fetch quando usuário navega
   */
  const onNavigationPrefetch = useCallback((
    keys: string[],
    fetchFns: Array<() => Promise<T>>
  ) => {
    const items = keys.map((key, index) => ({
      key,
      fetchFn: fetchFns[index],
      priority: 3, // Prioridade média para navegação
    }));
    
    prefetch.prefetchBatch(items);
  }, [prefetch]);

  return {
    ...prefetch,
    onHoverPrefetch,
    onFocusPrefetch,
    onNavigationPrefetch,
  };
}
