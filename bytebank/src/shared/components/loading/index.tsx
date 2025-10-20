// src/shared/components/loading/index.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { ActivityIndicator, Portal, Text } from "react-native-paper";
import { colors } from "../../../styles/globalSltyles";

interface BytebankLoadingProps {
  visible: boolean;
  message?: string;
}

export default function BytebankLoading({
  visible,
  message = "Carregando...",
}: BytebankLoadingProps) {
  if (!visible) return null;

  return (
    <Portal>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.spinner}
          />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Portal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  container: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 120,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: colors.text,
    fontWeight: "500",
  },
});
