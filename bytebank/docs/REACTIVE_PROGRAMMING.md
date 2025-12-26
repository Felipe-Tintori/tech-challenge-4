# Documentação de Programação Reativa - ByteBank

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Redux Observable](#redux-observable)
3. [Streams Reativos](#streams-reativos)
4. [Hooks Customizados](#hooks-customizados)
5. [Casos de Uso Práticos](#casos-de-uso-práticos)

---

## 🌊 Visão Geral

O ByteBank implementa **Programação Reativa** usando **RxJS** e **Redux Observable** para:

- **Debounce em Buscas**: Aguarda o usuário parar de digitar antes de buscar
- **Throttle em Scroll**: Limita frequência de eventos de scroll
- **Retry Automático**: Retenta operações que falharam
- **Real-time Sync**: Sincronização em tempo real com Firebase
- **Auto-save**: Salva rascunhos automaticamente
- **Filtros Combinados**: Combina múltiplos filtros de forma eficiente

---

## 🎯 Redux Observable

### Configuração

O Redux Observable foi integrado ao Redux store como middleware:

```typescript
// src/store/store.ts
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from '../shared/reactive';

const epicMiddleware = createEpicMiddleware();

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      epicMiddleware, // Redux Observable
      // outros middlewares...
    ),
});

// Inicializa os epics
epicMiddleware.run(rootEpic);
```

### Epics Disponíveis

#### 1. Busca de Transações com Debounce

Aguarda **500ms** após a última mudança antes de buscar:

```typescript
// Dispatch da action
dispatch({ type: 'transactions/setSearchQuery', payload: 'mercado' });

// Epic processa automaticamente com debounce
export const searchTransactionsEpic: Epic = (action$) =>
  action$.pipe(
    filter((action) => action.type === 'transactions/setSearchQuery'),
    debounceTime(500), // ⏱️ Aguarda 500ms
    switchMap((action) => 
      of({ type: 'transactions/searchTransactions', payload: action.payload })
    )
  );
```

**Resultado:** Busca só executa quando usuário parar de digitar por 500ms.

#### 2. Filtros com Debounce

Aplica filtros após **300ms** sem mudanças:

```typescript
// Dispatch
dispatch({ 
  type: 'transactions/updateFilters', 
  payload: { category: 'alimentacao', date: '2025-01' } 
});

// Epic processa com debounce
export const filterTransactionsEpic: Epic = (action$) =>
  action$.pipe(
    filter((action) => action.type === 'transactions/updateFilters'),
    debounceTime(300), // ⏱️ Aguarda 300ms
    map((action) => ({ type: 'transactions/applyFilters', payload: action.payload }))
  );
```

#### 3. Scroll Infinito com Throttle

Limita carregamento para **no máximo 1 por segundo**:

```typescript
// Dispatch ao scrollar
dispatch({ type: 'transactions/loadMore' });

// Epic com throttle
export const loadMoreTransactionsEpic: Epic = (action$, state$) =>
  action$.pipe(
    filter((action) => action.type === 'transactions/loadMore'),
    throttleTime(1000), // 🚦 Máximo 1 por segundo
    switchMap(() => {
      const { page, hasMore, loading } = state$.value.transactions;
      
      if (loading || !hasMore) {
        return of({ type: 'transactions/loadMoreSkipped' });
      }
      
      return of({ type: 'transactions/fetchTransactions', payload: { page: page + 1 } });
    })
  );
```

#### 4. Retry Automático

Retenta **automaticamente até 3 vezes** em caso de falha:

```typescript
// Epic com retry
export const retryFailedOperationsEpic: Epic = (action$) =>
  action$.pipe(
    filter((action) => action.type === 'transactions/createTransactionFailed'),
    switchMap((action) =>
      timer(2000).pipe( // ⏳ Aguarda 2s
        map(() => ({ type: 'transactions/createTransaction', payload: action.payload })),
        retry(3), // 🔄 Tenta até 3 vezes
        catchError(() => of({ type: 'transactions/operationGaveUp' }))
      )
    )
  );
```

#### 5. Auto-save de Rascunhos

Salva automaticamente após **2 segundos** de inatividade:

```typescript
// Dispatch ao editar
dispatch({ type: 'transactions/updateDraft', payload: draftData });

// Epic salva automaticamente
export const autoSaveDraftEpic: Epic = (action$) =>
  action$.pipe(
    filter((action) => action.type === 'transactions/updateDraft'),
    debounceTime(2000), // 💾 Aguarda 2s
    tap(() => console.log('💾 Salvando rascunho...')),
    switchMap((action) =>
      of({ type: 'transactions/draftSaved', payload: action.payload })
    )
  );
```

#### 6. Sync em Tempo Real

Conecta com Firebase e sincroniza em tempo real:

```typescript
export const realtimeSyncEpic: Epic = (action$) =>
  action$.pipe(
    filter((action) => action.type === 'auth/loginSuccess'),
    switchMap((action) => {
      const userId = action.payload.id;
      
      return new Observable((subscriber) => {
        // Listener do Firebase
        const unsubscribe = firestore()
          .collection('transactions')
          .where('userId', '==', userId)
          .onSnapshot((snapshot) => {
            subscriber.next({ 
              type: 'transactions/realtimeUpdate', 
              payload: snapshot.docs 
            });
          });
        
        return unsubscribe;
      }).pipe(
        takeUntil(action$.pipe(filter(a => a.type === 'auth/logout')))
      );
    })
  );
```

---

## 🌊 Streams Reativos

### ReactiveStreamService

Serviço centralizado para criar streams reativos.

#### 1. Stream de Busca

```typescript
import { ReactiveStreamService } from '@/shared/reactive';

// Criar stream
const { search$, results$ } = ReactiveStreamService.createSearchStream(
  async (query) => {
    const response = await fetch(`/api/search?q=${query}`);
    return response.json();
  },
  300 // debounce de 300ms
);

// Subscribe nos resultados
results$.subscribe((data) => {
  console.log('Resultados:', data);
});

// Disparar busca
search$.next('mercado');
search$.next('mercado l'); // Cancela a anterior
search$.next('mercado livre'); // Só esta será executada
```

#### 2. Stream de Filtros

```typescript
const { filter$, results$ } = ReactiveStreamService.createFilterStream(
  async (filters) => {
    return await fetchTransactions(filters);
  },
  500
);

results$.subscribe((transactions) => {
  setTransactions(transactions);
});

// Aplicar filtros
filter$.next({ category: 'alimentacao', month: '2025-01' });
```

#### 3. Stream de Scroll Infinito

```typescript
const { scroll$, loadMore$ } = ReactiveStreamService.createInfiniteScrollStream(
  async () => {
    await loadMoreTransactions();
  },
  0.8 // Carrega quando chegar a 80% do fim
);

loadMore$.subscribe(() => {
  console.log('📜 Carregando mais...');
});

// Em componente ScrollView
onScroll={(event) => {
  const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
  scroll$.next({
    scrollY: contentOffset.y,
    contentHeight: contentSize.height,
    viewportHeight: layoutMeasurement.height,
  });
}}
```

#### 4. Stream com Retry

```typescript
const stream = ReactiveStreamService.createRetryableStream(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Falhou');
    return response.json();
  },
  3, // 3 tentativas
  1000 // 1s entre tentativas
);

stream.subscribe((data) => {
  if (data) {
    console.log('✅ Sucesso:', data);
  } else {
    console.log('❌ Falhou após 3 tentativas');
  }
});
```

#### 5. Stream em Tempo Real

```typescript
const stream = ReactiveStreamService.createRealtimeStream((callback) => {
  // Setup Firebase listener
  const unsubscribe = firestore()
    .collection('transactions')
    .onSnapshot((snapshot) => {
      callback(snapshot.docs.map(doc => doc.data()));
    });
  
  // Cleanup function
  return unsubscribe;
});

stream.subscribe((transactions) => {
  console.log('🔄 Atualização em tempo real:', transactions);
});
```

#### 6. Stream de Auto-save

```typescript
const { save$, status$ } = ReactiveStreamService.createAutoSaveStream(
  async (data) => {
    await AsyncStorage.setItem('draft', JSON.stringify(data));
  },
  2000 // Auto-save após 2s
);

status$.subscribe((status) => {
  console.log('Status:', status); // 'idle' | 'saving' | 'saved' | 'error'
});

// Salvar dados
save$.next({ description: 'Compra no mercado', value: 50 });
```

---

## 🎣 Hooks Customizados

### useReactiveSearch

Hook para busca reativa em componentes React Native:

```typescript
import { useReactiveSearch } from '@/shared/hooks/useReactive';

function SearchScreen() {
  const { results, loading, search } = useReactiveSearch(
    async (query) => {
      const response = await fetch(`/api/search?q=${query}`);
      return response.json();
    },
    300 // debounce
  );

  return (
    <View>
      <TextInput 
        placeholder="Buscar..."
        onChangeText={search}
      />
      
      {loading && <ActivityIndicator />}
      
      <FlatList 
        data={results}
        renderItem={({ item }) => <TransactionCard transaction={item} />}
      />
    </View>
  );
}
```

### useReactiveFilter

```typescript
function FilteredListScreen() {
  const { results, loading, applyFilter } = useReactiveFilter(
    async (filters) => {
      return await fetchTransactionsWithFilters(filters);
    },
    500
  );

  return (
    <View>
      <Picker
        onValueChange={(category) => 
          applyFilter({ category, date: selectedDate })
        }
      >
        <Picker.Item label="Alimentação" value="alimentacao" />
        <Picker.Item label="Transporte" value="transporte" />
      </Picker>
      
      {loading ? <Skeleton /> : <TransactionList data={results} />}
    </View>
  );
}
```

### useReactiveInfiniteScroll

```typescript
function InfiniteScrollScreen() {
  const { loading, onScroll } = useReactiveInfiniteScroll(
    async () => {
      await loadMoreTransactions();
    },
    0.8
  );

  return (
    <ScrollView
      onScroll={(event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        onScroll(
          contentOffset.y,
          contentSize.height,
          layoutMeasurement.height
        );
      }}
      scrollEventThrottle={16}
    >
      {transactions.map(t => <TransactionCard key={t.id} transaction={t} />)}
      {loading && <LoadingSpinner />}
    </ScrollView>
  );
}
```

### useReactiveRetry

```typescript
function DataFetchScreen() {
  const { data, loading, error, execute } = useReactiveRetry(
    async () => {
      const response = await fetch('/api/critical-data');
      if (!response.ok) throw new Error('Falhou');
      return response.json();
    },
    3, // 3 tentativas
    1000 // 1s entre tentativas
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  
  return <DataDisplay data={data} />;
}
```

### useRealtimeStream

```typescript
function RealtimeTransactionsScreen() {
  const { data, connected } = useRealtimeStream(
    (callback) => {
      const unsubscribe = firestore()
        .collection('transactions')
        .onSnapshot((snapshot) => {
          callback(snapshot.docs.map(doc => doc.data()));
        });
      
      return unsubscribe;
    },
    true // enabled
  );

  return (
    <View>
      <StatusBadge connected={connected} />
      <TransactionList transactions={data || []} />
    </View>
  );
}
```

### useAutoSave

```typescript
function DraftEditorScreen() {
  const [draft, setDraft] = useState({});
  const { status, save } = useAutoSave(
    async (data) => {
      await SecureStorageService.saveObject('draft', data);
    },
    2000
  );

  const handleChange = (field, value) => {
    const newDraft = { ...draft, [field]: value };
    setDraft(newDraft);
    save(newDraft); // Auto-save após 2s
  };

  return (
    <View>
      <StatusIndicator status={status} />
      {/* status: 'idle' | 'saving' | 'saved' | 'error' */}
      
      <TextInput 
        value={draft.description}
        onChangeText={(text) => handleChange('description', text)}
      />
    </View>
  );
}
```

---

## 💡 Casos de Uso Práticos

### 1. Busca de Transações com Debounce

**Problema:** Buscar no servidor a cada caractere digitado sobrecarrega a API.

**Solução:**

```typescript
function TransactionSearchScreen() {
  const { results, loading, search } = useReactiveSearch(
    async (query) => {
      const response = await fetch(`/api/transactions/search?q=${query}`);
      return response.json();
    },
    500 // Só busca após 500ms sem digitação
  );

  return (
    <SearchBar
      placeholder="Buscar transação..."
      onChangeText={search}
      loading={loading}
      results={results}
    />
  );
}
```

### 2. Filtros Combinados

**Problema:** Múltiplos filtros (categoria, data, tipo) causam várias requisições.

**Solução:**

```typescript
function FilteredTransactionsScreen() {
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('');

  const { results, loading, applyFilter } = useReactiveFilter(
    async (filters) => {
      return await fetchTransactions(filters);
    },
    500
  );

  useEffect(() => {
    // Só aplica filtro após 500ms da última mudança
    applyFilter({ category, date, type });
  }, [category, date, type]);

  return (
    <View>
      <CategoryPicker value={category} onChange={setCategory} />
      <DatePicker value={date} onChange={setDate} />
      <TypePicker value={type} onChange={setType} />
      
      {loading ? <Skeleton /> : <TransactionList data={results} />}
    </View>
  );
}
```

### 3. Scroll Infinito Otimizado

**Problema:** Eventos de scroll são disparados centenas de vezes por segundo.

**Solução:**

```typescript
function InfiniteTransactionList() {
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);

  const { loading, onScroll } = useReactiveInfiniteScroll(
    async () => {
      const newData = await fetchTransactions(page + 1);
      setTransactions([...transactions, ...newData]);
      setPage(page + 1);
    },
    0.8 // Carrega ao chegar em 80%
  );

  return (
    <FlatList
      data={transactions}
      onScroll={(event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        onScroll(contentOffset.y, contentSize.height, layoutMeasurement.height);
      }}
      scrollEventThrottle={16}
      ListFooterComponent={loading ? <LoadingSpinner /> : null}
    />
  );
}
```

### 4. Auto-save de Rascunhos

**Problema:** Usuário perde dados se fechar o app sem salvar.

**Solução:**

```typescript
function NewTransactionScreen() {
  const [transaction, setTransaction] = useState({
    description: '',
    value: 0,
    category: '',
  });

  const { status, save } = useAutoSave(
    async (data) => {
      await SecureStorageService.saveObject('transaction_draft', data);
      console.log('💾 Rascunho salvo automaticamente');
    },
    2000
  );

  const handleChange = (field, value) => {
    const updated = { ...transaction, [field]: value };
    setTransaction(updated);
    save(updated); // Salva automaticamente após 2s
  };

  return (
    <View>
      <AutoSaveIndicator status={status} />
      
      <TextInput 
        value={transaction.description}
        onChangeText={(text) => handleChange('description', text)}
      />
      
      <CurrencyInput 
        value={transaction.value}
        onChange={(value) => handleChange('value', value)}
      />
    </View>
  );
}
```

### 5. Retry Automático em Operações Críticas

**Problema:** Rede instável causa falhas em operações importantes.

**Solução:**

```typescript
function CreateTransactionButton({ transaction }) {
  const { data, loading, error, execute } = useReactiveRetry(
    async () => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(transaction),
      });
      
      if (!response.ok) throw new Error('Falha ao criar transação');
      
      return response.json();
    },
    3, // Tenta até 3 vezes
    1000 // 1s entre tentativas
  );

  return (
    <Button
      title={loading ? 'Salvando...' : 'Salvar Transação'}
      onPress={execute}
      disabled={loading}
    >
      {error && <ErrorMessage message="Falha após 3 tentativas. Tente novamente." />}
      {data && <SuccessMessage message="Transação criada com sucesso!" />}
    </Button>
  );
}
```

---

## 📊 Benefícios da Programação Reativa

| Benefício | Sem Reatividade | Com Reatividade |
|-----------|----------------|-----------------|
| **Busca** | 10 requisições ao digitar "mercado" | 1 requisição após parar de digitar |
| **Filtros** | 3 requisições ao mudar 3 filtros | 1 requisição após todas as mudanças |
| **Scroll** | 100+ eventos/segundo | 1 evento/segundo (throttle) |
| **Retry** | Falha permanente na 1ª tentativa | 3 tentativas automáticas |
| **Auto-save** | Usuário precisa clicar "Salvar" | Salva automaticamente após 2s |
| **Real-time** | Precisa atualizar manualmente | Sincroniza automaticamente |

---

## 🎯 Operadores RxJS Mais Usados

### debounceTime
Aguarda X milissegundos após último evento:
```typescript
searchQuery$.pipe(debounceTime(500))
```

### throttleTime
Limita frequência (máximo 1 evento por X ms):
```typescript
scrollEvent$.pipe(throttleTime(1000))
```

### distinctUntilChanged
Ignora eventos duplicados consecutivos:
```typescript
filterChange$.pipe(distinctUntilChanged())
```

### switchMap
Cancela observable anterior ao receber novo:
```typescript
searchQuery$.pipe(
  switchMap(query => fetch(`/api/search?q=${query}`))
)
```

### retry
Retenta automaticamente em caso de erro:
```typescript
fetchData$.pipe(retry({ count: 3, delay: 1000 }))
```

### catchError
Trata erros sem quebrar o stream:
```typescript
operation$.pipe(
  catchError(error => of({ error: error.message }))
)
```

### takeUntil
Para o stream quando outro observable emite:
```typescript
realtimeSync$.pipe(
  takeUntil(logout$)
)
```

---

## 📚 Referências

- [RxJS Documentation](https://rxjs.dev/)
- [Redux Observable](https://redux-observable.js.org/)
- [Learn RxJS](https://www.learnrxjs.io/)
- [RxJS Marbles (Interactive Diagrams)](https://rxmarbles.com/)

---

**Última Atualização:** Janeiro 2025  
**Versão:** 1.0.0
