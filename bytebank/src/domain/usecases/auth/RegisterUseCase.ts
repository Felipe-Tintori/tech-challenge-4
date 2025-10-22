import { User, RegisterData } from '../../entities/User';
import { IUserRepository } from '../../repositories/IUserRepository';

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: RegisterData): Promise<User> {
    // Validações de entrada
    try {
      this.validateRegisterData(data);
    } catch (validationError) {
      throw validationError;
    }
    
    try {
      // Executa o registro através do repositório
      const user = await this.userRepository.register(data);
      
      // Salva usuário no storage local para persistência
      await this.userRepository.saveUserToStorage(user);
      
      return user;
    } catch (error: any) {
      // Transforma erros técnicos em erros de domínio
      throw this.handleRegisterError(error);
    }
  }

  private validateRegisterData(data: RegisterData): void {
    if (!data.name || !data.email || !data.password) {
      const missingFields = [];
      if (!data.name) missingFields.push('nome');
      if (!data.email) missingFields.push('email');
      if (!data.password) missingFields.push('senha');
      throw new Error('Nome, email e senha são obrigatórios');
    }

    if (data.name.length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    if (data.name.length > 50) {
      throw new Error('Nome deve ter no máximo 50 caracteres');
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error('Email inválido');
    }

    if (data.password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    if (data.password.length > 50) {
      throw new Error('Senha deve ter no máximo 50 caracteres');
    }

    if (!this.isStrongPassword(data.password)) {
      throw new Error('Senha deve conter pelo menos uma letra e um número');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isStrongPassword(password: string): boolean {
    // Deve conter pelo menos uma letra e um número
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  }

  private handleRegisterError(error: any): Error {
    // Mapeia erros específicos do Firebase para mensagens de usuário
    if (error.code === 'auth/email-already-in-use') {
      return new Error('Este email já está em uso');
    }
    
    if (error.code === 'auth/weak-password') {
      return new Error('Senha muito fraca. Use pelo menos 6 caracteres');
    }
    
    if (error.code === 'auth/invalid-email') {
      return new Error('Email inválido');
    }
    
    if (error.code === 'auth/network-request-failed') {
      return new Error('Erro de conexão. Verifique sua internet');
    }

    if (error.code === 'auth/operation-not-allowed') {
      return new Error('Operação não permitida. Verifique as configurações do Firebase');
    }

    if (error.code === 'auth/too-many-requests') {
      return new Error('Muitas tentativas. Tente novamente mais tarde');
    }

    // Se for um erro de validação nosso, mantenha a mensagem original
    if (error.message && typeof error.message === 'string' && 
        (error.message.includes('Nome') || 
         error.message.includes('Email') || 
         error.message.includes('Senha'))) {
      return error;
    }

    return new Error('Erro ao criar conta. Tente novamente');
  }
}