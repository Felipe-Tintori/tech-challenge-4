import React from "react";
import { styles } from "./styles";
import { Text, View } from "react-native";
import { useAuth } from "../../../../store/hooks/useAuth";
import { useTransactions } from "../../../../store/hooks/useTransactions";

export default function Balance() {
  const { allTransactions } = useTransactions();
  const { user } = useAuth();
  const formatCurrentDate = (): string => {
    const today = new Date();

    const daysOfWeek = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado",
    ];

    const dayName = daysOfWeek[today.getDay()];

    const formattedDate = today.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    return `${dayName}, ${formattedDate}`;
  };

  const calculateTotalBalance = (): string => {
    const total = allTransactions.reduce((total: number, transaction: any) => {
      return transaction.category === "Saque"
        ? total - transaction.value
        : total + transaction.value;
    }, 0);

    // Formata o número no estilo brasileiro
    return total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.headerTitle}>
          Bem-vindo(a), {user?.name}!
        </Text>
        <Text style={styles.headerSubTitle}>{formatCurrentDate()}</Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={[styles.headerTitle, { opacity: 0.5, fontWeight: "normal" }]}
        >
          Saldo
        </Text>
        <Text style={styles.headerTitle}>{calculateTotalBalance()} </Text>
      </View>
    </View>
  );
}
