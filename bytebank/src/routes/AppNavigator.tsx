import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen, RegistrationScreen } from "../features/auth";
import { HomeScreen } from "../features/home";
import { useAuth } from "../store/hooks/useAuth";
import { useFirebaseAuthSync } from "../shared/hooks/useAdvancedState";
import { useFirebaseTransactionSync } from "../shared/hooks/useFirebaseTransactionSync";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { isAuthenticated, loadUser } = useAuth();
  
  // Sincroniza automaticamente com Firebase
  useFirebaseAuthSync();
  
  // Sincroniza transações em tempo real
  useFirebaseTransactionSync();

  // Carrega usuário do storage ao iniciar
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "Home" : "Login"}>
        {isAuthenticated ? (
          // Usuário logado - apenas Home
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Usuário não logado - Login e Registro
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Registration"
              component={RegistrationScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
