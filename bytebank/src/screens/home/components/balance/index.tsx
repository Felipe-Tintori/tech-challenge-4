import React, { useContext } from "react";
import { styles } from "./styles";
import { Text, View } from "react-native";
import UserContext from "../../../../context/UserContext";
import { useTransactions } from "../../../../context/TransactionContext";

export default function Balance() {
  const { transactions } = useTransactions();
  const userContext = useContext(UserContext);
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
    const total = transactions.reduce((total, transaction) => {
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
          Bem-vindo(a), {userContext?.user?.name}!
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
