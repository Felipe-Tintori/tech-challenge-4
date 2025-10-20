import React from "react";
import { View, Dimensions } from "react-native";
import { Text } from "react-native-paper";
import { BarChart } from "react-native-chart-kit";
import { styles } from "../balance/styles";
import { useTransactions } from "../../../../context/TransactionContext";
import { ITransaction } from "../../../../interface/transaction";
import { colors } from "../../../../styles/globalSltyles";
import { CategoryCollection } from "../../../../enum/categoryCollection";

const getMonthLabel = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Data Inválida";
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `${months[d.getMonth()]}/${d.getFullYear()}`;
};

const getMonthData = (transactions: ITransaction[]) => {
  const data: { [key: string]: number } = {};
  transactions.forEach((t) => {
    const monthLabel = getMonthLabel(t.dataTransaction);
    const value = typeof t.value === "number" ? t.value : 0;
    const isSaque = t.category === CategoryCollection.SAQUE;
    if (!data[monthLabel]) data[monthLabel] = 0;
    data[monthLabel] += isSaque ? -value : value;
  });
  return data;
};

export default function Charts() {
  const { transactions } = useTransactions();

  const monthData = getMonthData(transactions);

  const labels = Object.keys(monthData);
  const values = Object.values(monthData);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Gráfico de Transações</Text>
      {labels.length > 0 ? (
        <BarChart
          data={{
            labels,
            datasets: [{ data: values }],
          }}
          width={Dimensions.get("window").width - 60}
          height={220}
          fromZero
          yAxisLabel="R$ "
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.card,
            backgroundGradientFrom: colors.card,
            backgroundGradientTo: colors.card,
            decimalPlaces: 2,
            color: (opacity = 1) => colors.primary,
            labelColor: () => "#FFF",
            style: { borderRadius: 16 },
            propsForLabels: {
              fontFamily: "Roboto",
              fontSize: 12,
            },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      ) : (
        <Text style={styles.headerSubTitle}>Sem dados para exibir</Text>
      )}
    </View>
  );
}
