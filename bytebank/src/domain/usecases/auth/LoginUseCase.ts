import { User, AuthCredentials } from '../../entities/User';
import { IUserRepository } from '../../repositories/IUserRepository';

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(credentials: AuthCredentials): Promise<User> {
    // Validações de entrada
    this.validateCredentials(credentials);
    
    try {
      // Executa o login através do repositório
      const user = await this.userRepository.login(credentials);
      
      // Salva usuário no storage local para persistência
      await this.userRepository.saveUserToStorage(user);
      
      return user;
    } catch (error: any) {
      // Transforma erros técnicos em erros de domínio
      throw this.handleLoginError(error);
    }
  }

  private validateCredentials(credentials: AuthCredentials): void {
    if (!credentials.email || !credentials.password) {
      throw new Error('Email e senha são obrigatórios');
    }

    if (!this.isValidEmail(credentials.email)) {
      throw new Error('Email inválido');
    }

    if (credentials.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private handleLoginError(error: any): Error {
    // Mapeia erros específicos do Firebase para mensagens de usuário
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return new Error('Email ou senha incorretos');
    }
    
    if (error.code === 'auth/too-many-requests') {
      return new Error('Muitas tentativas de login. Tente novamente mais tarde');
    }
    
    if (error.code === 'auth/network-request-failed') {
      return new Error('Erro de conexão. Verifique sua internet');
    }

    return new Error('Erro ao fazer login. Tente novamente');
  }
}