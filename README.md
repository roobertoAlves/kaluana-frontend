# Kaluanã - aplicativo (front-end)

Aplicativo móvel do Kaluanã, de apoio à organização e à autorregulação de
pessoas com TDAH. Ele consome a API do repositório `kaluana-backend`, que
precisa estar rodando para cadastro, login e sincronização dos dados.

Tecnologias: React Native 0.88 com TypeScript, Expo SDK 58 (roda no Expo Go
ou em build de desenvolvimento), React Navigation, expo-notifications (lembretes), expo-audio
(sons) e expo-print (relatório em PDF).

## 1. Pré-requisitos

- Node.js 20 ou superior (testado com a versão 22) e npm.
- A API do Kaluanã no ar (ver o README do `kaluana-backend`).
- Para rodar no celular, o jeito mais simples é o aplicativo Expo Go (Play
  Store ou App Store), na versão compatível com o SDK 58. Como alternativa, há
  o build de desenvolvimento do Kaluanã (seção 4.2).

## 2. Instalação das dependências

```bash
npm ci
```

O `npm ci` instala exatamente as versões do `package-lock.json`. Use
`npm install` apenas se for adicionar ou atualizar uma biblioteca.

## 3. Endereço da API

O aplicativo lê o endereço da API da variável `EXPO_PUBLIC_API_BASE_URL`,
no arquivo `.env`. Crie o seu a partir do modelo e ajuste o endereço:

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.10:8080
```

- No celular, use o IP do computador que roda a API na rede local, nunca
  `localhost` (no celular, `localhost` é o próprio celular).
- No emulador Android, o computador é `http://10.0.2.2:8080`.
- O valor entra no aplicativo quando o Metro inicia: depois de mudar o
  `.env`, pare e inicie de novo.
- Na API, a variável `FRONTEND_ORIGIN` precisa aceitar a origem do aplicativo
  quando ele roda no navegador.

## 4. Como rodar no celular

O celular e o computador precisam estar na mesma rede Wi-Fi.

### 4.1 Com o Expo Go (mais simples)

```bash
npm start
```

O terminal abre no modo de build de desenvolvimento. Aperte `s` para trocar
para o Expo Go (o terminal passa a mostrar "Using Expo Go") e leia o QR code
com o Expo Go (Android) ou com a câmera (iPhone). Outra opção é iniciar direto
no Expo Go:

```bash
npm run start:go
```

Todas as funções do aplicativo funcionam no Expo Go, inclusive os lembretes
(notificações locais), os sons e o relatório em PDF. A diferença é que o
aplicativo aparece dentro do Expo Go, e não com o nome e o ícone do Kaluanã.

### 4.2 Com o build de desenvolvimento (opcional)

O build de desenvolvimento instala o Kaluanã como um aplicativo próprio, mais
parecido com a versão final. Ele é instalado uma vez (ou quando mudar alguma
biblioteca nativa) e há dois caminhos.

Pela nuvem do Expo (precisa de uma conta gratuita em expo.dev):

```bash
npx eas-cli login
```

```bash
npm run build:dev
```

Ao final, o Expo mostra um link e um QR code para baixar o APK; instale no
celular. O endereço da API desse build está em `eas.json`, no perfil
`development`.

Ou compilando na própria máquina (Android Studio e celular por USB ou
emulador):

```bash
npm run android
```

Com o build instalado, no dia a dia basta rodar `npm start` (sem apertar `s`)
e abrir o Kaluanã no celular, ou ler o QR code mostrado no terminal.

## 5. Como rodar no navegador (opcional)

A versão web serve para conferir telas rapidamente; notificações e alguns
recursos nativos não funcionam nela. Ela precisa de duas bibliotecas que não
fazem parte do aplicativo móvel, então instale-as sem salvar no projeto:

```bash
npx expo install react-dom react-native-web
```

```bash
npm run web
```

## 6. Verificações

```bash
npx tsc --noEmit
```

```bash
npm run lint
```

```bash
npm test
```

Os testes (Node test runner) cobrem as regras puras do aplicativo, como
montagem do plano do dia, sessão de foco, tarefas, lembretes e relatório.

## 7. Estrutura do código

| Pasta            | Conteúdo                                                                      |
| ---------------- | ----------------------------------------------------------------------------- |
| `App.tsx`        | Rotas do aplicativo e provedores (sessão, temporizador)                       |
| `src/screens`    | Uma pasta por tela (tarefas, lembretes, plano do dia, relatório...)           |
| `src/components` | Componentes reutilizáveis (botões, campos, seletores de horário)              |
| `src/features`   | Regras puras e testadas, sem React (plano, tarefas, lembretes, relatório)     |
| `src/services`   | Comunicação com a API (`http.ts` é o cliente único), notificações e PDF       |
| `src/context`    | Sessão do usuário (com renovação automática do login) e temporizador          |
| `src/hooks`      | Dados compartilhados entre telas (listas sincronizadas com a API)             |
| `src/styles`     | Cores, fontes e espaçamentos (tokens do Figma)                                |
| `assets`         | Imagens, fontes e sons (os sons são gerados por `scripts/generate-noise.mjs`) |

## 8. Perfis de uso

- Usuário principal: cria a conta em "Registrar" e usa todas as funções. Em
  Configurações, gera o código de emparelhamento e escolhe o que cada pessoa
  conectada pode ver.
- Responsável ou profissional: cria a conta em "Emparelhar" com o código
  recebido. Vê apenas o que foi liberado para ele e pode gerar o relatório em
  PDF.

## 9. Problemas comuns

- "Erro de conexão com ...": a API não está no ar ou o endereço em
  `EXPO_PUBLIC_API_BASE_URL` está errado. Confira com
  `http://<ip>:8080/actuator/health` no navegador do celular.
- O QR code não abre no Expo Go: confira se o terminal mostra "Using Expo
  Go" (aperte `s` para trocar) e se o Expo Go do celular é compatível com o
  SDK 58 (atualize pela loja).
- Mudou o `.env` e nada mudou: reinicie o Metro com `npx expo start -c`.
- `npm ci` falha: confira a versão do Node (`node -v`) e apague a pasta
  `node_modules` antes de tentar de novo.
