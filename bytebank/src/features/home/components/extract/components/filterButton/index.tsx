import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { IconButton, Text, Portal } from "react-native-paper";
import { styles } from "./styles";
import Filter from "../../../filter";
import { ITransaction } from "../../../../../../interface/transaction";
import { useTransactions } from "../../../../../../store/hooks/useTransactions";
import { useAuth } from "../../../../../../store/hooks/useAuth";

export const FilterButton = () => {
  const {
    allTransactions,
    filteredTransactions,
    isLoading,
    error,
    filters,
    applyFilters,
    removeFilters,
    loadTransactions,
  } = useTransactions();
  const { user } = useAuth(); // Pegamos o user aqui fora do Portal
  const [filterVisible, setFilterVisible] = useState(false);
  
  // Calcular hasActiveFilters baseado no estado do Redux
  const hasActiveFilters = filters && Object.keys(filters).length > 0;

  const handleFilter = (filterCriteria: any) => {
    console.log("Recebendo critérios de filtro:", filterCriteria);
    applyFilters(filterCriteria); // Aplica os filtros no Redux
    setFilterVisible(false); // Fecha o filtro
  };

  const clearFilter = () => {
    setFilterVisible(false); // Fecha o filtro
  };

  const clearFilterTransiction = () => {
    removeFilters();
  };

  return (
    <>
      <TouchableOpacity
        style={!hasActiveFilters ? styles.filterButton : styles.filterButtonOn}
        onPress={() => setFilterVisible(true)}
      >
        <IconButton
          style={styles.icons}
          icon="filter-variant"
          size={24}
          iconColor="#FFF"
        />
        <Text style={styles.filterText}>Filtros</Text>
        {hasActiveFilters && (
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
                backgroundColor: 'rgba(0,0,0,0.5)',
              },
            ]}
          >
            <Filter onClose={clearFilter} onFilter={handleFilter} user={user} />
          </View>
        </Portal>
      )}
    </>
  );
};
