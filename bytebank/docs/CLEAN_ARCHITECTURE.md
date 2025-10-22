# ByteBank - Clean Architecture Implementation

Este documento descreve a implementação da **Clean Architecture** no aplicativo ByteBank, seguindo os princípios de Robert C. Martin para criar uma arquitetura escalável, testável e independente de frameworks.

## 🏗️ Arquitetura

A Clean Architecture foi implementada com três camadas principais:

### 1. **Domain Layer** (Camada de Domínio)
**Localização:** `src/domain/`

Esta é a camada mais interna e contém a lógica de negócio pura, independente de qualquer framework ou tecnologia externa.

#### **Entidades** (`src/domain/entities/`)
- **`User.ts`**: Entidade que representa um usuário do sistema
  - Validação de email
  - Regras de negócio para perfil
  - Métodos para formatação e serialização
  
- **`Transaction.ts`**: Entidade que representa uma transação financeira
  - Validações de valor e data
  - Regras de negócio específicas (ex: limite de valores)
  - Enums para categorias, métodos de pagamento e status
  - Métodos para formatação de moeda e datas

#### **Repositórios (Interfaces)** (`src/domain/repositories/`)
- **`IUserRepository.ts`**: Contrato para operações de usuário
  - Autenticação (login, register, logout)
  - Gerenciamento de sessão
  - Persistência local (AsyncStorage)
  
- **`ITransactionRepository.ts`**: Contrato para operações de transação
  - CRUD completo de transações
  - Filtros e consultas avançadas
  - Estatísticas e relatórios
  - Upload/remoção de comprovantes
  - Subscriptions em tempo real

#### **Casos de Uso** (`src/domain/usecases/`)

**Autenticação:**
- **`LoginUseCase`**: Lógica para autenticação de usuários
- **`RegisterUseCase`**: Lógica para registro de novos usuários
- **`LogoutUseCase`**: Lógica para logout e limpeza de sessão
- **`LoadUserUseCase`**: Lógica para carregamento de dados do usuário

**Transações:**
- **`CreateTransactionUseCase`**: Lógica para criação de transações
- **`UpdateTransactionUseCase`**: Lógica para atualização de transações
- **`DeleteTransactionUseCase`**: Lógica para exclusão de transações
- **`GetTransactionsUseCase`**: Lógica para recuperação e filtragem de transações

### 2. **Infrastructure Layer** (Camada de Infraestrutura)
**Localização:** `src/infrastructure/`

Esta camada contém as implementações concretas dos repositórios e serviços externos.

#### **Repositórios** (`src/infrastructure/repositories/`)
- **`FirebaseUserRepository.ts`**: Implementação concreta do `IUserRepository`
  - Integração com Firebase Auth
  - Persistência no Firestore
  - Gerenciamento de AsyncStorage
  
- **`FirebaseTransactionRepository.ts`**: Implementação concreta do `ITransactionRepository`
  - Operações CRUD no Firestore
  - Upload de arquivos no Firebase Storage
  - Subscriptions em tempo real
  - Queries complexas com filtros

#### **Dependency Injection** (`src/infrastructure/di/`)
- **`DIContainer.ts`**: Container de injeção de dependência
  - Singleton pattern para instância única
  - Configuração de repositórios
  - Instanciação dos casos de uso
  - Interface unificada para acesso aos serviços

### 3. **Presentation Layer** (Camada de Apresentação)
**Localização:** `src/presentation/`

Esta camada contém os adaptadores que conectam a Clean Architecture com o Redux.

#### **Adaptadores** (`src/presentation/adapters/`)
- **`authThunks.ts`**: Thunks do Redux que utilizam os casos de uso de autenticação
- **`transactionThunks.ts`**: Thunks do Redux que utilizam os casos de uso de transações

## 🔄 Fluxo de Dados

```
UI Components → Redux Hooks → Redux Thunks → Use Cases → Repositories → External Services
     ↑                                                                          ↓
     └──────────────────── Redux Store ←─────────────────────────────────────────┘
```

### Exemplo de Fluxo: Criar Transação

1. **UI Component** chama `addTransaction()` do hook `useTransactions`
2. **Hook** dispatcha `createTransactionAsync` thunk
3. **Thunk** chama `DIContainer.createTransactionUseCase.execute()`
4. **Use Case** aplica validações e regras de negócio
5. **Use Case** chama `transactionRepository.create()`
6. **Repository** persiste no Firebase e retorna entidade
7. **Redux Store** é atualizado com a nova transação
8. **UI** é re-renderizada automaticamente

## 🎯 Benefícios da Implementação

### **1. Separação de Responsabilidades**
- **Domain**: Lógica de negócio pura
- **Infrastructure**: Detalhes de implementação
- **Presentation**: Interface com o usuário

### **2. Testabilidade**
- Casos de uso podem ser testados isoladamente
- Repositórios podem ser mockados facilmente
- Entidades têm lógica de negócio testável

### **3. Independência de Frameworks**
- Lógica de negócio independe do React Native
- Troca de Firebase por outro banco é simples
- Redux pode ser substituído sem afetar a lógica de negócio

### **4. Reutilização de Código**
- Casos de uso podem ser reutilizados em diferentes plataformas
- Entidades contêm lógica compartilhável
- Repositórios abstraem a fonte de dados

### **5. Manutenibilidade**
- Código organizado em camadas bem definidas
- Dependências claras e explícitas
- Fácil localização e modificação de funcionalidades

## 🛠️ Como Usar

### **Adicionando um Novo Caso de Uso**

1. **Criar a entidade** (se necessário):
```typescript
// src/domain/entities/NewEntity.ts
export class NewEntity {
  constructor(
    public readonly id: string,
    public readonly name: string
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
  }
}
```

2. **Definir interface do repositório**:
```typescript
// src/domain/repositories/INewRepository.ts
export interface INewRepository {
  create(data: CreateNewData): Promise<NewEntity>;
  getById(id: string): Promise<NewEntity | null>;
}
```

3. **Implementar o caso de uso**:
```typescript
// src/domain/usecases/CreateNewUseCase.ts
export class CreateNewUseCase {
  constructor(private repository: INewRepository) {}

  async execute(data: CreateNewData): Promise<NewEntity> {
    // Validações e regras de negócio
    return await this.repository.create(data);
  }
}
```

4. **Implementar o repositório**:
```typescript
// src/infrastructure/repositories/FirebaseNewRepository.ts
export class FirebaseNewRepository implements INewRepository {
  async create(data: CreateNewData): Promise<NewEntity> {
    // Implementação Firebase
  }
}
```

5. **Adicionar ao DIContainer**:
```typescript
// src/infrastructure/di/DIContainer.ts
private _newRepository: INewRepository;
private _createNewUseCase: CreateNewUseCase;

constructor() {
  this._newRepository = new FirebaseNewRepository();
  this._createNewUseCase = new CreateNewUseCase(this._newRepository);
}
```

6. **Criar thunk**:
```typescript
// src/presentation/adapters/newThunks.ts
export const createNewAsync = createAsyncThunk(
  'new/create',
  async (data: CreateNewData, { rejectWithValue }) => {
    try {
      const result = await diContainer.createNewUseCase.execute(data);
      return result.toPlainObject();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
```

## 📊 Métricas de Qualidade

### **Antes da Clean Architecture**
- ❌ Lógica de negócio misturada com UI
- ❌ Dependência direta do Firebase nos componentes
- ❌ Dificuldade para testes unitários
- ❌ Baixa reutilização de código

### **Depois da Clean Architecture**
- ✅ Lógica de negócio isolada e testável
- ✅ Independência de frameworks externos
- ✅ Fácil substituição de serviços
- ✅ Código altamente reutilizável
- ✅ Manutenibilidade e escalabilidade melhoradas

## 🚀 Próximos Passos

1. **Implementar testes unitários** para casos de uso e entidades
2. **Adicionar validação de schemas** com bibliotecas como Joi ou Yup
3. **Implementar cache inteligente** na camada de infraestrutura
4. **Adicionar logging estruturado** para monitoramento
5. **Criar documentação de APIs** para os casos de uso

## 📚 Referências

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350884)
- [Dependency Injection Patterns](https://martinfowler.com/articles/injection.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

---

**Implementação realizada como parte do Tech Challenge 4 - FIAP**

*A Clean Architecture proporciona uma base sólida para o crescimento e evolução do aplicativo ByteBank, garantindo qualidade, manutenibilidade e escalabilidade a longo prazo.*