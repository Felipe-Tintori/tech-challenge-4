import { StyleSheet } from "react-native";
import { colors, spacing } from "../../styles/globalSltyles";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  formContainer: {
    flex: 1,
    padding: spacing.medium,
  },
  form: {
    gap: spacing.medium,
  },
  button: {
    marginTop: spacing.large,
    backgroundColor: colors.primary,
  },
  closeButtonContainer: {
    alignItems: "flex-end",
    padding: spacing.small,
  },
  closeButton: {
    backgroundColor: colors.primary,
  },
});

export default styles;
