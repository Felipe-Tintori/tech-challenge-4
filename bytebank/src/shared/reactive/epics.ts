import { Epic, combineEpics } from 'redux-observable';
import { Observable, of, from, timer } from 'rxjs';
import {
  filter,
  map,
  switchMap,
  catchError,
  debounceTime,
  retry,
  tap,
  throttleTime,
  mergeMap,
  takeUntil,
} from 'rxjs/operators';
import { Action } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

/**
 * Epic para busca de transações com debounce
 * Aguarda 500ms após última mudança de filtro antes de buscar
 */
export const searchTransactionsEpic: Epic<Action, Action, RootState> = (action$, state$) =>
  action$.pipe(
    filter((action: any) => action.type === 'transactions/setSearchQuery'),
    debounceTime(500),
    map((action: any) => action.payload),
    filter((query: string) => query.trim().length > 0),
    switchMap((query: string) =>
      // Aqui você chamaria a action de busca real
      of({ type: 'transactions/searchTransactions', payload: query })
    ),
    catchError((error) => {
      console.error('❌ Erro na busca de transações:', error);
      return of({ type: 'transactions/searchError', payload: error.message });
    })
  );

/**
 * Epic para filtros de transações com debounce
 */
export const filterTransactionsEpic: Epic<Action, Action, RootState> = (action$) =>
  action$.pipe(
    filter((action: any) => action.type === 'transactions/updateFilters'),
    debounceTime(300),
    map((action: any) => action.payload),
    switchMap((filters) =>
      of({ type: 'transactions/applyFilters', payload: filters })
    ),
    catchError((error) => {
      console.error('❌ Erro ao aplicar filtros:', error);
      return of({ type: 'transactions/filterError', payload: error.message });
    })
  );

/**
 * Epic para carregar mais transações (scroll infinito) com throttle
 */
export const loadMoreTransactionsEpic: Epic<Action, Action, RootState> = (action$, state$) =>
  action$.pipe(
    filter((action: any) => action.type === 'transactions/loadMore'),
    throttleTime(1000), // Previne chamadas muito frequentes
    switchMap(() => {
      const state = state$.value;
      const { page, hasMore, loading } = state.transactions;

      // Não carregar se já está carregando ou não há mais dados
      if (loading || !hasMore) {
        return of({ type: 'transactions/loadMoreSkipped' });
      }

      return of({ type: 'transactions/fetchTransactions', payload: { page: (page || 0) + 1 } });
    }),
    catchError((error) => {
      console.error('❌ Erro ao carregar mais transações:', error);
      return of({ type: 'transactions/loadMoreError', payload: error.message });
    })
  );

/**
 * Epic para retry automático em operações que falham
 */
export const retryFailedOperationsEpic: Epic<Action, Action, RootState> = (action$) =>
  action$.pipe(
    filter((action: any) => 
      action.type === 'transactions/createTransactionFailed' ||
      action.type === 'transactions/updateTransactionFailed' ||
      action.type === 'transactions/deleteTransactionFailed'
    ),
    tap(() => console.log('🔄 Tentando novamente...')),
    // Aguarda 2 segundos antes de tentar novamente
    switchMap((action: any) =>
      timer(2000).pipe(
        map(() => {
          // Remove o 'Failed' do tipo da action para retentar
          const retryType = action.type.replace('Failed', '');
          return { type: retryType, payload: action.payload };
        }),
        // Tenta até 3 vezes
        retry(3),
        catchError((error) => {
          console.error('❌ Falha após 3 tentativas:', error);
          return of({ type: 'transactions/operationGaveUp', payload: error.message });
        })
      )
    )
  );

/**
 * Epic para auto-save de rascunhos de transação
 */
export const autoSaveDraftEpic: Epic<Action, Action, RootState> = (action$) =>
  action$.pipe(
    filter((action: any) => action.type === 'transactions/updateDraft'),
    debounceTime(2000), // Salva 2s após última mudança
    map((action: any) => action.payload),
    tap(() => console.log('💾 Salvando rascunho...')),
    switchMap((draft) =>
      // Aqui você salvaria no AsyncStorage ou SecureStore
      of({ type: 'transactions/draftSaved', payload: draft })
    ),
    catchError((error) => {
      console.error('❌ Erro ao salvar rascunho:', error);
      return of({ type: 'transactions/draftSaveError', payload: error.message });
    })
  );

/**
 * Epic para sincronização em tempo real com Firebase
 */
export const realtimeSyncEpic: Epic<Action, Action, RootState> = (action$, state$) =>
  action$.pipe(
    filter((action: any) => action.type === 'auth/loginSuccess'),
    switchMap((action: any) => {
      const userId = action.payload.id;
      
      return new Observable<Action>((subscriber) => {
        console.log('🔄 Iniciando sync em tempo real...');
        
        // Aqui você configuraria o listener do Firebase
        // const unsubscribe = firestore()
        //   .collection('transactions')
        //   .where('userId', '==', userId)
        //   .onSnapshot((snapshot) => {
        //     subscriber.next({ type: 'transactions/realtimeUpdate', payload: snapshot.docs });
        //   });

        // Simulação
        const interval = setInterval(() => {
          subscriber.next({ type: 'transactions/realtimeUpdate', payload: [] } as Action);
        }, 5000);

        return () => {
          console.log('🛑 Finalizando sync em tempo real');
          clearInterval(interval);
        };
      }).pipe(
        takeUntil(action$.pipe(filter((a: any) => a.type === 'auth/logout'))),
        catchError((error) => {
          console.error('❌ Erro no sync em tempo real:', error);
          return of({ type: 'transactions/realtimeSyncError', payload: error.message } as Action);
        })
      );
    })
  );

/**
 * Epic para validação de transações antes de salvar
 */
export const validateTransactionEpic: Epic<Action, Action, RootState> = (action$) =>
  action$.pipe(
    filter((action: any) => action.type === 'transactions/validateAndCreate'),
    mergeMap((action: any) => {
      const transaction = action.payload;
      
      // Validações
      const errors: string[] = [];
      
      if (!transaction.description || transaction.description.trim().length === 0) {
        errors.push('Descrição é obrigatória');
      }
      
      if (!transaction.value || transaction.value <= 0) {
        errors.push('Valor deve ser maior que zero');
      }
      
      if (!transaction.category) {
        errors.push('Categoria é obrigatória');
      }

      if (errors.length > 0) {
        return of({ 
          type: 'transactions/validationFailed', 
          payload: { errors } 
        });
      }

      return of({ 
        type: 'transactions/createTransaction', 
        payload: transaction 
      });
    }),
    catchError((error) => {
      console.error('❌ Erro na validação:', error);
      return of({ type: 'transactions/validationError', payload: error.message });
    })
  );

/**
 * Epic para logging de ações (útil para debug)
 */
export const loggingEpic: Epic<Action, Action, RootState> = (action$) =>
  action$.pipe(
    tap((action) => {
      if (action.type.startsWith('transactions/') || action.type.startsWith('auth/')) {
        console.log('📊 Action:', action.type, action);
      }
    }),
    filter(() => false) // Não emite nenhuma action
  );

/**
 * Combina todos os epics em um root epic
 */
export const rootEpic = combineEpics(
  searchTransactionsEpic,
  filterTransactionsEpic,
  loadMoreTransactionsEpic,
  retryFailedOperationsEpic,
  autoSaveDraftEpic,
  realtimeSyncEpic,
  validateTransactionEpic,
  loggingEpic
);
