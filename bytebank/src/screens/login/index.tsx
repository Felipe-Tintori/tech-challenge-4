import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text, Dimensions } from "react-native";
import { useForm } from "react-hook-form";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import BytebankInput from "../../shared/components/input";
import BytebankButton from "../../shared/components/button";
import styles from "./styles";
import { globalStyles, colors, spacing } from "../../styles/globalSltyles";
import { auth } from "../../services/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import BytebankSnackbar from "../../shared/components/snackBar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AsyncStorageKeys } from "../../enum/asyncStorage";
import { typeSnackbar } from "../../enum/snackBar";
import { useSnackBar } from "../../customHook/useSnackBar";
import { useNavigator } from "../../customHook/useNavigator";

const { height } = Dimensions.get("window");

interface IForm {
  email: string;
  senha: string;
}

export default function Login() {
  const { control, handleSubmit } = useForm<IForm>({
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const { navigation } = useNavigator();
  const { visible, message, type, showSnackBar, hideSnackBar } = useSnackBar();
  const [showForm, setShowForm] = useState(false);

  const logoTranslateY = useSharedValue(0);
  const logoScale = useSharedValue(1);
  const formTranslateY = useSharedValue(height);

  useEffect(() => {
    const timeout = setTimeout(() => {
      logoTranslateY.value = withTiming(-160, {
        duration: 1000,
        easing: Easing.out(Easing.exp),
      });
      setShowForm(true);
      logoScale.value = withTiming(0.5, {
        duration: 2000,
        easing: Easing.out(Easing.exp),
      });
      formTranslateY.value = withTiming(0, {
        duration: 2000,
        easing: Easing.out(Easing.exp),
      });
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: logoTranslateY.value },
      { scale: logoScale.value },
    ],
    alignSelf: "center",
  }));

  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
    opacity: showForm ? 1 : 0,
  }));

  const onSubmit = async (data: IForm) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.senha
      );
      const token = await userCredential.user.getIdToken();
      await AsyncStorage.setItem(AsyncStorageKeys.FIREBASE_TOKEN, token);
      navigation.navigate("Home");
    } catch (error: any) {
      showSnackBar(error.message || "Erro ao logar.", typeSnackbar.ERROR);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={logoStyle}>
        <Image source={require("../../../assets/logo.png")} />
      </Animated.View>

      {showForm && (
        <Animated.View
          style={[
            formStyle,
            {
              position: "absolute",
              bottom: 60,
              left: 0,
              right: 0,
            },
          ]}
        >
          <View style={styles.card}>
            <BytebankInput
              control={control}
              name="email"
              label="Email"
              rules={{ required: "Email obrigatório" }}
            />
            <BytebankInput
              control={control}
              name="senha"
              label="Senha"
              secureTextEntry
              rules={{
                required: "Senha obrigatória",
                minLength: {
                  value: 6,
                  message: "Senha deve ter no máximo 6 caracteres",
                },
              }}
            />
            <TouchableOpacity
              onPress={() => navigation.navigate("Registration")}
            >
              <Text
                style={{
                  color: colors.text,
                  textDecorationLine: "underline",
                  paddingBottom: spacing.small,
                }}
              >
                Não tem conta? Cadastre-se
              </Text>
            </TouchableOpacity>
            <BytebankButton onPress={handleSubmit(onSubmit)}>
              Entrar
            </BytebankButton>
          </View>
        </Animated.View>
      )}

      <BytebankSnackbar
        type={type}
        visible={visible}
        message={message}
        onDismiss={hideSnackBar}
      />
    </View>
  );
}
