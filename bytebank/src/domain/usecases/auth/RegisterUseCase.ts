import { User, RegisterData } from '../../entities/User';
import { IUserRepository } from '../../repositories/IUserRepository';
import { ValidationService } from '../../../infrastructure/security';

export class RegisterUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: RegisterData): Promise<User> {
    // Validações de entrada com sanitização
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

    // Valida e sanitiza nome
    const nameValidation = ValidationService.name(data.name);
    if (!nameValidation.isValid) {
      throw new Error(nameValidation.error || 'Nome inválido');
    }
    data.name = nameValidation.sanitized;

    // Valida e sanitiza email
    const emailValidation = ValidationService.email(data.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.error || 'Email inválido');
    }
    data.email = emailValidation.sanitized;

    // Valida senha com critérios de segurança
    const passwordValidation = ValidationService.password(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.error || 'Senha inválida');
    }
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