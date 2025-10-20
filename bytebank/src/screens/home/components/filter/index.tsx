import React, { useContext } from "react";
import { View, ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import { Button, IconButton } from "react-native-paper";

import { collection, query, where, getDocs } from "firebase/firestore";

import styles from "./styles";
import { useCategories } from "../../../../customHook/useCategories";
import { usePaymentMethods } from "../../../../customHook/usePaymentMethods";
import BytebankDrawerSection from "../../../../shared/components/drawer";
import BytebankSelect from "../../../../shared/components/select";
import BytebankDatePicker from "../../../../shared/components/datePicker";
import { db } from "../../../../services/firebaseConfig";
import { IFirebaseCollection } from "../../../../enum/firebaseCollection";
import { useTransactions } from "../../../../context/TransactionContext";
import { ITransaction } from "../../../../interface/transaction";
import UserContext from "../../../../context/UserContext";

interface IFilterForm {
  categoria: string;
  metodoPagamento: string;
}

interface FilterProps {
  onClose?: () => void; // Callback para fechar o Drawer
  onFilter: (filteredTransactions: ITransaction[]) => void; // Callback para retornar os resultados filtrados
}

export default function Filter({ onClose, onFilter }: FilterProps) {
  const userContext = useContext(UserContext);
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
      const currentUser = userContext?.user;
      const transactionsRef = collection(db, IFirebaseCollection.TRANSACTION);
      let filters = [];

      const currentUserId = currentUser?._id;

      filters.push(where("userId", "==", currentUserId));

      if (data.categoria) {
        filters.push(where("categoryId", "==", data.categoria));
      }
      if (data.metodoPagamento) {
        filters.push(where("paymentId", "==", data.metodoPagamento));
      }

      const q = query(transactionsRef, ...filters);
      const querySnapshot = await getDocs(q);
      console.log("Query executada com filtros:", q);

      const filteredTransactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ITransaction[];

      onFilter(filteredTransactions);
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Erro ao filtrar transações:", error);
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
