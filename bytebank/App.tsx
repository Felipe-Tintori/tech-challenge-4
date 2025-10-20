import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/routes/AppNavigator";
import { UserProvider } from "./src/context/UserContext";
import { TransactionProvider } from "./src/context/TransactionContext";

export default function App() {
  return (
    <UserProvider>
      <TransactionProvider>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </TransactionProvider>
    </UserProvider>
  );
}
