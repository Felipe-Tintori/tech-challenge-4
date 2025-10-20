import React from "react";
import { Button } from "react-native-paper";
import { styles } from "./styles";

interface BytebankButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export default function BytebankButton({
  onPress,
  children,
  disabled = false,
  loading = false,
}: BytebankButtonProps) {
  return (
    <Button
      mode="contained-tonal"
      contentStyle={styles.button}
      onPress={onPress}
      disabled={disabled}
      loading={loading}
    >
      {children}
    </Button>
  );
}
