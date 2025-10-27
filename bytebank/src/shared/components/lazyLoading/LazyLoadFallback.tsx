import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface LazyLoadFallbackProps {
  message?: string;
}

/**
 * Componente de fallback para lazy loading
 * Exibe um indicador de carregamento enquanto os componentes são carregados
 */
export const LazyLoadFallback: React.FC<LazyLoadFallbackProps> = ({ 
  message = 'Carregando...' 
}) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6200ee" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
