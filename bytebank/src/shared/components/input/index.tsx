// src/components/FormTextInput.tsx
import React from "react";
import { View } from "react-native";
import { Controller } from "react-hook-form";
import { HelperText, TextInput } from "react-native-paper";
import { styles } from "./styles";
import { colors } from "../../../styles/globalSltyles";

interface BytebankInputProps {
  control: any;
  name: string;
  label: string;
  secureTextEntry?: boolean;
  rules?: object;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  currency?: boolean;
}

const formatCurrency = (value: string): string => {
  const cleanValue = value.replace(/\D/g, "");

  if (!cleanValue) return "";

  const numberValue = parseInt(cleanValue) / 100;

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export default function BytebankInput({
  control,
  name,
  label,
  secureTextEntry = false,
  rules = {},
  keyboardType = "default",
  currency = false,
}: BytebankInputProps) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <View>
          <TextInput
            label={label}
            value={value}
            mode="outlined"
            outlineColor={colors.border}
            onChangeText={(text) => {
              if (currency) {
                const numericValue = formatCurrency(text);
                onChange(numericValue);
              } else {
                onChange(text);
              }
            }}
            onBlur={onBlur}
            secureTextEntry={secureTextEntry}
            error={!!error}
            keyboardType={currency ? "numeric" : keyboardType}
          />
          {error && (
            <HelperText
              type="error"
              style={{ color: colors.error }}
              visible={!!error}
            >
              {error.message}
            </HelperText>
          )}
        </View>
      )}
    />
  );
}
