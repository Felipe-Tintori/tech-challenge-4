import validator from 'validator';

/**
 * Serviço de validação e sanitização de dados
 * Protege contra XSS, SQL Injection e outros ataques
 */
export class ValidationService {
  /**
   * Valida e sanitiza email
   */
  static email(email: string): { isValid: boolean; sanitized: string; error?: string } {
    const trimmed = email.trim();
    const sanitized = validator.escape(trimmed);
    
    if (!validator.isEmail(sanitized)) {
      return {
        isValid: false,
        sanitized,
        error: 'Email inválido',
      };
    }
    
    return {
      isValid: true,
      sanitized: validator.normalizeEmail(sanitized) || sanitized,
    };
  }

  /**
   * Valida senha com critérios de segurança
   */
  static password(password: string): { isValid: boolean; error?: string; strength?: string } {
    if (password.length < 8) {
      return {
        isValid: false,
        error: 'Senha deve ter no mínimo 8 caracteres',
      };
    }

    if (password.length > 128) {
      return {
        isValid: false,
        error: 'Senha muito longa (máximo 128 caracteres)',
      };
    }

    // Verificar complexidade
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

    if (complexityScore < 3) {
      return {
        isValid: false,
        error: 'Senha deve conter pelo menos 3 dos seguintes: maiúsculas, minúsculas, números, caracteres especiais',
      };
    }

    // Força da senha
    let strength = 'Fraca';
    if (complexityScore === 4 && password.length >= 12) {
      strength = 'Forte';
    } else if (complexityScore >= 3 && password.length >= 10) {
      strength = 'Média';
    }

    return {
      isValid: true,
      strength,
    };
  }

  /**
   * Sanitiza texto para prevenir XSS
   */
  static sanitizeText(text: string): string {
    return validator.escape(text.trim());
  }

  /**
   * Valida e sanitiza nome (letras, espaços, acentos)
   */
  static name(name: string): { isValid: boolean; sanitized: string; error?: string } {
    const trimmed = name.trim();
    
    if (trimmed.length < 2) {
      return {
        isValid: false,
        sanitized: '',
        error: 'Nome muito curto (mínimo 2 caracteres)',
      };
    }

    if (trimmed.length > 100) {
      return {
        isValid: false,
        sanitized: '',
        error: 'Nome muito longo (máximo 100 caracteres)',
      };
    }

    // Permitir letras, espaços e acentos
    const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
    if (!nameRegex.test(trimmed)) {
      return {
        isValid: false,
        sanitized: '',
        error: 'Nome contém caracteres inválidos',
      };
    }

    const sanitized = validator.escape(trimmed);
    
    return {
      isValid: true,
      sanitized,
    };
  }

  /**
   * Valida e sanitiza valor monetário
   */
  static money(value: string | number): { isValid: boolean; sanitized: number; error?: string } {
    const stringValue = String(value).replace(/[^\d.,-]/g, '');
    const normalized = stringValue.replace(',', '.');
    
    if (!validator.isDecimal(normalized, { decimal_digits: '0,2' })) {
      return {
        isValid: false,
        sanitized: 0,
        error: 'Valor monetário inválido',
      };
    }

    const numericValue = parseFloat(normalized);

    if (numericValue < 0) {
      return {
        isValid: false,
        sanitized: 0,
        error: 'Valor não pode ser negativo',
      };
    }

    if (numericValue > 999999999.99) {
      return {
        isValid: false,
        sanitized: 0,
        error: 'Valor muito alto',
      };
    }

    return {
      isValid: true,
      sanitized: Math.round(numericValue * 100) / 100, // Arredondar para 2 casas decimais
    };
  }

  /**
   * Valida data
   */
  static date(date: string): { isValid: boolean; sanitized: Date | null; error?: string } {
    if (!validator.isISO8601(date)) {
      return {
        isValid: false,
        sanitized: null,
        error: 'Data inválida (use formato ISO 8601)',
      };
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return {
        isValid: false,
        sanitized: null,
        error: 'Data inválida',
      };
    }

    // Verificar se não é uma data futura (para transações)
    const now = new Date();
    if (parsedDate > now) {
      return {
        isValid: false,
        sanitized: null,
        error: 'Data não pode ser futura',
      };
    }

    return {
      isValid: true,
      sanitized: parsedDate,
    };
  }

  /**
   * Valida UUID
   */
  static uuid(id: string): { isValid: boolean; error?: string } {
    if (!validator.isUUID(id)) {
      return {
        isValid: false,
        error: 'ID inválido',
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Valida URL
   */
  static url(url: string): { isValid: boolean; sanitized: string; error?: string } {
    const trimmed = url.trim();

    if (!validator.isURL(trimmed, { protocols: ['http', 'https'], require_protocol: true })) {
      return {
        isValid: false,
        sanitized: '',
        error: 'URL inválida',
      };
    }

    return {
      isValid: true,
      sanitized: trimmed,
    };
  }

  /**
   * Remove caracteres especiais perigosos
   */
  static sanitizeInput(input: string): string {
    // Remove scripts, tags HTML e caracteres perigosos
    let sanitized = validator.stripLow(input);
    sanitized = validator.escape(sanitized);
    return sanitized;
  }

  /**
   * Valida comprimento de string
   */
  static length(
    text: string,
    min: number,
    max: number
  ): { isValid: boolean; error?: string } {
    if (!validator.isLength(text, { min, max })) {
      return {
        isValid: false,
        error: `Texto deve ter entre ${min} e ${max} caracteres`,
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Valida se string contém apenas números
   */
  static numeric(text: string): { isValid: boolean; error?: string } {
    if (!validator.isNumeric(text)) {
      return {
        isValid: false,
        error: 'Deve conter apenas números',
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Valida se string contém apenas letras
   */
  static alpha(text: string): { isValid: boolean; error?: string } {
    if (!validator.isAlpha(text, 'pt-BR')) {
      return {
        isValid: false,
        error: 'Deve conter apenas letras',
      };
    }

    return {
      isValid: true,
    };
  }

  /**
   * Valida CPF (formato brasileiro)
   */
  static cpf(cpf: string): { isValid: boolean; sanitized: string; error?: string } {
    // Remove caracteres não numéricos
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) {
      return {
        isValid: false,
        sanitized: '',
        error: 'CPF deve ter 11 dígitos',
      };
    }

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleaned)) {
      return {
        isValid: false,
        sanitized: '',
        error: 'CPF inválido',
      };
    }

    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) {
      return {
        isValid: false,
        sanitized: '',
        error: 'CPF inválido',
      };
    }

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit === 10 || digit === 11) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) {
      return {
        isValid: false,
        sanitized: '',
        error: 'CPF inválido',
      };
    }

    return {
      isValid: true,
      sanitized: cleaned,
    };
  }
}
