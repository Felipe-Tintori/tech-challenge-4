import { Transaction, CreateTransactionData } from '../../entities/Transaction';
import { ITransactionRepository } from '../../repositories/ITransactionRepository';

export class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(data: CreateTransactionData): Promise<Transaction> {
    // Validações de negócio
    this.validateTransactionData(data);
    
    try {
      // Cria a transação através do repositório
      const transaction = await this.transactionRepository.create(data);
      
      return transaction;
    } catch (error: any) {
      throw this.handleCreateError(error);
    }
  }

  private validateTransactionData(data: CreateTransactionData): void {
    if (!data.userId || data.userId.trim().length === 0) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!data.category) {
      throw new Error('Categoria é obrigatória');
    }

    if (!data.paymentMethod) {
      throw new Error('Método de pagamento é obrigatório');
    }

    if (!data.value || data.value <= 0) {
      throw new Error('Valor deve ser maior que zero');
    }

    if (data.value > 1000000) {
      throw new Error('Valor máximo permitido é R$ 1.000.000,00');
    }

    if (!data.date) {
      throw new Error('Data é obrigatória');
    }

    // Não permite transações muito no futuro (mais de 1 ano)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (data.date > oneYearFromNow) {
      throw new Error('Data da transação não pode ser superior a 1 ano no futuro');
    }

    // Não permite transações muito antigas (mais de 5 anos)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    
    if (data.date < fiveYearsAgo) {
      throw new Error('Data da transação não pode ser anterior a 5 anos');
    }

    if (data.description && data.description.length > 200) {
      throw new Error('Descrição deve ter no máximo 200 caracteres');
    }
  }

  private handleCreateError(error: any): Error {
    if (error.code === 'permission-denied') {
      return new Error('Você não tem permissão para criar esta transação');
    }
    
    if (error.code === 'network-request-failed') {
      return new Error('Erro de conexão. Verifique sua internet');
    }

    if (error.message.includes('quota')) {
      return new Error('Limite de transações atingido. Tente novamente mais tarde');
    }

    return new Error('Erro ao criar transação. Tente novamente');
  }
}