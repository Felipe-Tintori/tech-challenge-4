import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

/**
 * Componente Skeleton básico com animação de shimmer
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [shimmerAnimation]);

  const opacity = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * Skeleton para card de transação
 */
export const TransactionCardSkeleton: React.FC = () => {
  return (
    <View style={styles.transactionCard}>
      <View style={styles.transactionIcon}>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>
      <View style={styles.transactionInfo}>
        <Skeleton width="60%" height={16} style={styles.marginBottom} />
        <Skeleton width="40%" height={14} />
      </View>
      <View style={styles.transactionValue}>
        <Skeleton width={80} height={18} />
      </View>
    </View>
  );
};

/**
 * Skeleton para lista de transações
 */
export const TransactionListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index}>
          <TransactionCardSkeleton />
          {index < count - 1 && <View style={styles.separator} />}
        </View>
      ))}
    </View>
  );
};

/**
 * Skeleton para header/saldo
 */
export const BalanceSkeleton: React.FC = () => {
  return (
    <View style={styles.balanceContainer}>
      <Skeleton width="40%" height={16} style={styles.marginBottom} />
      <Skeleton width="60%" height={32} />
    </View>
  );
};

/**
 * Skeleton para formulário
 */
export const FormSkeleton: React.FC = () => {
  return (
    <View style={styles.formContainer}>
      <Skeleton width="100%" height={56} style={styles.inputSkeleton} />
      <Skeleton width="100%" height={56} style={styles.inputSkeleton} />
      <Skeleton width="100%" height={56} style={styles.inputSkeleton} />
      <Skeleton width="100%" height={48} style={styles.buttonSkeleton} />
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E1E9EE',
  },
  container: {
    padding: 16,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  transactionIcon: {
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionValue: {
    marginLeft: 12,
  },
  marginBottom: {
    marginBottom: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  balanceContainer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 16,
  },
  formContainer: {
    padding: 16,
  },
  inputSkeleton: {
    marginBottom: 16,
    borderRadius: 8,
  },
  buttonSkeleton: {
    marginTop: 8,
    borderRadius: 24,
  },
});
