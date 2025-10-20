import { StyleSheet } from "react-native";
import {
  colors,
  fontSizes,
  spacing,
} from "../../../../../../styles/globalSltyles";

export const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: "#FFFFFF",
    margin: spacing.large,
    borderRadius: 12,
    maxHeight: "80%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: spacing.large,
    paddingTop: spacing.large,
    paddingBottom: spacing.small,
  },

  iconContainer: {
    flex: 1,
    alignItems: "center",
  },

  warningIcon: {
    fontSize: 32,
  },

  closeButton: {
    margin: 0,
  },

  content: {
    paddingHorizontal: spacing.large,
    paddingBottom: spacing.medium,
  },

  title: {
    fontSize: fontSizes.subtitle,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
    marginBottom: spacing.medium,
  },

  message: {
    fontSize: fontSizes.text,
    color: colors.text,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.large,
    opacity: 0.8,
  },

  transactionInfo: {
    backgroundColor: colors.background,
    borderRadius: spacing.small,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  label: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    fontWeight: "500",
  },

  value: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },

  valueHighlight: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    gap: spacing.medium,
    padding: spacing.large,
    paddingTop: 0,
  },

  cancelButton: {
    flex: 1,
    borderColor: colors.border,
  },

  cancelButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },

  confirmButton: {
    flex: 1,
    backgroundColor: colors.primary,
  },

  confirmButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
