import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, FlatList } from "react-native";
import BytebankHeader from "../../shared/components/header";
import Transfer from "../transfer";
import styles from "./styles";
import { FAB, Portal } from "react-native-paper";
import Extract from "./components/extract";
import Balance from "./components/balance";
import Charts from "./components/charts";

export default function Home() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const handleFABPress = () => {
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
  };

  const renderContent = () => {
    return (
      <View>
        <Balance />
        <Charts />
        <Extract />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <BytebankHeader />
      <FlatList
        data={[{ key: "content" }]}
        renderItem={() => renderContent()}
        contentContainerStyle={{ paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      />

      <FAB icon="plus" style={styles.fab} onPress={handleFABPress} />

      {drawerVisible && (
        <Portal>
          <View style={styles.drawerOverlay}>
            <Transfer onClose={closeDrawer} />
          </View>
        </Portal>
      )}
    </View>
  );
}
