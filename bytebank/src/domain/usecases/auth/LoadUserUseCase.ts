import { User } from '../../entities/User';
import { IUserRepository } from '../../repositories/IUserRepository';

export class LoadUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<User | null> {
    try {
      // Primeiro tenta carregar do storage local (mais rápido)
      const storedUser = await this.userRepository.loadUserFromStorage();
      
      if (storedUser) {
        // Verifica se ainda está autenticado
        const isAuthenticated = await this.userRepository.isAuthenticated();
        
        if (isAuthenticated) {
          return storedUser;
        } else {
          // Se não está mais autenticado, limpa o storage
          await this.userRepository.removeUserFromStorage();
        }
      }
      
      // Se não há usuário no storage ou não está autenticado,
      // tenta obter do sistema de autenticação
      const currentUser = await this.userRepository.getCurrentUser();
      
      if (currentUser) {
        // Salva no storage para próximas inicializações
        await this.userRepository.saveUserToStorage(currentUser);
        return currentUser;
      }
      
      return null;
      
    } catch (error: any) {
      console.error('Erro ao carregar usuário:', error);
      
      // Em caso de erro, limpa o storage para evitar dados inconsistentes
      try {
        await this.userRepository.removeUserFromStorage();
      } catch (cleanupError) {
        console.error('Erro ao limpar storage:', cleanupError);
      }
      
      return null;
    }
  }
}