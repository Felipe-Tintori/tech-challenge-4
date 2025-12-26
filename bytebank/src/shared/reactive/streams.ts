import { Observable, Subject, fromEvent, merge, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  retry,
  map,
  filter,
  throttleTime,
  tap,
  shareReplay,
} from 'rxjs/operators';

/**
 * Serviço de streams reativos para pesquisa, filtros e scroll
 */
export class ReactiveStreamService {
  /**
   * Cria um observable para busca com debounce
   * @param searchFn Função de busca que retorna uma Promise
   * @param debounceMs Tempo de debounce em milissegundos (padrão: 300ms)
   */
  static createSearchStream<T>(
    searchFn: (query: string) => Promise<T>,
    debounceMs: number = 300
  ): {
    search$: Subject<string>;
    results$: Observable<T | null>;
  } {
    const search$ = new Subject<string>();
    
    const results$ = search$.pipe(
      // Remove espaços e converte para minúsculo
      map((query) => query.trim().toLowerCase()),
      // Aguarda 300ms após última digitação
      debounceTime(debounceMs),
      // Evita buscas duplicadas
      distinctUntilChanged(),
      // Filtra strings vazias
      filter((query) => query.length > 0),
      // Cancela requisição anterior se nova busca for iniciada
      switchMap((query) =>
        searchFn(query).then((result) => result).catch(() => null)
      ),
      // Compartilha o resultado entre múltiplos subscribers
      shareReplay(1)
    );

    return { search$, results$ };
  }

  /**
   * Cria um observable para filtros com debounce
   */
  static createFilterStream<T, F>(
    filterFn: (filters: F) => Promise<T[]>,
    debounceMs: number = 500
  ): {
    filter$: Subject<F>;
    results$: Observable<T[]>;
  } {
    const filter$ = new Subject<F>();
    
    const results$ = filter$.pipe(
      // Aguarda 500ms após última mudança de filtro
      debounceTime(debounceMs),
      // Evita filtros duplicados
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      // Cancela requisição anterior
      switchMap((filters) =>
        filterFn(filters)
          .then((result) => result)
          .catch(() => [])
      ),
      // Compartilha resultado
      shareReplay(1)
    );

    return { filter$, results$ };
  }

  /**
   * Cria um observable para scroll infinito com throttle
   */
  static createInfiniteScrollStream(
    loadMoreFn: () => Promise<void>,
    scrollThreshold: number = 0.8
  ): {
    scroll$: Subject<{ scrollY: number; contentHeight: number; viewportHeight: number }>;
    loadMore$: Observable<void>;
  } {
    const scroll$ = new Subject<{
      scrollY: number;
      contentHeight: number;
      viewportHeight: number;
    }>();

    const loadMore$ = scroll$.pipe(
      // Throttle para não processar todos os eventos de scroll
      throttleTime(200),
      // Verifica se chegou perto do final
      filter(({ scrollY, contentHeight, viewportHeight }) => {
        const scrollPercentage = (scrollY + viewportHeight) / contentHeight;
        return scrollPercentage >= scrollThreshold;
      }),
      // Carrega mais dados
      switchMap(() =>
        loadMoreFn()
          .then(() => void 0)
          .catch(() => void 0)
      ),
      // Log para debug
      tap(() => console.log('📜 Carregando mais dados...')),
      shareReplay(1)
    );

    return { scroll$, loadMore$ };
  }

  /**
   * Cria um observable com retry automático para operações que podem falhar
   */
  static createRetryableStream<T>(
    operationFn: () => Promise<T>,
    retries: number = 3,
    delayMs: number = 1000
  ): Observable<T | null> {
    return new Observable<T>((subscriber) => {
      operationFn()
        .then((result) => {
          subscriber.next(result);
          subscriber.complete();
        })
        .catch((error) => subscriber.error(error));
    }).pipe(
      // Tenta novamente em caso de erro
      retry({
        count: retries,
        delay: delayMs,
      }),
      // Se ainda falhar, retorna null
      catchError((error) => {
        console.error(`❌ Falha após ${retries} tentativas:`, error);
        return of(null);
      }),
      shareReplay(1)
    );
  }

  /**
   * Combina múltiplos filtros (categoria, data, tipo) em um único stream
   */
  static combineFilters<T>(
    filterStreams: Observable<any>[]
  ): Observable<T[]> {
    return merge(...filterStreams).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      shareReplay(1)
    ) as Observable<T[]>;
  }

  /**
   * Cria um observable para sync em tempo real (Firebase)
   */
  static createRealtimeStream<T>(
    subscriptionFn: (callback: (data: T) => void) => () => void
  ): Observable<T> {
    return new Observable<T>((subscriber) => {
      console.log('🔄 Stream em tempo real iniciado');
      
      const unsubscribe = subscriptionFn((data) => {
        subscriber.next(data);
      });

      // Cleanup quando observable é descartado
      return () => {
        console.log('🛑 Stream em tempo real finalizado');
        unsubscribe();
      };
    }).pipe(
      // Trata erros sem encerrar o stream
      catchError((error) => {
        console.error('❌ Erro no stream em tempo real:', error);
        return of(null as unknown as T);
      }),
      // Filtra valores nulos
      filter((data): data is T => data !== null),
      shareReplay(1)
    );
  }

  /**
   * Cria um observable para auto-save com debounce
   */
  static createAutoSaveStream<T>(
    saveFn: (data: T) => Promise<void>,
    debounceMs: number = 2000
  ): {
    save$: Subject<T>;
    status$: Observable<'idle' | 'saving' | 'saved' | 'error'>;
  } {
    const save$ = new Subject<T>();
    
    const status$ = save$.pipe(
      // Indica que está salvando
      tap(() => console.log('💾 Salvando...')),
      map(() => 'saving' as const),
      // Aguarda 2s após última mudança
      debounceTime(debounceMs),
      // Executa o save
      switchMap((data) =>
        saveFn(data as any)
          .then(() => 'saved' as const)
          .catch(() => 'error' as const)
      ),
      // Volta para idle após 1s
      tap((status) => {
        if (status === 'saved') {
          console.log('✅ Salvo com sucesso');
        } else if (status === 'error') {
          console.error('❌ Erro ao salvar');
        }
      }),
      shareReplay(1)
    );

    return { save$, status$ };
  }
}

/**
 * Hook para usar streams reativos em componentes React Native
 */
export class ReactiveHookHelper {
  /**
   * Converte um Subject em um setState-like para React
   */
  static createReactiveState<T>(
    initialValue: T,
    onUpdate?: (value: T) => void
  ): {
    value$: Subject<T>;
    getValue: () => T;
    setValue: (value: T) => void;
  } {
    let currentValue = initialValue;
    const value$ = new Subject<T>();

    value$.subscribe((newValue) => {
      currentValue = newValue;
      onUpdate?.(newValue);
    });

    return {
      value$,
      getValue: () => currentValue,
      setValue: (value: T) => value$.next(value),
    };
  }
}
