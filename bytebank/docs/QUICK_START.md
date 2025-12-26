# 🎯 Guia de Uso Rápido - Bytebank

## 📦 O que foi implementado?

### 1. Segurança (Security)

#### Criptografia e Armazenamento Seguro

```typescript
import { EncryptionService, SecureStorageService, SecureStorageKeys } from '@/infrastructure/security';

// Salvar token de autenticação de forma segura
await SecureStorageService.save(SecureStorageKeys.AUTH_TOKEN, userToken);

// Recuperar token
const token = await SecureStorageService.get(SecureStorageKeys.AUTH_TOKEN);

// Criptografar dados sensíveis
const encryptedData = EncryptionService.encrypt('dados confidenciais');

// Descriptografar
const decryptedData = EncryptionService.decrypt(encryptedData);
```

#### Validação de Inputs

```typescript
import { ValidationService } from '@/infrastructure/security';

// Validar email
const emailResult = ValidationService.email(userEmail);
if (!emailResult.isValid) {
  showError(emailResult.error);
}

// Validar senha (força: Forte, Média, Fraca)
const passwordResult = ValidationService.password(userPassword);
if (!passwordResult.isValid) {
  showError(passwordResult.error);
} else {
  console.log('Força da senha:', passwordResult.strength);
}

// Validar valor monetário
const moneyResult = ValidationService.money('R$ 1.234,56');
if (moneyResult.isValid) {
  saveTransaction(moneyResult.sanitized); // 1234.56 (número limpo)
}

// Sanitizar texto contra XSS
const safeText = ValidationService.sanitizeText(userInput);
```

---

### 2. Programação Reativa (Reactive Programming)

#### Busca com Debounce

```typescript
import { useReactiveSearch } from '@/shared/hooks/useReactive';

function SearchTransactionsScreen() {
  const { results, loading, search } = useReactiveSearch(
    async (query) => {
      // Busca só executa após 300ms sem digitação
      return await fetchTransactions(query);
    },
    300 // debounce em ms
  );

  return (
    <TextInput
      placeholder="Buscar transação..."
      onChangeText={search}
    />
  );
}
```

#### Filtros com Debounce

```typescript
import { useReactiveFilter } from '@/shared/hooks/useReactive';

function FilteredTransactions() {
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  const { results, loading, applyFilter } = useReactiveFilter(
    async (filters) => {
      return await fetchFilteredTransactions(filters);
    },
    500
  );

  useEffect(() => {
    // Só aplica após 500ms da última mudança
    applyFilter({ category, date });
  }, [category, date]);

  return (
    <View>
      <CategoryPicker onChange={setCategory} />
      <DatePicker onChange={setDate} />
      {loading ? <Skeleton /> : <TransactionList data={results} />}
    </View>
  );
}
```

#### Scroll Infinito com Throttle

```typescript
import { useReactiveInfiniteScroll } from '@/shared/hooks/useReactive';

function InfiniteList() {
  const [page, setPage] = useState(1);

  const { loading, onScroll } = useReactiveInfiniteScroll(
    async () => {
      await loadMoreData(page + 1);
      setPage(page + 1);
    },
    0.8 // Carrega ao atingir 80% da lista
  );

  return (
    <FlatList
      data={transactions}
      onScroll={(event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        onScroll(contentOffset.y, contentSize.height, layoutMeasurement.height);
      }}
      scrollEventThrottle={16}
      ListFooterComponent={loading ? <Spinner /> : null}
    />
  );
}
```

#### Auto-save de Rascunhos

```typescript
import { useAutoSave } from '@/shared/hooks/useReactive';

function TransactionForm() {
  const [draft, setDraft] = useState({});

  const { status, save } = useAutoSave(
    async (data) => {
      await SecureStorageService.saveObject('transaction_draft', data);
    },
    2000 // Salva 2s após última mudança
  );

  const handleChange = (field, value) => {
    const updated = { ...draft, [field]: value };
    setDraft(updated);
    save(updated); // Auto-save automático
  };

  return (
    <View>
      {status === 'saving' && <Text>Salvando...</Text>}
      {status === 'saved' && <Text>✅ Salvo</Text>}
      
      <TextInput 
        value={draft.description}
        onChangeText={(text) => handleChange('description', text)}
      />
    </View>
  );
}
```

#### Retry Automático

```typescript
import { useReactiveRetry } from '@/shared/hooks/useReactive';

function DataFetch() {
  const { data, loading, error, execute } = useReactiveRetry(
    async () => {
      // Tenta até 3 vezes com 1s de intervalo
      const response = await fetch('/api/critical-data');
      if (!response.ok) throw new Error('Falhou');
      return response.json();
    },
    3,    // 3 tentativas
    1000  // 1s entre tentativas
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  return <Data value={data} />;
}
```

---

### 3. Redux Observable (Epics)

Os epics funcionam automaticamente em background. Não precisa chamar explicitamente:

```typescript
// ✅ Automático: Busca com debounce
dispatch({ type: 'transactions/setSearchQuery', payload: 'mercado' });
// Epic aguarda 500ms e faz busca única

// ✅ Automático: Retry em falhas
dispatch({ type: 'transactions/createTransactionFailed', payload: data });
// Epic tenta automaticamente 3x com 2s de intervalo

// ✅ Automático: Auto-save de rascunhos
dispatch({ type: 'transactions/updateDraft', payload: draftData });
// Epic salva automaticamente após 2s

// ✅ Automático: Scroll infinito
dispatch({ type: 'transactions/loadMore' });
// Epic limita para no máximo 1 requisição por segundo
```

---

## 🔐 Checklist de Segurança

### ✅ Ao implementar Login/Registro

```typescript
import { ValidationService, SecureStorageService } from '@/infrastructure/security';

// 1. Validar email
const emailValidation = ValidationService.email(email);
if (!emailValidation.isValid) {
  throw new Error(emailValidation.error);
}

// 2. Validar senha
const passwordValidation = ValidationService.password(password);
if (!passwordValidation.isValid) {
  throw new Error(passwordValidation.error);
}

// 3. Salvar token de forma segura
await SecureStorageService.save(SecureStorageKeys.AUTH_TOKEN, token);

// 4. Salvar dados do usuário criptografados
await SecureStorageService.saveObject(SecureStorageKeys.USER_DATA, userData);
```

### ✅ Ao criar Transações

```typescript
// 1. Validar descrição (sanitizar XSS)
const safeDescription = ValidationService.sanitizeText(description);

// 2. Validar valor monetário
const valueValidation = ValidationService.money(value);
if (!valueValidation.isValid) {
  throw new Error(valueValidation.error);
}

// 3. Validar data
const dateValidation = ValidationService.date(date);
if (!dateValidation.isValid) {
  throw new Error(dateValidation.error);
}

// 4. Criar transação com dados sanitizados
const transaction = {
  description: safeDescription,
  value: valueValidation.sanitized,
  date: dateValidation.sanitized,
};
```

### ✅ Ao fazer Logout

```typescript
// Remover dados sensíveis
await SecureStorageService.remove(SecureStorageKeys.AUTH_TOKEN);
await SecureStorageService.remove(SecureStorageKeys.USER_DATA);

// Limpar Redux
dispatch(logout());

// Deslogar do Firebase
await auth().signOut();
```

---

## 🌊 Checklist de Programação Reativa

### ✅ Busca de Dados

- Use `useReactiveSearch` com debounce de 300-500ms
- Cancela busca anterior automaticamente
- Mostra loading durante busca

### ✅ Filtros

- Use `useReactiveFilter` com debounce de 500ms
- Combina múltiplos filtros em uma única requisição
- Evita sobrecarga do servidor

### ✅ Scroll Infinito

- Use `useReactiveInfiniteScroll` com throttle de 1s
- Carrega ao atingir 80% da lista
- Mostra spinner no footer

### ✅ Operações Críticas

- Use `useReactiveRetry` com 3 tentativas
- Intervalo de 1s entre tentativas
- Mostra erro apenas após última tentativa

### ✅ Auto-save

- Use `useAutoSave` com 2s de debounce
- Mostra status (idle, saving, saved, error)
- Salva automaticamente em background

---

## 📚 Documentação Completa

- **Segurança**: [`bytebank/docs/SECURITY.md`](./bytebank/docs/SECURITY.md)
- **Programação Reativa**: [`bytebank/docs/REACTIVE_PROGRAMMING.md`](./bytebank/docs/REACTIVE_PROGRAMMING.md)
- **Performance**: [`bytebank/docs/PERFORMANCE_OPTIMIZATION.md`](./bytebank/docs/PERFORMANCE_OPTIMIZATION.md)
- **Arquitetura**: [`bytebank/docs/CLEAN_ARCHITECTURE.md`](./bytebank/docs/CLEAN_ARCHITECTURE.md)
- **State Management**: [`bytebank/docs/STATE_MANAGEMENT.md`](./bytebank/docs/STATE_MANAGEMENT.md)

---

## 🎓 Exemplos Práticos

### Exemplo 1: Busca de Transações com Segurança

```typescript
import { useReactiveSearch } from '@/shared/hooks/useReactive';
import { ValidationService } from '@/infrastructure/security';

function SearchScreen() {
  const { results, loading, search } = useReactiveSearch(
    async (query) => {
      // Sanitiza busca contra XSS
      const safeQuery = ValidationService.sanitizeText(query);
      
      // Busca no Firestore
      const snapshot = await firestore()
        .collection('transactions')
        .where('description', '>=', safeQuery)
        .where('description', '<=', safeQuery + '\uf8ff')
        .get();
      
      return snapshot.docs.map(doc => doc.data());
    },
    300
  );

  return (
    <View>
      <SearchBar onChangeText={search} />
      {loading && <ActivityIndicator />}
      <FlatList data={results} renderItem={...} />
    </View>
  );
}
```

### Exemplo 2: Formulário com Auto-save e Validação

```typescript
import { useAutoSave } from '@/shared/hooks/useReactive';
import { ValidationService, SecureStorageService } from '@/infrastructure/security';

function TransactionForm() {
  const [draft, setDraft] = useState({ description: '', value: '' });
  const [errors, setErrors] = useState({});

  const { status, save } = useAutoSave(
    async (data) => {
      await SecureStorageService.saveObject('draft', data);
    },
    2000
  );

  const handleChange = (field, value) => {
    let validation;
    
    if (field === 'description') {
      const safe = ValidationService.sanitizeText(value);
      validation = { isValid: true, sanitized: safe };
    } else if (field === 'value') {
      validation = ValidationService.money(value);
    }

    if (!validation.isValid) {
      setErrors({ ...errors, [field]: validation.error });
      return;
    }

    const updated = { ...draft, [field]: validation.sanitized };
    setDraft(updated);
    save(updated);
    
    // Limpa erro
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  return (
    <View>
      <AutoSaveIndicator status={status} />
      
      <TextInput
        placeholder="Descrição"
        value={draft.description}
        onChangeText={(text) => handleChange('description', text)}
      />
      {errors.description && <ErrorText>{errors.description}</ErrorText>}
      
      <CurrencyInput
        placeholder="Valor"
        value={draft.value}
        onChange={(value) => handleChange('value', value)}
      />
      {errors.value && <ErrorText>{errors.value}</ErrorText>}
    </View>
  );
}
```

---

**Última Atualização:** Janeiro 2025  
**Versão:** 1.0.0
