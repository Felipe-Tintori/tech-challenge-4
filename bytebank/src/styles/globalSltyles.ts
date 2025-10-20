import { StyleSheet } from "react-native";

export const colors = {
  primary: "#00E280",
  background: "#282828",
  card: "#303030",
  text: "#111111",
  inputBackground: "#f2f2f2",
  error: "#ff4d4d",
  border: "#ddd",
  gray: "#AAAAAA",
};

export const spacing = {
  small: 8,
  medium: 16,
  large: 24,
};

export const fontSizes = {
  title: 28,
  text: 16,
  small: 12,
  subtitle: 22,
};

export const heightFormControl = {
  default: 40,
};

export const globalStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF",
    padding: spacing.medium,
    gap: spacing.medium,
    borderRadius: spacing.small,
    display: "flex",
    flexDirection: "column",
  },
});
