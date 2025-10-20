import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import AppNavigator from "./src/routes/AppNavigator";
import { ReduxProvider } from "./src/store/ReduxProvider";

export default function App() {
  return (
    <PaperProvider>
      <ReduxProvider>
        <AppNavigator />
      </ReduxProvider>
    </PaperProvider>
  );
}
