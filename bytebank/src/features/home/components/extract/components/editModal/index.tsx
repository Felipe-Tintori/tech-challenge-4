import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useForm } from "react-hook-form";
import { Button, IconButton } from "react-native-paper";
import { ITransaction } from "../../../../../../interface/transaction";
import { useCategories, usePaymentMethods } from "../../../../../../shared";
import BytebankDrawerSection from "../../../../../../shared/components/drawer";
import BytebankSelect from "../../../../../../shared/components/select";
import BytebankInput from "../../../../../../shared/components/input";
import BytebankDatePicker from "../../../../../../shared/components/datePicker";
import BytebankFileUpload from "../../../../../../shared/components/fileUpload";
import BytebankSnackbar from "../../../../../../shared/components/snackBar";
import BytebankLoading from "../../../../../../shared/components/loading";
import { useSnackBar } from "../../../../../../shared/hooks/useSnackBar";
import { typeSnackbar } from "../../../../../../enum/snackBar";
import { CategoryCollection } from "../../../../../../enum/categoryCollection";
import { colors } from "@styles/globalSltyles";

interface EditTransactionForm {
  categoria: string;
  metodoPagamento: string;
  valor: string;
  dataTransferencia: string;
  comprovante?: any;
}

interface EditModalProps {
  transaction: ITransaction;
  onClose: () => void;
  onSave: (updatedTransaction: Partial<ITransaction>) => void;
}

export default function EditModal({
  transaction,
  onClose,
  onSave,
}: EditModalProps) {
  const [loadingTransaction, setLoadingTransaction] = useState(false);

  const { control, handleSubmit, setValue, reset } =
    useForm<EditTransactionForm>({
      defaultValues: {
        categoria: "",
        metodoPagamento: "",
        valor: "",
        dataTransferencia: "",
        comprovante: null,
      },
    });

  const { categories, loading, error } = useCategories();
  const {
    paymentMethods,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = usePaymentMethods();
  const { showSnackBar, visible, message, type, hideSnackBar } = useSnackBar();

  const categoriaOptions = categories.map((category) => ({
    label: category.label,
    value: category.id,
  }));

  const metodoPagamentoOptions = paymentMethods.map((method) => ({
    label: method.label,
    value: method.id,
  }));

  // Preencher valores iniciais baseados na transação
  useEffect(() => {
    if (transaction) {
      console.log("Preenchendo dados para edição:", transaction);

      const formattedValue = transaction.value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setValue("categoria", transaction.categoryId);
      setValue("metodoPagamento", transaction.paymentId);
      setValue("valor", formattedValue);
      setValue("dataTransferencia", transaction.dataTransaction);

      if (transaction.comprovanteURL) {
        setValue("comprovante", {
          uri: transaction.comprovanteURL,
          name: "Comprovante existente",
          isExisting: true,
        });
      }
    }
  }, [transaction, setValue]);

  const parseValueToNumber = (value: string): number => {
    if (!value) return 0;

    // Remove R$, espaços e converte vírgula para ponto
    const cleanValue = value
      .replace(/R\$\s?/g, "") // Remove R$ e espaços
      .replace(/\./g, "") // Remove pontos (separadores de milhares)
      .replace(",", "."); // Converte vírgula para ponto decimal

    const numValue = parseFloat(cleanValue);
    return isNaN(numValue) ? 0 : numValue;
  };

  const onSubmit = async (data: EditTransactionForm) => {
    try {
      setLoadingTransaction(true);

      const selectedCategory = categories.find(
        (cat) => cat.id === data.categoria
      );
      const selectedPaymentMethod = paymentMethods.find(
        (method) => method.id === data.metodoPagamento
      );

      const updatedTransaction: Partial<ITransaction> = {
        id: transaction.id,
        category:
          (selectedCategory?.label as CategoryCollection) ||
          transaction.category,
        categoryId: data.categoria || transaction.categoryId,
        payment: selectedPaymentMethod?.label || transaction.payment,
        paymentId: data.metodoPagamento || transaction.paymentId,
        value: parseValueToNumber(data.valor),
        dataTransaction: data.dataTransferencia || transaction.dataTransaction,
        comprovanteURL: transaction.comprovanteURL, // Manter comprovante existente
        status: "realizada",
      };

      await onSave(updatedTransaction);
      showSnackBar("Transação atualizada com sucesso!", typeSnackbar.SUCCESS);
    } catch (error: any) {
      console.error("Erro ao editar transação:", error);
      showSnackBar(
        `Erro ao atualizar transação: ${error.message}`,
        typeSnackbar.ERROR
      );
    } finally {
      setLoadingTransaction(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.closeButtonContainer}>
        <IconButton
          icon="close"
          size={24}
          onPress={onClose}
          style={styles.closeButton}
        />
      </View>

      <BytebankDrawerSection title="Editar Transferência">
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
              rules={{ required: "Método de pagamento é obrigatório" }}
            />

            <BytebankInput
              control={control}
              name="valor"
              label="Valor"
              currency={true}
              rules={{ required: "Valor é obrigatório" }}
            />

            <BytebankDatePicker
              control={control}
              name="dataTransferencia"
              label="Data da Transferência"
              rules={{ required: "Data da transferência é obrigatória" }}
            />

            <BytebankFileUpload
              control={control}
              name="comprovante"
              label="Comprovante da Transferência"
            />

            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              style={styles.button}
            >
              Atualizar Transferência
            </Button>
          </View>
        </ScrollView>
      </BytebankDrawerSection>

      <BytebankSnackbar
        type={type}
        visible={visible}
        message={message}
        onDismiss={hideSnackBar}
      />

      <BytebankLoading
        visible={loadingTransaction}
        message="Atualizando transferência..."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 24,
    backgroundColor: colors.primary,
  },
  closeButtonContainer: {
    alignItems: "flex-end",
    padding: 8,
  },
  closeButton: {
    backgroundColor: colors.primary,
  },
});
