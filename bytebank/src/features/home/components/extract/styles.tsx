// src/screens/home/components/extract/styles.ts
import { StyleSheet } from "react-native";
import { colors, fontSizes, spacing } from "../../../../styles/globalSltyles";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.medium,
    margin: spacing.medium,
    borderRadius: spacing.small,
  },

  listContainer: {
    padding: spacing.medium,
    backgroundColor: colors.card,
    margin: spacing.medium,
    borderRadius: spacing.small,
  },

  headerContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerTitle: {
    fontSize: fontSizes.subtitle,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  // Novo layout para transação
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 0,
  },

  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3A3A3A", // Fundo cinza escuro
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  transactionIcon: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  transactionInfo: {
    flex: 1,
    justifyContent: "center",
  },

  paymentMethod: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },

  transactionDateTime: {
    fontSize: 12,
    color: "#AAAAAA", // Cinza claro
  },

  valueContainer: {
    alignItems: "flex-end",
    marginRight: 12,
  },

  transactionValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  menuButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },

  menuIcon: {
    fontSize: 16,
    color: "#AAAAAA",
    fontWeight: "bold",
    transform: [{ rotate: "90deg" }],
  },

  separator: {
    height: 1,
    backgroundColor: "#3A3A3A",
    marginVertical: 8,
  },

  // Estados vazios e erro
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#AAAAAA",
    textAlign: "center",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  errorText: {
    fontSize: 16,
    color: colors.error || "#F44336",
    textAlign: "center",
  },

  // Paginação
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginTop: 8,
  },

  paginationButton: {
    backgroundColor: colors.primary,
    margin: 0,
  },

  paginationButtonDisabled: {
    backgroundColor: "#3A3A3A",
  },

  paginationInfo: {
    alignItems: "center",
    flex: 1,
  },

  paginationText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  menuContent: {
    backgroundColor: "#3A3A3A",
    borderRadius: 8,
    minWidth: 120,
  },

  menuItemText: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  deleteText: {
    color: "#FF6B6B", // Vermelho para excluir
  },
});
