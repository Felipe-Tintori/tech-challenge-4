import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../store/hooks/useAuth";
import { useTransactions } from "../store/hooks/useTransactions";
import { useFirebaseAuthSync } from "../shared/hooks/useAdvancedState";
import { useFirebaseTransactionSync } from "../shared/hooks/useFirebaseTransactionSync";
import { usePreload } from "../shared/hooks/usePreload";
import { LazySuspense, lazyWithRetry, preloadComponent } from "../shared/components/lazyLoading";

// ⚡ LAZY LOADING: Carrega componentes sob demanda para reduzir bundle inicial
const LoginScreen = lazyWithRetry(() => 
  import("../features/auth").then(module => ({ default: module.LoginScreen }))
);

const RegistrationScreen = lazyWithRetry(() => 
  import("../features/auth").then(module => ({ default: module.RegistrationScreen }))
);

const HomeScreen = lazyWithRetry(() => 
  import("../features/home").then(module => ({ default: module.HomeScreen }))
);

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loadUser, user } = useAuth();
  const { loadTransactions } = useTransactions();
  
  // 📊 PRÉ-CARREGAMENTO: Carrega categorias e métodos de pagamento em background
  const { isPreloading, isComplete } = usePreload();
  
  // Sincroniza automaticamente com Firebase
  useFirebaseAuthSync();
  
  // Sincroniza transações em tempo real
  useFirebaseTransactionSync();

  // Carrega usuário do storage ao iniciar
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Carrega transações quando o usuário está autenticado
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      console.log('Carregando transações para usuário:', user._id);
      loadTransactions(user._id);
    }
  }, [isAuthenticated, user?._id, loadTransactions]);

  // 🚀 PRÉ-CARREGAMENTO: Preload de telas baseado no estado de autenticação
  useEffect(() => {
    if (isAuthenticated) {
      // Usuário logado: pré-carrega HomeScreen
      preloadComponent(HomeScreen);
    } else {
      // Usuário não logado: pré-carrega telas de auth
      preloadComponent(RegistrationScreen);
    }
  }, [isAuthenticated]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
        {isAuthenticated ? (
          // Usuário logado - apenas Home
          <Stack.Screen
            name="Home"
            options={{ headerShown: false }}
          >
            {() => (
              <LazySuspense fallbackMessage="Carregando início...">
                <HomeScreen />
              </LazySuspense>
            )}
          </Stack.Screen>
        ) : (
          // Usuário não logado - Login e Registro
          <>
            <Stack.Screen
              name="Login"
              options={{ headerShown: false }}
            >
              {() => (
                <LazySuspense fallbackMessage="Carregando login...">
                  <LoginScreen />
                </LazySuspense>
              )}
            </Stack.Screen>
            <Stack.Screen
              name="Registration"
              options={{ headerShown: false }}
            >
              {() => (
                <LazySuspense fallbackMessage="Carregando cadastro...">
                  <RegistrationScreen />
                </LazySuspense>
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
