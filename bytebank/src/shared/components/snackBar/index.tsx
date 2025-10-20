import React from "react";
import { Snackbar } from "react-native-paper";
import { typeSnackbar } from "../../../enum/snackBar";
import { colors } from "../../../styles/globalSltyles";

interface BytebankSnackbarProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
  type: typeSnackbar;
}

export default function BytebankSnackbar({
  visible,
  message,
  onDismiss,
  duration = 3000,
  type,
}: BytebankSnackbarProps) {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      elevation={2}
      wrapperStyle={{
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
      }}
      style={{
        backgroundColor:
          type === typeSnackbar.SUCCESS ? colors.primary : colors.error,
      }}
      action={{
        label: "OK",
        onPress: onDismiss,
      }}
    >
      {message}
    </Snackbar>
  );
}
