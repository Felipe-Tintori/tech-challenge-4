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
import { useTransactions } from "../../../../store/hooks/useTransactions";
import { ITransaction } from "../../../../interface/transaction";
import BytebankLoading from "../../../../shared/components/loading";
import { styles } from "./styles";
import DeleteModal from "./components/deleteModal";
import EditModal from "./components/editModal";
import { CategoryCollection } from "../../../../enum/categoryCollection";
import Filter from "../filter";
import { FilterButton } from "./components/filterButton";
import { useCategories } from "../../../../shared/hooks/useCategories";
import { usePaymentMethods } from "../../../../shared/hooks/usePaymentMethods";

export default function Extract() {
  const { allTransactionsLegacy, filteredTransactionsLegacy, filters, isLoading, error, removeTransaction, editTransaction } = useTransactions();
  const { categories } = useCategories();
  const { paymentMethods } = usePaymentMethods();
  const [transactionToDelete, setTransactionToDelete] =
    useState<ITransaction | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>(
    {}
  );

  const itemsPerPage = 4;

  // Determina quais transações usar baseado se há filtros ativos
  const activeTransactions = useMemo(() => {
    const hasActiveFilters = filters && Object.keys(filters).length > 0;
    return hasActiveFilters ? filteredTransactionsLegacy : allTransactionsLegacy;
  }, [filters, filteredTransactionsLegacy, allTransactionsLegacy]);

  const totalPages = Math.ceil((activeTransactions || []).length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [transactionToEdit, setTransactionToEdit] =
    useState<ITransaction | null>(null);

  const currentTransactions = useMemo(() => {
    return (activeTransactions || []).slice(startIndex, endIndex);
  }, [activeTransactions, startIndex, endIndex]);

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

  // Funções para converter IDs para labels
  const getCategoryLabel = (categoryId: string): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.label || categoryId;
  };

  const getPaymentMethodLabel = (paymentId: string): string => {
    const paymentMethod = paymentMethods.find(method => method.id === paymentId);
    return paymentMethod?.label || paymentId;
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

  // Função para salvar edição
  const handleSaveEdit = async (updatedTransaction: Partial<ITransaction>) => {
    try {
      if (!updatedTransaction.id) {
        console.error("ID da transação não encontrado");
        return;
      }
      
      // Separar o ID dos dados de atualização e mapear para o formato correto
      const { id, category, payment, value, dataTransaction, comprovanteURL, status } = updatedTransaction;
      
      const updateData: any = {};
      
      if (value !== undefined) updateData.value = value;
      if (dataTransaction !== undefined) updateData.date = new Date(dataTransaction);
      if (comprovanteURL !== undefined && comprovanteURL !== null) updateData.receiptUrl = comprovanteURL;
      if (status !== undefined) updateData.status = status;
      if (category !== undefined) updateData.category = category;
      if (payment !== undefined) updateData.paymentMethod = payment;
      
      await editTransaction(id, updateData);
      setEditModalVisible(false);
      setTransactionToEdit(null);
      console.log("Transação editada com sucesso");
    } catch (error) {
      console.error("Erro ao editar transação:", error);
    }
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
    if (activeTransactions) {
      console.log("Transações ativas atualizadas:", activeTransactions);
      console.log("Filtros ativos:", filters);
    }
  }, [activeTransactions, filters]);

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
            {getTransactionIcon(getCategoryLabel(item.category))}
          </Text>
        </View>

        <View style={styles.transactionInfo}>
          <Text style={styles.paymentMethod}>{getPaymentMethodLabel(item.payment)}</Text>
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
    if ((activeTransactions || []).length <= itemsPerPage) return null;

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
        <EditModal 
          transaction={transactionToEdit}
          onClose={handleCloseEdit}
          onSave={handleSaveEdit}
        />
      </Portal>
    );
  }

  if (isLoading) {
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
