import { IUserRepository } from '../../repositories/IUserRepository';

export class LogoutUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<void> {
    try {
      // Remove usuário do storage local
      await this.userRepository.removeUserFromStorage();
      
      // Faz logout no sistema de autenticação
      await this.userRepository.logout();
      
    } catch (error: any) {
      // Log do erro mas não falha (logout deve sempre funcionar)
      console.error('Erro durante logout:', error);
      
      // Garante que pelo menos o storage local seja limpo
      try {
        await this.userRepository.removeUserFromStorage();
      } catch (storageError) {
        console.error('Erro ao limpar storage local:', storageError);
      }
    }
  }
}