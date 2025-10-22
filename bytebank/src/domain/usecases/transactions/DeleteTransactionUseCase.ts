import { ITransactionRepository } from '../../repositories/ITransactionRepository';

export class DeleteTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(id: string): Promise<void> {
    // Validações de entrada
    this.validateInput(id);
    
    try {
      // Verifica se a transação existe
      const existingTransaction = await this.transactionRepository.getById(id);
      if (!existingTransaction) {
        throw new Error('Transação não encontrada');
      }

      // Validações de negócio
      this.validateDeletion(existingTransaction);
      
      // Remove o comprovante se existir
      if (existingTransaction.receiptUrl) {
        try {
          await this.transactionRepository.removeReceipt(existingTransaction.receiptUrl);
        } catch (receiptError) {
          console.warn('Erro ao remover comprovante:', receiptError);
          // Continua com a exclusão mesmo se não conseguir remover o comprovante
        }
      }
      
      // Deleta a transação através do repositório
      await this.transactionRepository.delete(id);
      
    } catch (error: any) {
      throw this.handleDeleteError(error);
    }
  }

  private validateInput(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('ID da transação é obrigatório');
    }
  }

  private validateDeletion(transaction: any): void {
    // Regra de negócio: não permite deletar transações muito antigas (mais de 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (transaction.createdAt < thirtyDaysAgo) {
      throw new Error('Não é possível deletar transações criadas há mais de 30 dias');
    }

    // Regra de negócio: não permite deletar transações já processadas/confirmadas
    if (transaction.status === 'CONFIRMADA') {
      throw new Error('Não é possível deletar transações já confirmadas');
    }
  }

  private handleDeleteError(error: any): Error {
    if (error.message === 'Transação não encontrada') {
      return error;
    }
    
    if (error.message.includes('30 dias') || error.message.includes('confirmadas')) {
      return error;
    }
    
    if (error.code === 'permission-denied') {
      return new Error('Você não tem permissão para deletar esta transação');
    }
    
    if (error.code === 'network-request-failed') {
      return new Error('Erro de conexão. Verifique sua internet');
    }

    return new Error('Erro ao deletar transação. Tente novamente');
  }
}