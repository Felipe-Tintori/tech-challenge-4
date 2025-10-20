// src/screens/home/components/extract/styles.ts
import { StyleSheet } from "react-native";
import { colors, fontSizes, spacing } from "../../../../styles/globalSltyles";

export const styles = StyleSheet.create({
  container: {
    padding: spacing.medium,
    backgroundColor: colors.card,
    margin: spacing.medium,
    marginBottom: 0,
    borderRadius: spacing.small,
  },

  headerTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  headerSubTitle: {
    fontSize: fontSizes.text,
    color: colors.gray,
    marginBottom: 4,
  },
});
