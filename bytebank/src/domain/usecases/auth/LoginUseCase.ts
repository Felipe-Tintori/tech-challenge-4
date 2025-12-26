import { User, AuthCredentials } from '../../entities/User';
import { IUserRepository } from '../../repositories/IUserRepository';
import { ValidationService } from '../../../infrastructure/security';

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(credentials: AuthCredentials): Promise<User> {
    // Validações de entrada com sanitização
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

    // Valida e sanitiza email
    const emailValidation = ValidationService.email(credentials.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error || 'Email inválido');
    }
    credentials.email = emailValidation.sanitized;

    // Valida senha
    const passwordValidation = ValidationService.password(credentials.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error || 'Senha inválida');
    }
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