import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { LazyLoadFallback } from './LazyLoadFallback';

interface LazySuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fallbackMessage?: string;
}

/**
 * Wrapper customizado para Suspense com fallback padrão
 * Facilita o uso de lazy loading em toda a aplicação
 */
export const LazySuspense: React.FC<LazySuspenseProps> = ({ 
  children, 
  fallback,
  fallbackMessage 
}) => {
  const defaultFallback = fallback || <LazyLoadFallback message={fallbackMessage} />;
  
  return (
    <Suspense fallback={defaultFallback}>
      {children}
    </Suspense>
  );
};

/**
 * HOC para criar componentes lazy com retry automático
 * @param importFunc - Função de importação dinâmica
 * @param retries - Número de tentativas em caso de falha
 * @returns Componente lazy com retry
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries = 3
): LazyExoticComponent<T> {
  return React.lazy(async () => {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await importFunc();
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentativa ${i + 1} de ${retries} falhou ao carregar componente:`, error);
        
        // Aguarda um pouco antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    
    throw lastError || new Error('Falha ao carregar componente após múltiplas tentativas');
  });
}

/**
 * Função para pré-carregar componentes lazy
 * Útil para preload de componentes que serão usados em breve
 * @param lazyComponent - Componente lazy a ser pré-carregado
 */
export function preloadComponent<T extends ComponentType<any>>(
  lazyComponent: LazyExoticComponent<T>
): void {
  // React.lazy retorna um objeto com _payload que contém a promise de importação
  const payload = (lazyComponent as any)._payload;
  
  if (payload && typeof payload === 'function') {
    payload();
  }
}
