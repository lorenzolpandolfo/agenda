# Agenda App - React Native

Este é um aplicativo React Native desenvolvido com Expo e TypeScript para gerenciamento de agenda.

## 🚀 Tecnologias

- React Native 0.79.6
- Expo SDK 53
- TypeScript 5.8.3
- React Navigation
- Yarn

## �� Funcionalidades

- **Tela de Registro Completa:**
  - Registro de pacientes e psicólogos
  - Validação automática de CRP para psicólogos
  - Upload de foto de perfil
  - Validação de formulário em tempo real
  - Integração com API do backend

- **Sistema de Usuários:**
  - **PATIENT**: Usuários comuns (pacientes)
  - **PROFESSIONAL**: Psicólogos com CRP
  - Status automático baseado no tipo de usuário
  - Validação de CRP pelo Conselho de Psicologia

- **Validações:**
  - Email único e válido (mínimo 3 caracteres)
  - Senha com mínimo 6 caracteres
  - CRP com formato exato (CRP/01-12345)
  - Campos obrigatórios: nome, email, senha, biografia

## 🛠️ Instalação

1. Instale as dependências:
```bash
yarn install
```

2. Inicie o projeto:
```bash
yarn start
```

## 📁 Estrutura do Projeto

```
src/
├── components/     # CustomInput, CustomButton, ImagePicker
├── screens/        # RegisterScreen
├── services/       # userService (API)
├── types/          # Tipos TypeScript para usuários
├── App.tsx         # Navegação principal
└── env.config.ts   # Configuração da API
```

## 🎯 Scripts Disponíveis

- `yarn start` - Inicia o servidor de desenvolvimento
- `yarn android` - Executa no Android
- `yarn ios` - Executa no iOS
- `yarn web` - Executa na web

## 📱 Como Executar

1. **Android**: `yarn android`
2. **iOS**: `yarn ios`
3. **Web**: `yarn web`

## 🔧 Desenvolvimento

O projeto está configurado com:
- TypeScript para tipagem estática
- Validação de formulários
- Componentes reutilizáveis
- Integração com API REST
- Estrutura de pastas organizada

## 🌐 API Integration

- **Endpoint**: `http://127.0.0.1:8000`
- **Registro**: `POST /user/register`
- **Login**: `POST /user/login`
- **Validações**: CRP, email único, senha mínima

## 📝 Fluxo de Registro

### Paciente (PATIENT)
- Nome, email, senha, biografia obrigatórios
- Status: READY (ativo imediatamente)
- Sem necessidade de CRP

### Psicólogo (PROFESSIONAL)
- Nome, email, senha, biografia obrigatórios
- CRP obrigatório com formato específico
- Status: WAITING_VALIDATION (aguarda validação)
- Após validação: READY (pode criar horários)

## 📝 Licença

Este projeto está sob a licença MIT. 