# Documentação de Segurança - ByteBank

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Criptografia](#criptografia)
3. [Armazenamento Seguro](#armazenamento-seguro)
4. [Validação e Sanitização](#validação-e-sanitização)
5. [Melhores Práticas](#melhores-práticas)

---

## 🔒 Visão Geral

O ByteBank implementa múltiplas camadas de segurança para proteger dados sensíveis dos usuários:

- **Criptografia AES-256**: Dados sensíveis são criptografados antes do armazenamento
- **Expo SecureStore**: Armazenamento nativo seguro para tokens e credenciais
- **Validação Robusta**: Sanitização de inputs para prevenir XSS e injeções
- **Firebase Auth**: Autenticação segura com HTTPS
- **Proteção de Variáveis**: Configurações sensíveis em variáveis de ambiente

---

## 🔐 Criptografia

### EncryptionService

Serviço centralizado para criptografia de dados usando **crypto-js** com AES-256.

#### Exemplo de Uso

```typescript
import { EncryptionService } from '@/infrastructure/security';

// Criptografar string
const encrypted = EncryptionService.encrypt('dados sensíveis');
console.log(encrypted); // U2FsdGVkX1... (texto criptografado)

// Descriptografar
const decrypted = EncryptionService.decrypt(encrypted);
console.log(decrypted); // 'dados sensíveis'

// Criptografar objeto
const user = { id: '123', token: 'abc' };
const encryptedObj = EncryptionService.encryptObject(user);

// Descriptografar objeto
const decryptedObj = EncryptionService.decryptObject<User>(encryptedObj);

// Gerar hash SHA-256 (verificação de integridade)
const hash = EncryptionService.hash('senha123');
const isValid = EncryptionService.verifyHash('senha123', hash); // true
```

#### Métodos Disponíveis

- `encrypt(data: string): string` - Criptografa texto
- `decrypt(encryptedData: string): string` - Descriptografa texto
- `encryptObject<T>(obj: T): string` - Criptografa objeto JavaScript
- `decryptObject<T>(data: string): T` - Descriptografa para objeto
- `hash(data: string): string` - Gera hash SHA-256
- `verifyHash(data: string, hash: string): boolean` - Verifica hash

---

## 🗄️ Armazenamento Seguro

### SecureStorageService

Wrapper sobre **Expo SecureStore** com criptografia adicional.

#### Exemplo de Uso

```typescript
import { SecureStorageService, SecureStorageKeys } from '@/infrastructure/security';

// Salvar token de autenticação
await SecureStorageService.save(
  SecureStorageKeys.AUTH_TOKEN, 
  'eyJhbGciOiJIUzI1NiIs...'
);

// Salvar objeto (ex: dados do usuário)
await SecureStorageService.saveObject(SecureStorageKeys.USER_DATA, {
  id: '123',
  email: 'usuario@exemplo.com',
  name: 'João Silva'
});

// Recuperar token
const token = await SecureStorageService.get(SecureStorageKeys.AUTH_TOKEN);

// Recuperar objeto
const userData = await SecureStorageService.getObject<UserData>(
  SecureStorageKeys.USER_DATA
);

// Verificar se existe
const hasToken = await SecureStorageService.exists(SecureStorageKeys.AUTH_TOKEN);

// Remover dados
await SecureStorageService.remove(SecureStorageKeys.AUTH_TOKEN);
```

#### Chaves Disponíveis

```typescript
export const SecureStorageKeys = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  USER_CREDENTIALS: 'user_credentials',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  LAST_LOGIN: 'last_login',
} as const;
```

#### Diferença: SecureStore vs AsyncStorage

| Característica | SecureStore | AsyncStorage |
|---------------|-------------|--------------|
| Criptografia Nativa | ✅ Sim | ❌ Não |
| Keychain/Keystore | ✅ Sim | ❌ Não |
| Ideal Para | Tokens, senhas | Preferências, cache |
| Performance | Média | Rápida |
| Segurança | Alta | Baixa |

---

## ✅ Validação e Sanitização

### ValidationService

Valida e sanitiza dados de entrada para prevenir **XSS**, **injeções** e outros ataques.

#### Email

```typescript
import { ValidationService } from '@/infrastructure/security';

const result = ValidationService.email('usuario@exemplo.com');
if (result.isValid) {
  console.log('Email válido:', result.sanitized);
} else {
  console.error('Erro:', result.error);
}
```

#### Senha

```typescript
const result = ValidationService.password('MinhaSenh@123');
if (result.isValid) {
  console.log('Senha forte:', result.strength); // 'Forte', 'Média', 'Fraca'
} else {
  console.error('Erro:', result.error);
}

// Requisitos:
// - Mínimo 8 caracteres
// - Máximo 128 caracteres
// - Pelo menos 3 de: maiúsculas, minúsculas, números, especiais
```

#### Valor Monetário

```typescript
const result = ValidationService.money('1.234,56');
if (result.isValid) {
  console.log('Valor:', result.sanitized); // 1234.56 (número)
} else {
  console.error('Erro:', result.error);
}
```

#### Nome

```typescript
const result = ValidationService.name('João da Silva');
if (result.isValid) {
  console.log('Nome válido:', result.sanitized);
}
```

#### Data

```typescript
const result = ValidationService.date('2025-01-15T10:30:00Z');
if (result.isValid) {
  console.log('Data:', result.sanitized); // Date object
}
```

#### CPF (Brasil)

```typescript
const result = ValidationService.cpf('123.456.789-09');
if (result.isValid) {
  console.log('CPF:', result.sanitized); // '12345678909' (sem formatação)
}
```

#### Texto Livre (Sanitização XSS)

```typescript
const userInput = '<script>alert("xss")</script>Olá';
const safe = ValidationService.sanitizeText(userInput);
console.log(safe); // '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;Olá'
```

#### Outros Validadores

```typescript
// URL
ValidationService.url('https://exemplo.com');

// UUID
ValidationService.uuid('550e8400-e29b-41d4-a716-446655440000');

// Apenas números
ValidationService.numeric('12345');

// Apenas letras
ValidationService.alpha('AbcDef');

// Comprimento
ValidationService.length('texto', 3, 10);
```

---

## 🛡️ Melhores Práticas

### 1. Nunca Armazene Senhas em Texto Puro

❌ **Errado:**
```typescript
await AsyncStorage.setItem('password', 'senha123');
```

✅ **Correto:**
```typescript
// Firebase Auth já faz hash da senha, não armazene localmente
// Se necessário, use SecureStore com criptografia
await SecureStorageService.save(SecureStorageKeys.USER_CREDENTIALS, credentials);
```

### 2. Valide TODOS os Inputs do Usuário

❌ **Errado:**
```typescript
const transaction = {
  description: userInput, // Vulnerável a XSS
  value: parseFloat(valueInput), // Pode ser NaN ou negativo
};
```

✅ **Correto:**
```typescript
const descriptionValidation = ValidationService.sanitizeText(userInput);
const valueValidation = ValidationService.money(valueInput);

if (valueValidation.isValid) {
  const transaction = {
    description: descriptionValidation,
    value: valueValidation.sanitized,
  };
}
```

### 3. Use Secure Store para Dados Sensíveis

❌ **Errado:**
```typescript
await AsyncStorage.setItem('auth_token', token);
```

✅ **Correto:**
```typescript
await SecureStorageService.save(SecureStorageKeys.AUTH_TOKEN, token);
```

### 4. Proteja Variáveis de Ambiente

❌ **Errado:**
```typescript
// Hardcoded no código
const API_KEY = 'abc123xyz';
```

✅ **Correto:**
```typescript
// .env (não comitar no git)
EXPO_PUBLIC_API_KEY=abc123xyz

// No código
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
```

Adicione no `.gitignore`:
```
.env
.env.local
```

### 5. Implemente Logout Seguro

```typescript
export const logoutSecurely = async () => {
  // 1. Limpar Redux
  dispatch(logout());
  
  // 2. Remover dados seguros
  await SecureStorageService.remove(SecureStorageKeys.AUTH_TOKEN);
  await SecureStorageService.remove(SecureStorageKeys.USER_DATA);
  
  // 3. Limpar cache
  await AsyncStorage.clear();
  
  // 4. Deslogar do Firebase
  await auth().signOut();
  
  console.log('✅ Logout seguro concluído');
};
```

### 6. Verificação de Integridade

```typescript
// Ao salvar dados críticos
const data = JSON.stringify(transaction);
const hash = EncryptionService.hash(data);

await SecureStorageService.save('transaction', data);
await SecureStorageService.save('transaction_hash', hash);

// Ao recuperar
const savedData = await SecureStorageService.get('transaction');
const savedHash = await SecureStorageService.get('transaction_hash');

if (EncryptionService.verifyHash(savedData, savedHash)) {
  console.log('✅ Dados íntegros');
} else {
  console.error('❌ Dados corrompidos ou adulterados');
}
```

### 7. Timeout de Sessão

```typescript
let lastActivity = Date.now();
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutos

// Em cada interação
const updateActivity = () => {
  lastActivity = Date.now();
};

// Verificação periódica
setInterval(async () => {
  const inactive = Date.now() - lastActivity > SESSION_TIMEOUT;
  
  if (inactive) {
    console.log('⏰ Sessão expirada por inatividade');
    await logoutSecurely();
  }
}, 60000); // Verifica a cada 1 minuto
```

---

## 🚨 Avisos de Segurança

### ⚠️ Chave de Criptografia

A chave de criptografia padrão (`bytebank-secure-key-2025`) é apenas para **desenvolvimento**.

**Em produção, SEMPRE use:**

```bash
# .env
EXPO_PUBLIC_ENCRYPTION_KEY=sua-chave-super-segura-gerada-aleatoriamente-minimo-32-caracteres
```

**Gerar chave segura:**

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Python
python -c "import secrets; print(secrets.token_hex(32))"

# Online (use apenas em ambiente seguro)
# https://www.random.org/strings/
```

### ⚠️ HTTPS Obrigatório

Sempre use **HTTPS** em produção para proteger dados em trânsito.

```typescript
// Firebase já usa HTTPS por padrão
// Para APIs próprias:
const API_URL = __DEV__ 
  ? 'http://localhost:3000' 
  : 'https://api.bytebank.com.br';
```

### ⚠️ Atualizações de Segurança

Mantenha as dependências atualizadas:

```bash
npm audit
npm audit fix
```

Monitorar vulnerabilidades:
- [Snyk](https://snyk.io/)
- [GitHub Dependabot](https://github.com/dependabot)

---

## 📚 Referências

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Crypto-JS Documentation](https://github.com/brix/crypto-js)
- [Validator.js](https://github.com/validatorjs/validator.js)

---

**Última Atualização:** Janeiro 2025  
**Versão:** 1.0.0
