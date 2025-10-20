// Auth module types
export interface AuthUser {
  _id: string;
  email: string;
  name: string;
}

export interface LoginForm {
  email: string;
  senha: string;
}

export interface RegistrationForm {
  email: string;
  senha: string;
  name: string;
}