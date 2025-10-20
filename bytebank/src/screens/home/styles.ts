import { StyleSheet } from "react-native";

import { colors, spacing, fontSizes } from "../../styles/globalSltyles";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  fab: {
    position: "absolute",
    borderRadius: 50,
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  drawerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 3,
  },
});

export default styles;
