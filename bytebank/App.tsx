import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/routes/AppNavigator";
import { UserProvider } from "./src/features/auth";
import { TransactionProvider } from "./src/features/transactions";

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
