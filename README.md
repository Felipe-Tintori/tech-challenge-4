# Bytebank - Tech Challenge 3

Este é o projeto **Bytebank**, desenvolvido como parte do **Tech Challenge 3** da FIAP. O objetivo do projeto é criar uma aplicação para gerenciar transações financeiras, com funcionalidades como filtros, exibição de extratos e integração com o Firebase.

## 🛠️ Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento mobile.
- **TypeScript**: Superset do JavaScript para tipagem estática.
- **Firebase**: Backend-as-a-Service para autenticação e banco de dados.
- **React Hook Form**: Gerenciamento de formulários.
- **React Native Paper**: Biblioteca de componentes UI.
- **Expo**: Ferramenta para desenvolvimento e execução do projeto.

## 🚀 Como Rodar o Projeto

Certifique-se de ter as seguintes ferramentas instaladas:
- **Node.js** (versão 16 ou superior)
- **Yarn** ou **npm**
- **Expo CLI** (instale com `npm install -g expo-cli`)

Clone o repositório para sua máquina local:
```bash
git clone https://github.com/Felipe-Tintori/tech-challenge3.git
cd bytebank

Instale as dependências do projeto:
# Usando Yarn
yarn install

# Ou usando npm
npm install

rodar aplicativo no celular Android com Expo
npx expo start

caso não de pra rodar , só rodar com
npx expo start --tunnel

### Configuração Firebase

Criar um Projeto no Firebase:

Acesse o Firebase Console.
Clique em Adicionar Projeto e siga as instruções para criar um novo projeto.
Ativar os Serviços Necessários:

Authentication:
No menu lateral, clique em Authentication.
Ative o provedor de autenticação (ex.: Email/Password).
Firestore Database:
No menu lateral, clique em Firestore Database.
Configure o banco de dados no modo de teste.
Obter o Arquivo de Configuração:

Para Android:
Baixe o arquivo google-services.json e coloque-o na pasta android/app do projeto.
Para iOS:
Baixe o arquivo GoogleService-Info.plist e coloque-o na pasta ios do projeto.
Adicionar as Configurações no Projeto:

No arquivo firebaseConfig.ts (ou equivalente), adicione as configurações do Firebase:

import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_STORAGE_BUCKET",
  messagingSenderId: "SEU_MESSAGING_SENDER_ID",
  appId: "SEU_APP_ID",
};

const app = initializeApp(firebaseConfig);

export default app;
