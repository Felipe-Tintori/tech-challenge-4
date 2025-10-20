// src/screens/home/components/extract/index.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { Text, IconButton, Menu, Divider, Portal } from "react-native-paper";
import { useTransactions } from "../../../../context/TransactionContext";
import { ITransaction } from "../../../../interface/transaction";
import BytebankLoading from "../../../../shared/components/loading";
import { styles } from "./styles";
import DeleteModal from "./components/deleteModal";
import Transfer from "../../../transfer";
import { CategoryCollection } from "../../../../enum/categoryCollection";
import Filter from "../filter";
import { FilterButton } from "./components/filterButton";

export default function Extract() {
  const { transactions, loading, error, setTransactions } = useTransactions();
  const [transactionToDelete, setTransactionToDelete] =
    useState<ITransaction | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>(
    {}
  );

  const itemsPerPage = 4;

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<ITransaction | null>(null);

  const currentTransactions = useMemo(() => {
    return transactions.slice(startIndex, endIndex);
  }, [transactions, startIndex, endIndex]);

  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getTransactionIcon = (category: string): string => {
    if (category?.toLowerCase() === CategoryCollection.SAQUE.toLowerCase()) {
      return "↓";
    }
    return "↑";
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Funções para o menu
  const openMenu = (transactionId: string) => {
    setMenuVisible({ ...menuVisible, [transactionId]: true });
  };

  const closeMenu = (transactionId: string) => {
    setMenuVisible({ ...menuVisible, [transactionId]: false });
  };

  const handleEdit = (transaction: ITransaction) => {
    const transactionId = transaction?.id;
    if (!transactionId) {
      return;
    }
    closeMenu(transactionId);

    console.log("Abrindo modal de edição para:", transaction);
    setTransactionToEdit(transaction);
    setEditModalVisible(true);
  };

  // Função para fechar modal de edição
  const handleCloseEdit = () => {
    setEditModalVisible(false);
    setTransactionToEdit(null);
  };

  const handleDelete = (transaction: ITransaction) => {
    const transactionId = transaction?.id;
    if (!transactionId) {
      return;
    }
    closeMenu(transactionId);
    console.log("Abrindo modal de delete para:", transaction);
    setTransactionToDelete(transaction);
    setDeleteModalVisible(true);
  };

  // Função para cancelar/fechar o modal
  const handleCancelDelete = () => {
    console.log("Cancelando delete");
    setDeleteModalVisible(false);
    setTransactionToDelete(null);
  };

  useEffect(() => {
    if (transactions) {
      console.log("Transações atualizadas:", transactions);
    }
  }, [transactions]);

  const renderTransactionItem = ({
    item,
    index,
  }: {
    item: ITransaction;
    index: number;
  }) => {
    const transactionKey = item.userId + item.dataTransaction + index;

    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View style={styles.iconContainer}>
          <Text style={styles.transactionIcon}>
            {getTransactionIcon(item.category)}
          </Text>
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.paymentMethod}>{item.payment}</Text>
          <Text style={styles.transactionDateTime}>
            {formatDate(item.dataTransaction)}
          </Text>
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.transactionValue}>
            {formatCurrency(item.value)}
          </Text>
        </View>

        <Menu
          visible={menuVisible[transactionKey] || false}
          onDismiss={() => closeMenu(transactionKey)}
          anchor={
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => openMenu(transactionKey)}
            >
              <Text style={styles.menuIcon}>⋮</Text>
            </TouchableOpacity>
          }
          contentStyle={styles.menuContent}
        >
          <Menu.Item
            onPress={() => handleEdit(item)}
            title="Editar"
            leadingIcon="pencil"
            titleStyle={styles.menuItemText}
          />
          <Divider />
          <Menu.Item
            onPress={() => handleDelete(item)}
            title="Excluir"
            leadingIcon="delete"
            titleStyle={[styles.menuItemText, styles.deleteText]}
          />
        </Menu>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>💳</Text>
      <Text style={styles.emptyTitle}>Nenhuma transação encontrada</Text>
      <Text style={styles.emptySubtitle}>
        Suas transferências aparecerão aqui
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Extrato</Text>

      <FilterButton></FilterButton>
    </View>
  );

  const renderPagination = () => {
    if (transactions.length <= itemsPerPage) return null;

    return (
      <View style={styles.paginationContainer}>
        <IconButton
          icon="chevron-left"
          size={24}
          disabled={currentPage === 0}
          onPress={handlePreviousPage}
          style={[
            styles.paginationButton,
            currentPage === 0 && styles.paginationButtonDisabled,
          ]}
        />

        <View style={styles.paginationInfo}>
          <Text style={styles.paginationText}>
            Página {currentPage + 1} de {totalPages}
          </Text>
        </View>

        <IconButton
          icon="chevron-right"
          size={24}
          disabled={currentPage === totalPages - 1}
          onPress={handleNextPage}
          style={[
            styles.paginationButton,
            currentPage === totalPages - 1 && styles.paginationButtonDisabled,
          ]}
        />
      </View>
    );
  };

  if (editModalVisible && transactionToEdit) {
    return (
      <Portal>
        <View
          style={[
            StyleSheet.absoluteFillObject,
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 99999999,
            },
          ]}
        >
          <Transfer
            onClose={handleCloseEdit}
            editMode={true}
            transactionData={transactionToEdit}
          />
        </View>
      </Portal>
    );
  }

  if (loading) {
    return <BytebankLoading visible={true} message="Carregando extrato..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={currentTransactions}
        keyExtractor={(item, index) => `${item.userId}-${currentPage}-${index}`}
        renderItem={renderTransactionItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={renderPagination}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <DeleteModal
        visibleModal={deleteModalVisible}
        transaction={transactionToDelete}
        onCancel={handleCancelDelete}
      />
    </View>
  );
}
