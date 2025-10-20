// src/screens/home/components/extract/styles.ts
import { StyleSheet } from "react-native";
import { colors, spacing } from "../../../../../../styles/globalSltyles";

export const styles = StyleSheet.create({
  filterCount: {
    position: "absolute",
    top: -10,
    right: -10,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    backgroundColor: colors.error,
    width: 30,
    height: 30,
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  filterText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  filterButton: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: spacing.small,
    paddingHorizontal: 20,
    paddingVertical: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  filterButtonOn: {
    backgroundColor: colors.primary,
    borderColor: colors.border,
    borderRadius: spacing.small,
    paddingHorizontal: 20,
    paddingVertical: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icons: {
    fontSize: 10,
    padding: 0,
    margin: 0,
    width: 24,
  },
});
