import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Control, Controller } from "react-hook-form";
import * as DocumentPicker from "expo-document-picker";
import { Button } from "react-native-paper";

interface BytebankFileUploadProps {
  control: Control<any>;
  name: string;
  label: string;
}

export default function BytebankFileUpload({
  control,
  name,
  label,
}: BytebankFileUploadProps) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View>
          <Text>{label}</Text>

          {value?.isExisting ? (
            <View style={{ marginVertical: 8 }}>
              <Text>Comprovante atual:</Text>
              <TouchableOpacity
                onPress={() => {
                  if (value.uri) {
                    window.open(value.uri, "_blank");
                  }
                }}
              >
                <Text
                  style={{ color: "blue", textDecorationLine: "underline" }}
                >
                  Ver comprovante
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Button
            mode="outlined"
            onPress={async () => {
              try {
                const result = await DocumentPicker.getDocumentAsync({
                  type: "*/*",
                });

                if (result.assets && result.assets[0]) {
                  onChange(result.assets[0]);
                }
              } catch (err) {
                console.error("Erro ao selecionar arquivo:", err);
              }
            }}
            style={{ marginTop: 8 }}
          >
            {value && !value.isExisting
              ? "Trocar arquivo"
              : "Selecionar arquivo"}
          </Button>

          {value && !value.isExisting && (
            <Text style={{ marginTop: 8 }}>
              Arquivo selecionado: {value.name}
            </Text>
          )}
        </View>
      )}
    />
  );
}
