import { 
  Transaction, 
  TransactionFilters, 
  CreateTransactionData, 
  UpdateTransactionData 
} from '../entities/Transaction';

export interface ITransactionRepository {
  /**
   * Obtém todas as transações de um usuário
   */
  getByUserId(userId: string): Promise<Transaction[]>;

  /**
   * Obtém uma transação específica por ID
   */
  getById(id: string): Promise<Transaction | null>;

  /**
   * Cria uma nova transação
   */
  create(data: CreateTransactionData): Promise<Transaction>;

  /**
   * Atualiza uma transação existente
   */
  update(id: string, data: UpdateTransactionData): Promise<Transaction>;

  /**
   * Deleta uma transação
   */
  delete(id: string): Promise<void>;

  /**
   * Obtém transações filtradas
   */
  getByFilters(userId: string, filters: TransactionFilters): Promise<Transaction[]>;

  /**
   * Obtém transações por categoria
   */
  getByCategory(userId: string, category: string): Promise<Transaction[]>;

  /**
   * Obtém transações por período
   */
  getByPeriod(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]>;

  /**
   * Obtém estatísticas das transações
   */
  getStatistics(userId: string): Promise<TransactionStatistics>;

  /**
   * Inscreve-se para mudanças em tempo real
   */
  subscribeToChanges(
    userId: string, 
    callback: (transactions: Transaction[]) => void
  ): () => void;

  /**
   * Upload de comprovante de transação
   */
  uploadReceipt(file: File | Blob, transactionId: string): Promise<string>;

  /**
   * Remove comprovante de transação
   */
  removeReceipt(receiptUrl: string): Promise<void>;
}

export interface TransactionStatistics {
  totalTransactions: number;
  totalValue: number;
  totalIncome: number;
  totalExpense: number;
  averageValue: number;
  transactionsByCategory: Record<string, number>;
  transactionsByPaymentMethod: Record<string, number>;
}