import { User, AuthCredentials, RegisterData } from '../entities/User';

export interface IUserRepository {
  /**
   * Autentica um usuário com email e senha
   */
  login(credentials: AuthCredentials): Promise<User>;

  /**
   * Registra um novo usuário
   */
  register(data: RegisterData): Promise<User>;

  /**
   * Faz logout do usuário atual
   */
  logout(): Promise<void>;

  /**
   * Obtém o usuário atualmente logado
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Carrega usuário salvo no storage local
   */
  loadUserFromStorage(): Promise<User | null>;

  /**
   * Salva usuário no storage local
   */
  saveUserToStorage(user: User): Promise<void>;

  /**
   * Remove usuário do storage local
   */
  removeUserFromStorage(): Promise<void>;

  /**
   * Atualiza dados do usuário
   */
  updateUser(userId: string, data: Partial<User>): Promise<User>;

  /**
   * Deleta conta do usuário
   */
  deleteUser(userId: string): Promise<void>;

  /**
   * Verifica se há um usuário logado
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Obtém token de autenticação atual
   */
  getAuthToken(): Promise<string | null>;
}