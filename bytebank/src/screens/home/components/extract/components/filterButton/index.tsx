import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Portal, Text } from "react-native-paper";
import { useTransactions } from "../../../../../../context/TransactionContext";
import { styles } from "./styles";
import Filter from "../../../filter";
import { ITransaction } from "../../../../../../interface/transaction";

export const FilterButton = () => {
  const {
    transactions,
    loading,
    error,
    setTransactions,
    setFilter,
    filter,
    refreshTransactions,
  } = useTransactions();
  const [filterVisible, setFilterVisible] = useState(false);

  const handleFilter = (filteredTransactions: ITransaction[]) => {
    setTransactions(filteredTransactions); // Atualiza as transações filtradas
    setFilterVisible(false); // Fecha o filtro
    setFilter(true);
  };

  const clearFilter = () => {
    setFilterVisible(false); // Fecha o filtro
  };

  const clearFilterTransiction = () => {
    refreshTransactions();
    setFilter(false);
  };

  return (
    <>
      <TouchableOpacity
        style={!filter ? styles.filterButton : styles.filterButtonOn}
        onPress={() => setFilterVisible(true)}
      >
        <IconButton
          style={styles.icons}
          icon="filter-variant"
          size={24}
          iconColor="#FFF"
        />
        <Text style={styles.filterText}>Filtros</Text>
        {filter && (
          <>
            <IconButton
              style={styles.icons}
              icon="close"
              size={24}
              iconColor="#FFF"
              onPress={clearFilterTransiction}
            />
          </>
        )}
      </TouchableOpacity>
      {filterVisible && (
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
            <Filter onClose={clearFilter} onFilter={handleFilter} />
          </View>
        </Portal>
      )}
    </>
  );
};
