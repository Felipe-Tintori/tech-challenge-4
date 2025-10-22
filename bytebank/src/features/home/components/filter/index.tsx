import React from "react";
import { View, ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import { Button, IconButton } from "react-native-paper";

import { collection, query, where, getDocs } from "firebase/firestore";

import styles from "./styles";
import BytebankDrawerSection from "../../../../shared/components/drawer";
import BytebankSelect from "../../../../shared/components/select";
import BytebankDatePicker from "../../../../shared/components/datePicker";
import { db } from "../../../../services/firebaseConfig";
import { IFirebaseCollection } from "../../../../enum/firebaseCollection";
import { ITransaction } from "../../../../interface/transaction";
import { useCategories, usePaymentMethods } from "@shared/index";

interface IFilterForm {
  categoria: string;
  metodoPagamento: string;
}

interface FilterProps {
  onClose?: () => void; // Callback para fechar o Drawer
  onFilter: (filterCriteria: any) => void; // Callback para retornar critérios de filtro
  user?: any; // User passado como prop para evitar Redux context no Portal
}

export default function Filter({ onClose, onFilter, user }: FilterProps) {
  // Removemos o useAuth() já que user é passado como prop
  const { control, handleSubmit, reset } = useForm<IFilterForm>({
    defaultValues: {
      categoria: "",
      metodoPagamento: "",
    },
  });

  const { categories } = useCategories();
  const { paymentMethods } = usePaymentMethods();

  const categoriaOptions = categories.map((category) => ({
    label: category.label,
    value: category.id,
  }));

  const metodoPagamentoOptions = paymentMethods.map((method) => ({
    label: method.label,
    value: method.id,
  }));

  const onSubmit = async (data: IFilterForm) => {
    try {
      // Em vez de fazer query no Firebase, passamos os critérios para o Redux
      const filterCriteria: any = {};

      // CORREÇÃO: Agora enviamos o ID diretamente (não o label)
      if (data.categoria) {
        filterCriteria.category = data.categoria;
      }
      
      if (data.metodoPagamento) {
        // CORREÇÃO: Agora enviamos o ID diretamente (não o label)
        filterCriteria.paymentMethod = data.metodoPagamento;
      }

      console.log("DEBUG Filter: Aplicando critérios de filtro:", filterCriteria);
      console.log("DEBUG Filter: data.categoria (ID selecionado):", data.categoria);
      console.log("DEBUG Filter: data.metodoPagamento (ID selecionado):", data.metodoPagamento);
      
      onFilter(filterCriteria);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao aplicar filtros:", error);
    }
  };

  return (
    <View style={styles.container}>
      {onClose && (
        <View style={styles.closeButtonContainer}>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>
      )}

      <BytebankDrawerSection title="Filtrar Transações">
        <ScrollView style={styles.formContainer}>
          <View style={styles.form}>
            <BytebankSelect
              control={control}
              name="categoria"
              label="Categoria"
              options={categoriaOptions}
              rules={{ required: "Categoria é obrigatória" }}
            />

            <BytebankSelect
              control={control}
              name="metodoPagamento"
              label="Método de Pagamento"
              options={metodoPagamentoOptions}
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
            >
              Aplicar Filtro
            </Button>
          </View>
        </ScrollView>
      </BytebankDrawerSection>
    </View>
  );
}
