import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Routes } from "../interface/routes";
import { useNavigation } from "@react-navigation/native";

export function useNavigator() {
  const navigation = useNavigation<NativeStackNavigationProp<Routes>>();
  return {
    navigation,
  };
}
