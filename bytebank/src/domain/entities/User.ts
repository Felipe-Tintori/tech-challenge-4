export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly profileImage?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {
    this.validateUser();
  }

  private validateUser(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!this.name || this.name.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres');
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Email inválido');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public updateProfile(name?: string, profileImage?: string): User {
    return new User(
      this.id,
      name || this.name,
      this.email,
      profileImage !== undefined ? profileImage : this.profileImage,
      this.createdAt,
      new Date()
    );
  }

  public isEmailValid(): boolean {
    return this.isValidEmail(this.email);
  }

  public getDisplayName(): string {
    return this.name || this.email.split('@')[0];
  }

  public toPlainObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      profileImage: this.profileImage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
}