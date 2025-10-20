import React, { useState } from "react";
import { Appbar, Menu } from "react-native-paper";
import { Image } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../../../services/firebaseConfig";

import { useNavigator } from "../../../customHook/useNavigator";
import { colors } from "../../../styles/globalSltyles";
import { useRoute } from "@react-navigation/native";

export default function BytebankHeader() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { navigation } = useNavigator();
  const _goBack = () => navigation.goBack();

  const route = useRoute();
  const isHome = route?.name === "Home";

  const handleLogout = async () => {
    setMenuVisible(false);
    await signOut(auth);
    navigation.navigate("Login");
  };

  return (
    <Appbar.Header style={{ backgroundColor: colors.card }}>
      {!isHome && <Appbar.BackAction onPress={_goBack} color="#FFF" />}
      <Image
        source={require("../../../../assets/logo.png")}
        style={{ width: 110, marginLeft: isHome ? 15 : 0 }}
        resizeMode="contain"
      />
      <Appbar.Content title="" />
      <Appbar.Action icon="logout" color="#FFF" onPress={handleLogout} />
    </Appbar.Header>
  );
}
