import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { Drawer } from "react-native-paper";

interface DrawerSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function BytebankDrawerSection({
  title,
  children,
}: DrawerSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  content: {
    flex: 1,
    width: "100%",
  },
});
