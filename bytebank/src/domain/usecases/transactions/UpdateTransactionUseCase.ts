import { Transaction, UpdateTransactionData } from '../../entities/Transaction';
import { ITransactionRepository } from '../../repositories/ITransactionRepository';

export class UpdateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: string, data: UpdateTransactionData): Promise<Transaction> {
    // Validações de entrada
    this.validateInput(id, data);
    
    try {
      // Verifica se a transação existe
      const existingTransaction = await this.transactionRepository.getById(id);
      if (!existingTransaction) {
        throw new Error('Transação não encontrada');
      }

      // Validações de negócio
      this.validateUpdateData(data, existingTransaction);
      
      // Atualiza a transação através do repositório
      const updatedTransaction = await this.transactionRepository.update(id, data);
      
      return updatedTransaction;
    } catch (error: any) {
      throw this.handleUpdateError(error);
    }
  }

  private validateInput(id: string, data: UpdateTransactionData): void {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      throw new Error('ID da transação é obrigatório');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('Dados para atualização são obrigatórios');
    }
  }

  private validateUpdateData(data: UpdateTransactionData, existingTransaction: Transaction): void {
    if (data.value !== undefined) {
      if (data.value <= 0) {
        throw new Error('Valor deve ser maior que zero');
      }
      
      if (data.value > 1000000) {
        throw new Error('Valor máximo permitido é R$ 1.000.000,00');
      }
    }

    if (data.date !== undefined) {
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
    }

    if (data.description !== undefined && data.description.length > 200) {
      throw new Error('Descrição deve ter no máximo 200 caracteres');
    }

    // Regra de negócio: não permite alterar transações muito antigas (mais de 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (existingTransaction.createdAt < thirtyDaysAgo) {
      throw new Error('Não é possível alterar transações criadas há mais de 30 dias');
    }
  }

  private handleUpdateError(error: any): Error {
    if (error.message === 'Transação não encontrada') {
      return error;
    }
    
    if (error.code === 'permission-denied') {
      return new Error('Você não tem permissão para atualizar esta transação');
    }
    
    if (error.code === 'network-request-failed') {
      return new Error('Erro de conexão. Verifique sua internet');
    }

    return new Error('Erro ao atualizar transação. Tente novamente');
  }
}