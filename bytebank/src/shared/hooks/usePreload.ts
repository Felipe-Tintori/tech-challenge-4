import { useEffect, useRef, useCallback } from 'react';
import { useCategories } from './useCategories';
import { usePaymentMethods } from './usePaymentMethods';

/**
 * Estado de pré-carregamento
 */
interface PreloadState {
  categories: boolean;
  paymentMethods: boolean;
  isPreloading: boolean;
  isComplete: boolean;
}

/**
 * Hook para pré-carregamento de dados críticos
 * Carrega categorias e métodos de pagamento em background
 * 
 * @returns Estado do pré-carregamento e funções de controle
 */
export function usePreload() {
  const { categories, loading: categoriesLoading } = useCategories();
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
  
  const preloadStateRef = useRef<PreloadState>({
    categories: false,
    paymentMethods: false,
    isPreloading: true,
    isComplete: false,
  });

  // Atualiza estado de pré-carregamento
  useEffect(() => {
    const categoriesLoaded = !categoriesLoading && categories.length > 0;
    const paymentMethodsLoaded = !paymentMethodsLoading && paymentMethods.length > 0;
    
    preloadStateRef.current = {
      categories: categoriesLoaded,
      paymentMethods: paymentMethodsLoaded,
      isPreloading: categoriesLoading || paymentMethodsLoading,
      isComplete: categoriesLoaded && paymentMethodsLoaded,
    };

    if (preloadStateRef.current.isComplete) {
      console.log('✅ Pré-carregamento concluído:', {
        categories: categories.length,
        paymentMethods: paymentMethods.length,
      });
    }
  }, [categories, paymentMethods, categoriesLoading, paymentMethodsLoading]);

  return {
    isPreloading: categoriesLoading || paymentMethodsLoading,
    isComplete: preloadStateRef.current.isComplete,
    categoriesLoaded: preloadStateRef.current.categories,
    paymentMethodsLoaded: preloadStateRef.current.paymentMethods,
    categories,
    paymentMethods,
  };
}

/**
 * Hook para pré-carregamento com callback
 * Executa uma função quando o pré-carregamento for concluído
 * 
 * @param onComplete - Callback executado quando o pré-carregamento termina
 */
export function usePreloadWithCallback(onComplete?: () => void) {
  const preloadState = usePreload();
  const callbackExecutedRef = useRef(false);

  useEffect(() => {
    if (preloadState.isComplete && !callbackExecutedRef.current && onComplete) {
      callbackExecutedRef.current = true;
      onComplete();
    }
  }, [preloadState.isComplete, onComplete]);

  return preloadState;
}

/**
 * Hook para pré-carregamento progressivo
 * Permite executar ações conforme cada recurso é carregado
 * 
 * @param callbacks - Callbacks para cada recurso carregado
 */
export function useProgressivePreload(callbacks?: {
  onCategoriesLoaded?: () => void;
  onPaymentMethodsLoaded?: () => void;
  onComplete?: () => void;
}) {
  const preloadState = usePreload();
  const executedCallbacksRef = useRef({
    categories: false,
    paymentMethods: false,
    complete: false,
  });

  useEffect(() => {
    // Callback para categorias
    if (
      preloadState.categoriesLoaded &&
      !executedCallbacksRef.current.categories &&
      callbacks?.onCategoriesLoaded
    ) {
      executedCallbacksRef.current.categories = true;
      callbacks.onCategoriesLoaded();
    }

    // Callback para métodos de pagamento
    if (
      preloadState.paymentMethodsLoaded &&
      !executedCallbacksRef.current.paymentMethods &&
      callbacks?.onPaymentMethodsLoaded
    ) {
      executedCallbacksRef.current.paymentMethods = true;
      callbacks.onPaymentMethodsLoaded();
    }

    // Callback para conclusão
    if (
      preloadState.isComplete &&
      !executedCallbacksRef.current.complete &&
      callbacks?.onComplete
    ) {
      executedCallbacksRef.current.complete = true;
      callbacks.onComplete();
    }
  }, [
    preloadState.categoriesLoaded,
    preloadState.paymentMethodsLoaded,
    preloadState.isComplete,
    callbacks,
  ]);

  return preloadState;
}

/**
 * Hook para forçar pré-carregamento prioritário
 * Útil quando você precisa garantir que os dados estão carregados
 */
export function usePriorityPreload() {
  const preloadState = usePreload();
  const priorityRequestedRef = useRef(false);

  const requestPriorityLoad = useCallback(() => {
    if (!priorityRequestedRef.current) {
      priorityRequestedRef.current = true;
      console.log('🚀 Pré-carregamento prioritário solicitado');
    }
  }, []);

  return {
    ...preloadState,
    requestPriorityLoad,
    isPriorityRequested: priorityRequestedRef.current,
  };
}
