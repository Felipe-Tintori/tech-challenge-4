// Transactions module types
export interface TransferForm {
  categoria: string;
  metodoPagamento: string;
  valor: string;
  dataTransferencia: string;
  comprovante?: any;
}

export interface TransactionFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  paymentMethod?: string;
}