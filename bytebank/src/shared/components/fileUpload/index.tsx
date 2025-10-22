import React from "react";
import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
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
      render={({ field: { onChange, value } }) => {
        return (
          <View>
            <Text>{label}</Text>

            {value?.isExisting ? (
              <View style={{ marginVertical: 8 }}>
                <Text>Comprovante atual:</Text>
                <TouchableOpacity
                  onPress={async () => {
                    if (value.uri) {
                      try {
                        // Verificar se é web ou mobile
                        if (Platform.OS === 'web') {
                          // No web, usar window.open se disponível
                          if (typeof window !== 'undefined' && window.open) {
                            window.open(value.uri, "_blank");
                          } else {
                            // Fallback para web sem window.open
                            const link = document.createElement('a');
                            link.href = value.uri;
                            link.target = '_blank';
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        } else {
                          // No mobile, usar Linking
                          const supported = await Linking.canOpenURL(value.uri);
                          if (supported) {
                            await Linking.openURL(value.uri);
                          } else {
                            console.error("Não é possível abrir a URL:", value.uri);
                          }
                        }
                      } catch (error) {
                        console.error("Erro ao abrir comprovante:", error);
                      }
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
        );
      }}
    />
  );
}
