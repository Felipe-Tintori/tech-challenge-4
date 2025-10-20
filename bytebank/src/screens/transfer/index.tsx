// No componente Transfer
import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { useForm } from "react-hook-form";
import { Button, IconButton } from "react-native-paper";
import BytebankInput from "../../shared/components/input";
import BytebankSelect from "../../shared/components/select";
import BytebankDrawerSection from "../../shared/components/drawer";
import { useSnackBar } from "../../customHook/useSnackBar";
import styles from "./styles";
import { typeSnackbar } from "../../enum/snackBar";
import { useCategories } from "../../customHook/useCategories";
import { usePaymentMethods } from "../../customHook/usePaymentMethods";
import BytebankDatePicker from "../../shared/components/datePicker";
import BytebankFileUpload from "../../shared/components/fileUpload";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../services/firebaseConfig";
import { ITransaction } from "../../interface/transaction";
import BytebankSnackbar from "../../shared/components/snackBar";
import {
  IFirebaseCollection,
  IFirebaseStorage,
} from "../../enum/firebaseCollection";
import BytebankLoading from "../../shared/components/loading";
import UserContext from "../../context/UserContext";
import { CategoryCollection } from "../../enum/categoryCollection";

interface TransferProps {
  onClose?: () => void;
  editMode?: boolean;
  transactionData?: ITransaction;
}

interface ITransferForm {
  categoria: string;
  metodoPagamento: string;
  valor: string;
  dataTransferencia: string;
  comprovante?: any; // Novo campo para o arquivo
}

export default function Transfer({
  onClose,
  editMode = false,
  transactionData,
}: TransferProps) {
  const [loadingTransaction, setLoadingTransaction] = useState(false);
  const userContext = useContext(UserContext);
  const { control, handleSubmit, reset, setValue } = useForm<ITransferForm>({
    defaultValues: {
      categoria: "",
      metodoPagamento: "",
      valor: "",
      dataTransferencia: "",
      comprovante: null, // Novo campo
    },
  });

  const { categories, loading, error } = useCategories();
  const {
    paymentMethods,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = usePaymentMethods();

  useEffect(() => {
    if (editMode && transactionData) {
      console.log("Preenchendo dados para edição:", transactionData);

      const formattedValue = transactionData.value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      setValue("categoria", transactionData.categoryId);
      setValue("metodoPagamento", transactionData.paymentId);
      setValue("valor", formattedValue);
      setValue("dataTransferencia", transactionData.dataTransaction);
      if (transactionData.comprovanteURL) {
        setValue("comprovante", {
          uri: transactionData.comprovanteURL,
          name: "Comprovante existente",
          isExisting: true,
        });
      }
    }
  }, [editMode, transactionData, setValue]);

  const categoriaOptions = categories.map((category) => ({
    label: category.label,
    value: category.id,
  }));

  const metodoPagamentoOptions = paymentMethods.map((method) => ({
    label: method.label,
    value: method.id,
  }));

  const { showSnackBar, visible, message, type, hideSnackBar } = useSnackBar();

  const onSubmit = async (data: ITransferForm) => {
    const currentUser = userContext?.user;

    try {
      setLoadingTransaction(true);

      if (!currentUser) {
        showSnackBar("Usuário não está logado!", typeSnackbar.ERROR);
        return;
      }

      let comprovanteURL = null;

      // Upload do comprovante (se houver)
      if (data.comprovante) {
        try {
          const file = data.comprovante;
          const fileName = `${IFirebaseStorage.COMPROVANTES}/${Date.now()}_${
            file.name
          }`;
          const storageRef = ref(storage, fileName);

          const response = await fetch(file.uri);
          const blob = await response.blob();

          console.log("Fazendo upload...");
          const snapshot = await uploadBytes(storageRef, blob);
          comprovanteURL = await getDownloadURL(snapshot.ref);
        } catch (uploadError) {
          console.error("Erro no upload:", uploadError);
          showSnackBar("Erro ao fazer upload do arquivo", typeSnackbar.ERROR);
          return;
        }
      } else if (editMode && transactionData?.comprovanteURL) {
        // Manter o comprovante existente se não houver novo
        comprovanteURL = transactionData.comprovanteURL;
      }

      const selectedCategory = categories.find(
        (cat) => cat.id === data.categoria
      );
      const selectedPaymentMethod = paymentMethods.find(
        (method) => method.id === data.metodoPagamento
      );

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

      const transactionDataToSave: Partial<ITransaction> = {
        userId: currentUser?._id,
        category:
          (selectedCategory?.label as CategoryCollection) || data.categoria,
        categoryId: data.categoria,
        payment: selectedPaymentMethod?.label || data.metodoPagamento,
        paymentId: data.metodoPagamento,
        value: parseValueToNumber(data.valor),
        dataTransaction: data.dataTransferencia || new Date().toISOString(),
        comprovanteURL: comprovanteURL,
        status: "realizada",
      };

      if (editMode && transactionData?.id) {
        // ATUALIZAR transação existente
        console.log("Atualizando transação com ID:", transactionData.id);
        console.log("Dados para atualizar:", transactionDataToSave);

        const transactionRef = doc(
          db,
          IFirebaseCollection.TRANSACTION,
          transactionData.id
        );

        await updateDoc(transactionRef, {
          ...transactionDataToSave,
          updatedAt: new Date(), // Adicionar timestamp de atualização
        });

        if (onClose) {
          onClose();
        }
      } else {
        // CRIAR nova transação
        const fullTransactionData: ITransaction = {
          ...transactionDataToSave,
          createdAt: new Date(),
        } as ITransaction;

        const docRef = await addDoc(
          collection(db, IFirebaseCollection.TRANSACTION),
          fullTransactionData
        );

        console.log("Nova transação criada com ID:", docRef.id);

        showSnackBar(
          "Transferência realizada com sucesso!",
          typeSnackbar.SUCCESS
        );
      }

      reset();
    } catch (error: any) {
      console.error("Erro ao salvar transação:", error);
      showSnackBar(
        `Erro ao ${editMode ? "atualizar" : "salvar"} transferência: ${
          error.message
        }`,
        typeSnackbar.ERROR
      );
    } finally {
      setLoadingTransaction(false);
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

      <BytebankDrawerSection
        title={editMode ? "Editar Transferência" : "Realizar Transferência"}
      >
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
              currency={true} // Ativa a máscara de moeda
              rules={{
                required: "Valor é obrigatório",
              }}
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
              {editMode ? "Atualizar Transferência" : "Realizar Transferência"}
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
        message="Salvando transferência..."
      />
    </View>
  );
}
