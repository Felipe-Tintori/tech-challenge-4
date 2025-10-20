import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Controller } from "react-hook-form";
import { HelperText, Menu, TextInput } from "react-native-paper";
import { colors } from "../../../styles/globalSltyles";

interface SelectOption {
  label: string;
  value: string;
}

interface BytebankSelectProps {
  control: any;
  name: string;
  label: string;
  options: SelectOption[];
  rules?: object;
}

export default function BytebankSelect({
  control,
  name,
  label,
  options,
  rules = {},
}: BytebankSelectProps) {
  const [visible, setVisible] = useState(false);

  const openMenu = () => setVisible(true);

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View>
          <Menu
            visible={visible}
            onDismiss={() => setVisible(false)}
            anchor={
              <TouchableOpacity onPress={openMenu}>
                <TextInput
                  label={label}
                  value={
                    options.find((option) => option.value === value)?.label ||
                    ""
                  }
                  mode="outlined"
                  outlineColor={colors.border}
                  error={!!error}
                  editable={false}
                  pointerEvents="none"
                  right={
                    <TextInput.Icon icon="chevron-down" onPress={openMenu} />
                  }
                />
              </TouchableOpacity>
            }
          >
            {options.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setVisible(false);
                }}
                title={option.label}
              />
            ))}
          </Menu>
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
