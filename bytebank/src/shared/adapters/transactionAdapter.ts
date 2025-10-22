/**
 * Adapter para converter entre Transaction (Clean Architecture) e ITransaction (Legacy UI)
 * Este adapter resolve a incompatibilidade entre os tipos
 */

import { Transaction, TransactionCategory, PaymentMethod, TransactionStatus } from '../../domain/entities/Transaction';
import { ITransaction } from '../../interface/transaction';
import { CategoryCollection } from '../../enum/categoryCollection';

/**
 * Converte Transaction (domain entity) para ITransaction (legacy interface)
 */
export const transactionToLegacy = (transaction: Transaction): ITransaction => {
  console.log('DEBUG transactionToLegacy: Transaction recebida:', transaction);
  
  // Para o legacy, usamos o valor string diretamente
  const categoryValue = transaction.category as string;
  
  const result = {
    id: transaction.id,
    userId: transaction.userId,
    category: categoryValue as CategoryCollection,
    categoryId: categoryValue, // Agora category já é o ID do Firebase
    payment: transaction.paymentMethod as string,
    paymentId: transaction.paymentMethod as string, // Agora paymentMethod já é o ID do Firebase
    value: transaction.value,
    dataTransaction: transaction.date instanceof Date ? transaction.date.toISOString() : transaction.date,
    comprovanteURL: transaction.receiptUrl,
    createdAt: transaction.createdAt instanceof Date ? transaction.createdAt : new Date(transaction.createdAt),
    status: transaction.status as string,
  };
  
  console.log('DEBUG transactionToLegacy: Resultado (category e payment agora são IDs):', result);
  return result;
};

/**
 * Converte array de Transaction para array de ITransaction
 */
export const transactionsToLegacy = (transactions: Transaction[]): ITransaction[] => {
  return transactions.map(transactionToLegacy);
};

/**
 * Converte ITransaction (legacy interface) para Transaction (domain entity)
 */
export const legacyToTransaction = (legacy: ITransaction): Transaction => {
  return new Transaction(
    legacy.id || '',
    legacy.userId,
    legacy.category as unknown as TransactionCategory,
    legacy.payment as PaymentMethod,
    legacy.value,
    new Date(legacy.dataTransaction),
    legacy.status as TransactionStatus || TransactionStatus.REALIZADA,
    '', // description não existe no legacy
    legacy.comprovanteURL || undefined,
    legacy.createdAt || new Date(),
    new Date() // updatedAt não existe no legacy
  );
};

/**
 * Converte array de ITransaction para array de Transaction
 */
export const legacyToTransactions = (legacyTransactions: ITransaction[]): Transaction[] => {
  return legacyTransactions.map(legacyToTransaction);
};