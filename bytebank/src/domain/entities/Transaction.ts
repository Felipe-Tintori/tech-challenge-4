export enum TransactionCategory {
  ALIMENTACAO = 'Alimentação',
  TRANSPORTE = 'Transporte',
  LAZER = 'Lazer',
  SAUDE = 'Saúde',
  EDUCACAO = 'Educação',
  COMPRAS = 'Compras',
  SAQUE = 'Saque',
  DEPOSITO = 'Depósito',
  OUTROS = 'Outros'
}

export enum PaymentMethod {
  PIX = 'PIX',
  CARTAO_CREDITO = 'Cartão de Crédito',
  CARTAO_DEBITO = 'Cartão de Débito',
  DINHEIRO = 'Dinheiro',
  TRANSFERENCIA = 'Transferência',
  DOC = 'DOC',
  TED = 'TED'
}

export enum TransactionStatus {
  PENDENTE = 'Pendente',
  REALIZADA = 'Realizada',
  CANCELADA = 'Cancelada',
  FALHOU = 'Falhou'
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly category: TransactionCategory,
    public readonly paymentMethod: PaymentMethod,
    public readonly value: number,
    public readonly date: Date,
    public readonly status: TransactionStatus = TransactionStatus.REALIZADA,
    public readonly description?: string,
    public readonly receiptUrl?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    this.validateTransaction();
  }

  private validateTransaction(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('ID da transação é obrigatório');
    }

    if (!this.userId || this.userId.trim().length === 0) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Comentando temporariamente as validações de enum para permitir flexibilidade
    // if (!Object.values(TransactionCategory).includes(this.category)) {
    //   throw new Error('Categoria inválida');
    // }

    // if (!Object.values(PaymentMethod).includes(this.paymentMethod)) {
    //   throw new Error('Método de pagamento inválido');
    // }

    if (!this.value || this.value <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    if (!this.date) {
      throw new Error('Data da transação é obrigatória');
    }

    // if (!Object.values(TransactionStatus).includes(this.status)) {
    //   throw new Error('Status inválido');
    // }
  }

  public updateStatus(newStatus: TransactionStatus): Transaction {
    return new Transaction(
      this.id,
      this.userId,
      this.category,
      this.paymentMethod,
      this.value,
      this.date,
      newStatus,
      this.description,
      this.receiptUrl,
      this.createdAt,
      new Date()
    );
  }

  public updateValue(newValue: number): Transaction {
    if (newValue <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    return new Transaction(
      this.id,
      this.userId,
      this.category,
      this.paymentMethod,
      newValue,
      this.date,
      this.status,
      this.description,
      this.receiptUrl,
      this.createdAt,
      new Date()
    );
  }

  public isWithdrawal(): boolean {
    return this.category === TransactionCategory.SAQUE;
  }

  public isCompleted(): boolean {
    return this.status === TransactionStatus.REALIZADA;
  }

  public getFormattedValue(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(this.value);
  }

  public getFormattedDate(): string {
    return this.date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  public toPlainObject() {
    return {
      id: this.id,
      userId: this.userId,
      category: this.category,
      paymentMethod: this.paymentMethod,
      value: this.value,
      date: this.date,
      status: this.status,
      description: this.description,
      receiptUrl: this.receiptUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface TransactionFilters {
  category?: TransactionCategory;
  paymentMethod?: PaymentMethod;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  minValue?: number;
  maxValue?: number;
}

export interface CreateTransactionData {
  userId: string;
  category: TransactionCategory;
  paymentMethod: PaymentMethod;
  value: number;
  date: Date;
  description?: string;
  receiptUrl?: string;
}

export interface UpdateTransactionData {
  category?: TransactionCategory;
  paymentMethod?: PaymentMethod;
  value?: number;
  date?: Date;
  status?: TransactionStatus;
  description?: string;
  receiptUrl?: string;
}