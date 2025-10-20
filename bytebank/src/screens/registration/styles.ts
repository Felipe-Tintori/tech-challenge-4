import { StyleSheet } from "react-native";

import { colors, spacing, fontSizes } from "../../styles/globalSltyles";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSizes.title,
    marginBottom: spacing.large,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.primary,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
});

export default styles;
