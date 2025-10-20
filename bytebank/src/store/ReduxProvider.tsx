import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';
import SimpleLoading from '../shared/components/SimpleLoading';

interface ReduxProviderProps {
  children: ReactNode;
}

/**
 * Main Redux Provider component that wraps the entire app
 * Provides Redux store and persistence functionality
 */
export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate 
        loading={<SimpleLoading />} 
        persistor={persistor}
      >
        {children}
      </PersistGate>
    </Provider>
  );
};

export default ReduxProvider;