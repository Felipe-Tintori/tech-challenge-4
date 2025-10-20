import React, { useState } from "react";
import { View, Platform, TouchableOpacity } from "react-native";
import { TextInput } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Control, Controller } from "react-hook-form";

interface BytebankDatePickerProps {
  control: Control<any>;
  name: string;
  label: string;
  rules?: object;
}

export default function BytebankDatePicker({
  control,
  name,
  label,
  rules,
}: BytebankDatePickerProps) {
  const [show, setShow] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  const WebDatePicker = ({ value, onChange }: any) => (
    <input
      type="date"
      value={value ? new Date(value).toISOString().split("T")[0] : ""}
      onChange={(e) => {
        const date = new Date(e.target.value);
        onChange(date.toISOString());
      }}
      style={{
        position: "absolute",
        opacity: 0,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        cursor: "pointer",
      }}
    />
  );

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View>
          <TouchableOpacity onPress={() => setShow(true)}>
            <TextInput
              label={label}
              value={value ? formatDate(new Date(value)) : ""}
              editable={false}
              error={!!error}
              right={<TextInput.Icon icon="calendar" />}
            />
          </TouchableOpacity>

          {Platform.OS === "web" ? (
            <WebDatePicker value={value} onChange={onChange} />
          ) : (
            show && (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  setShow(false);
                  if (event.type === "set" && selectedDate) {
                    onChange(selectedDate.toISOString());
                  }
                }}
              />
            )
          )}
        </View>
      )}
    />
  );
}
