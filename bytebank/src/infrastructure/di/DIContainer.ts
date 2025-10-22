import { LoginUseCase } from '../../domain/usecases/auth/LoginUseCase';
import { RegisterUseCase } from '../../domain/usecases/auth/RegisterUseCase';
import { LogoutUseCase } from '../../domain/usecases/auth/LogoutUseCase';
import { LoadUserUseCase } from '../../domain/usecases/auth/LoadUserUseCase';
import { CreateTransactionUseCase } from '../../domain/usecases/transactions/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../../domain/usecases/transactions/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../../domain/usecases/transactions/DeleteTransactionUseCase';
import { GetTransactionsUseCase } from '../../domain/usecases/transactions/GetTransactionsUseCase';

import { FirebaseUserRepository } from '../repositories/FirebaseUserRepository';
import { FirebaseTransactionRepository } from '../repositories/FirebaseTransactionRepository';

import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

/**
 * Container de Injeção de Dependência
 * 
 * Responsável por:
 * - Instanciar repositórios
 * - Instanciar casos de uso com suas dependências
 * - Fornecer interface única para acessar todos os serviços
 */
export class DIContainer {
  // Singleton instance
  private static instance: DIContainer;

  // Repositórios
  private _userRepository: IUserRepository;
  private _transactionRepository: ITransactionRepository;

  // Casos de uso - Auth
  private _loginUseCase: LoginUseCase;
  private _registerUseCase: RegisterUseCase;
  private _logoutUseCase: LogoutUseCase;
  private _loadUserUseCase: LoadUserUseCase;

  // Casos de uso - Transações
  private _createTransactionUseCase: CreateTransactionUseCase;
  private _updateTransactionUseCase: UpdateTransactionUseCase;
  private _deleteTransactionUseCase: DeleteTransactionUseCase;
  private _getTransactionsUseCase: GetTransactionsUseCase;

  private constructor() {
    // Inicializa repositórios
    this._userRepository = new FirebaseUserRepository();
    this._transactionRepository = new FirebaseTransactionRepository();

    // Inicializa casos de uso de autenticação
    this._loginUseCase = new LoginUseCase(this._userRepository);
    this._registerUseCase = new RegisterUseCase(this._userRepository);
    this._logoutUseCase = new LogoutUseCase(this._userRepository);
    this._loadUserUseCase = new LoadUserUseCase(this._userRepository);

    // Inicializa casos de uso de transações
    this._createTransactionUseCase = new CreateTransactionUseCase(this._transactionRepository);
    this._updateTransactionUseCase = new UpdateTransactionUseCase(this._transactionRepository);
    this._deleteTransactionUseCase = new DeleteTransactionUseCase(this._transactionRepository);
    this._getTransactionsUseCase = new GetTransactionsUseCase(this._transactionRepository);
  }

  /**
   * Retorna a instância singleton do container
   */
  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  // Getters para repositórios
  public get userRepository(): IUserRepository {
    return this._userRepository;
  }

  public get transactionRepository(): ITransactionRepository {
    return this._transactionRepository;
  }

  // Getters para casos de uso de autenticação
  public get loginUseCase(): LoginUseCase {
    return this._loginUseCase;
  }

  public get registerUseCase(): RegisterUseCase {
    return this._registerUseCase;
  }

  public get logoutUseCase(): LogoutUseCase {
    return this._logoutUseCase;
  }

  public get loadUserUseCase(): LoadUserUseCase {
    return this._loadUserUseCase;
  }

  // Getters para casos de uso de transações
  public get createTransactionUseCase(): CreateTransactionUseCase {
    return this._createTransactionUseCase;
  }

  public get updateTransactionUseCase(): UpdateTransactionUseCase {
    return this._updateTransactionUseCase;
  }

  public get deleteTransactionUseCase(): DeleteTransactionUseCase {
    return this._deleteTransactionUseCase;
  }

  public get getTransactionsUseCase(): GetTransactionsUseCase {
    return this._getTransactionsUseCase;
  }

  /**
   * Método para resetar todas as instâncias (útil para testes)
   */
  public static reset(): void {
    DIContainer.instance = new DIContainer();
  }

  /**
   * Método para configurar repositórios customizados (útil para testes)
   */
  public setUserRepository(repository: IUserRepository): void {
    this._userRepository = repository;
    this._reinitializeAuthUseCases();
  }

  public setTransactionRepository(repository: ITransactionRepository): void {
    this._transactionRepository = repository;
    this._reinitializeTransactionUseCases();
  }

  private _reinitializeAuthUseCases(): void {
    this._loginUseCase = new LoginUseCase(this._userRepository);
    this._registerUseCase = new RegisterUseCase(this._userRepository);
    this._logoutUseCase = new LogoutUseCase(this._userRepository);
    this._loadUserUseCase = new LoadUserUseCase(this._userRepository);
  }

  private _reinitializeTransactionUseCases(): void {
    this._createTransactionUseCase = new CreateTransactionUseCase(this._transactionRepository);
    this._updateTransactionUseCase = new UpdateTransactionUseCase(this._transactionRepository);
    this._deleteTransactionUseCase = new DeleteTransactionUseCase(this._transactionRepository);
    this._getTransactionsUseCase = new GetTransactionsUseCase(this._transactionRepository);
  }
}