import { configureStore, combineReducers, Middleware, AnyAction } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createEpicMiddleware } from 'redux-observable';

// Reducers
import authReducer from './slices/authSlice';
import transactionReducer from './slices/transactionSlice';
import uiReducer from './slices/uiSlice';

// Middleware
import { 
  performanceMiddleware, 
  loggingMiddleware, 
  errorMiddleware, 
  analyticsMiddleware 
} from './middleware/simpleMiddleware';

// Reactive Programming - Redux Observable
import { rootEpic } from '../shared/reactive';

// Persist config
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'ui'], // Only persist auth and ui states
  blacklist: ['transactions'], // Don't persist transactions (real-time data)
};

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  transactions: transactionReducer,
  ui: uiReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create epic middleware for reactive programming
const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, any>();

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      epicMiddleware, // Redux Observable para programação reativa
      performanceMiddleware,
      loggingMiddleware,
      errorMiddleware,
      analyticsMiddleware
    ),
  devTools: __DEV__,
});

// Inicializa os epics após criar o store
epicMiddleware.run(rootEpic);

console.log('🚀 Redux Store configurado com Redux Observable');

// Persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks (will create these in hooks file)
export default store;