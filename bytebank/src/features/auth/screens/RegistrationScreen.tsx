import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import { useForm } from "react-hook-form";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import BytebankInput from "../../../shared/components/input";
import BytebankButton from "../../../shared/components/button";
import styles from "./styles";
import { colors, globalStyles } from "../../../styles/globalSltyles";
import BytebankSnackbar from "../../../shared/components/snackBar";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Routes } from "../../../interface/routes";
import BytebankLoading from "../../../shared/components/loading";
import { useAuth } from "../../../store/hooks/useAuth";
import { typeSnackbar } from "../../../enum/snackBar";

interface IForm {
  email: string;
  senha: string;
  name: string;
}

export default function RegistrationScreen() {
  const { control, handleSubmit } = useForm<IForm>({
    defaultValues: {
      email: "",
      senha: "",
      name: "",
    },
  });

  const navigation = useNavigation<NativeStackNavigationProp<Routes>>();
  const { register, isLoading, error } = useAuth();

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Mostrar erro se houver
  useEffect(() => {
    if (error) {
      showSnackbar(error);
    }
  }, [error]);

  const logoTranslateY = useSharedValue(-100);
  const formTranslateY = useSharedValue(100);

  useEffect(() => {
    logoTranslateY.value = withTiming(0, {
      duration: 2000,
      easing: Easing.out(Easing.exp),
    });
    formTranslateY.value = withTiming(0, {
      duration: 2000,
      easing: Easing.out(Easing.exp),
    });
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: logoTranslateY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formTranslateY.value }],
  }));

  const onSubmit = async (data: IForm) => {
    try {
      const result = await register(data.email, data.senha, data.name);
      if (result.meta.requestStatus === 'fulfilled') {
        navigation.navigate("Home");
      } else {
        showSnackbar(result.payload as string || "Erro ao cadastrar.");
      }
    } catch (error: any) {
      showSnackbar(error.message || "Erro ao cadastrar.");
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={logoStyle}>
        <View style={styles.logoContainer}>
          <Image source={require("../../../../assets/logo.png")} />
        </View>
      </Animated.View>

      <Animated.View style={formStyle}>
        <View style={globalStyles.card}>
          <BytebankInput
            control={control}
            name="name"
            label="Nome"
            rules={{ required: "Nome obrigatório" }}
          />
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
                message: "Senha deve ter no mínimo 6 caracteres",
              },
            }}
          />
          <BytebankButton onPress={handleSubmit(onSubmit)}>
            Cadastrar
          </BytebankButton>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text
              style={{
                color: colors.text,
                textDecorationLine: "underline",
              }}
            >
              Vá para a tela de login
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      <BytebankLoading visible={isLoading} message="Registrando usuário..." />
    </View>
  );
}