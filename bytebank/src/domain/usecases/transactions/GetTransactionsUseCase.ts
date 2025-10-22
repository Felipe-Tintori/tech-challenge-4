import { Transaction, TransactionFilters } from '../../entities/Transaction';
import { ITransactionRepository } from '../../repositories/ITransactionRepository';

export class GetTransactionsUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(userId: string): Promise<Transaction[]> {
    // Validações de entrada
    this.validateInput(userId);
    
    try {
      // Obtém as transações através do repositório
      const transactions = await this.transactionRepository.getByUserId(userId);
      
      // Ordena por data (mais recentes primeiro)
      return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    } catch (error: any) {
      throw this.handleGetError(error);
    }
  }

  async executeWithFilters(userId: string, filters: TransactionFilters): Promise<Transaction[]> {
    // Validações de entrada
    this.validateInput(userId);
    this.validateFilters(filters);
    
    try {
      // Obtém as transações filtradas através do repositório
      const transactions = await this.transactionRepository.getByFilters(userId, filters);
      
      // Ordena por data (mais recentes primeiro)
      return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    } catch (error: any) {
      throw this.handleGetError(error);
    }
  }

  async executeByCategory(userId: string, category: string): Promise<Transaction[]> {
    // Validações de entrada
    this.validateInput(userId);
    
    if (!category || category.trim().length === 0) {
      throw new Error('Categoria é obrigatória');
    }
    
    try {
      // Obtém as transações por categoria através do repositório
      const transactions = await this.transactionRepository.getByCategory(userId, category);
      
      // Ordena por data (mais recentes primeiro)
      return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    } catch (error: any) {
      throw this.handleGetError(error);
    }
  }

  async executeByPeriod(userId: string, startDate: Date, endDate: Date): Promise<Transaction[]> {
    // Validações de entrada
    this.validateInput(userId);
    this.validateDateRange(startDate, endDate);
    
    try {
      // Obtém as transações por período através do repositório
      const transactions = await this.transactionRepository.getByPeriod(userId, startDate, endDate);
      
      // Ordena por data (mais recentes primeiro)
      return transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
    } catch (error: any) {
      throw this.handleGetError(error);
    }
  }

  private validateInput(userId: string): void {
    if (!userId || userId.trim().length === 0) {
      throw new Error('ID do usuário é obrigatório');
    }
  }

  private validateFilters(filters: TransactionFilters): void {
    if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
      throw new Error('Data inicial deve ser anterior à data final');
    }

    if (filters.minValue !== undefined && filters.minValue < 0) {
      throw new Error('Valor mínimo deve ser maior ou igual a zero');
    }

    if (filters.maxValue !== undefined && filters.maxValue < 0) {
      throw new Error('Valor máximo deve ser maior ou igual a zero');
    }

    if (filters.minValue !== undefined && filters.maxValue !== undefined && filters.minValue > filters.maxValue) {
      throw new Error('Valor mínimo deve ser menor ou igual ao valor máximo');
    }
  }

  private validateDateRange(startDate: Date, endDate: Date): void {
    if (!startDate || !endDate) {
      throw new Error('Datas inicial e final são obrigatórias');
    }

    if (startDate > endDate) {
      throw new Error('Data inicial deve ser anterior à data final');
    }

    if (endDate > new Date()) {
      throw new Error('Data final não pode ser futura');
    }
  }

  private handleGetError(error: any): Error {
    if (error.code === 'permission-denied') {
      return new Error('Você não tem permissão para acessar estas transações');
    }
    
    if (error.code === 'network-request-failed') {
      return new Error('Erro de conexão. Verifique sua internet');
    }

    return new Error('Erro ao carregar transações. Tente novamente');
  }
}