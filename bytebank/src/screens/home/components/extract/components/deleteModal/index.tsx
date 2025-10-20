// src/screens/home/components/extract/components/deleteModal.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Modal, Portal, Text, Button, IconButton } from "react-native-paper";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../../../../../../services/firebaseConfig";
import { ITransaction } from "../../../../../../interface/transaction";
import {
  colors,
  spacing,
  fontSizes,
} from "../../../../../../styles/globalSltyles";
import { useSnackBar } from "../../../../../../customHook/useSnackBar";
import { typeSnackbar } from "../../../../../../enum/snackBar";
import { styles } from "./styles";
import { IFirebaseCollection } from "../../../../../../enum/firebaseCollection";
import BytebankSnackbar from "../../../../../../shared/components/snackBar";

interface DeleteModalProps {
  visibleModal: boolean;
  transaction: ITransaction | null;
  onCancel: () => void;
}

export default function DeleteModal({
  visibleModal,
  transaction,
  onCancel,
}: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);
  const { showSnackBar, visible, message, type, hideSnackBar } = useSnackBar();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleConfirmDelete = async () => {
    if (!transaction) return;

    try {
      setDeleting(true);
      if (transaction.id) {
        await deleteDoc(
          doc(db, IFirebaseCollection.TRANSACTION, transaction.id)
        );
      }

      await new Promise((resolve) => setTimeout(resolve));

      onCancel();
    } catch (error: any) {
      showSnackBar(
        `Erro ao excluir transação: ${error.message}`,
        typeSnackbar.ERROR
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!transaction) return null;

  return (
    <Portal>
      <Modal
        visible={visibleModal}
        onDismiss={deleting ? undefined : onCancel} // Não permite fechar durante delete
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.header}>
          {!deleting && (
            <IconButton
              icon="close"
              size={24}
              onPress={onCancel}
              style={styles.closeButton}
              iconColor={colors.text}
            />
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Excluir Transação</Text>

          <Text style={styles.message}>
            {deleting
              ? "Excluindo transação..."
              : "Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonText}
            disabled={deleting}
          >
            Cancelar
          </Button>

          <Button
            mode="contained"
            onPress={handleConfirmDelete}
            style={styles.confirmButton}
            labelStyle={styles.confirmButtonText}
            loading={deleting}
            disabled={deleting}
          >
            {deleting ? "Excluindo..." : "Excluir"}
          </Button>
        </View>
      </Modal>
      <BytebankSnackbar
        type={type}
        visible={visible}
        message={message}
        onDismiss={hideSnackBar}
      />
    </Portal>
  );
}
