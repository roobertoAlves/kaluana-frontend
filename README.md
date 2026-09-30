# Atlas de Sinais — App (Expo / React Native)

Conversão do frontend web (Vite + React + Capacitor) para um app nativo de
verdade via Expo, motivada pelos problemas de vídeo e compatibilidade do
WebView do Capacitor, e pela ausência de um caminho para iOS sem depender de
Mac local. Mesma estrutura de pastas do projeto web (`screens/`,
`components/`, `services/`, `types/`, `context/`), portada para primitivos
React Native.

## Por que Expo em vez de continuar no Capacitor

- **Vídeo**: `expo-video` usa o player nativo da plataforma. O `<video>` do
  Capacitor roda dentro da WebView e sofre com autoplay/codec/`playsinline`
  — exatamente os problemas relatados.
- **iOS sem Mac**: builds de iOS pelo EAS Build (`eas build --platform ios`)
  rodam num Mac na nuvem da Expo. Não elimina 100% a necessidade de Mac (conta
  Apple Developer paga ainda é exigida para rodar em iPhone físico), mas tira
  a exigência de possuir um Mac local, que o Capacitor não resolve.
- **Custo**: a camada visual foi reescrita (era inevitável, web e nativo não
  compartilham componentes de UI), mas services/types/context são JavaScript
  puro e não dependiam de DOM, então portaram quase sem mudança.

## O que mudou por causa da plataforma (não por escolha de design)

| Web (Capacitor) | Mobile (Expo) | Motivo |
|---|---|---|
| `CapacitorHttp` | `fetch` nativo | RN já usa a pilha de rede do SO, não precisa de plugin para contornar WebView |
| `window.localStorage` | `@react-native-async-storage/async-storage` | Não existe `window` em React Native |
| `@radix-ui/react-toast` | `Animated` (RN) num componente próprio | Radix depende de DOM; não existe equivalente direto |
| CSS Modules + `clip-path` | `StyleSheet.create` + `react-native-svg` (polígonos) | RN não tem CSS nem `clip-path`; formas diagonais viram SVG |
| `<video>` HTML | `expo-video` (`useVideoPlayer` + `VideoView`) | Player nativo, sem as limitações do WebView |
| Emoji no menu inferior | `@expo/vector-icons` (Ionicons) | Emoji renderiza diferente por fabricante Android; ícone vetorial é consistente |
| React Router | `@react-navigation/native-stack` | Equivalente ao React Router mantendo rotas centralizadas num arquivo (`src/navigation/types.ts`), não o roteamento por arquivo do Expo Router — escolhido de propósito para ficar mais perto da estrutura anterior |

## Como rodar

```bash
npm install
cp .env.example .env   # ajuste EXPO_PUBLIC_API_BASE_URL se necessário
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android ou iPhone) para testar sem
precisar buildar nada. Funcionalidades nativas mais específicas (algumas
notificações, por exemplo) podem exigir um development build
(`npx expo run:android`) em vez do Expo Go — vídeo e o resto do que está
aqui funciona normalmente no Expo Go.

## Verificação

`npx tsc --noEmit` e `npx eslint .` rodaram limpos aqui, sem erros. Não
consigo abrir um emulador Android/iOS neste ambiente para confirmar
visualmente — o próximo passo real é `npx expo start` na sua máquina.

## Pendências conhecidas (herdadas do projeto web, não introduzidas agora)

- Login social (Google/GitHub) continua só visual, sem ação — o endpoint do
  backend (`SocialAuthController`) tem um bug de verificação de token que
  precisa ser corrigido antes de conectar isso de verdade (já reportado
  separadamente).
- Sessão em memória (perde ao fechar o app), mesma decisão do projeto web.
- `HomeScreen`/`ProfileScreen`/`SettingsScreen` seguem como telas simples,
  ainda sem os módulos reais de rotina/registro.
- Build de iOS não testado (sem Mac neste ambiente); os comandos do EAS
  Build estão documentados acima, mas não executados.

## Configuração da API em runtime

Igual à versão web: `EXPO_PUBLIC_API_BASE_URL` é embutida em tempo de build.
Para trocar sem rebuildar, `src/services/runtimeConfig.ts` guarda um override
no AsyncStorage do aparelho. Pelo Metro/Hermes debugger:

```js
kaluanaConfig.setApiBaseUrlOverride('https://homolog.kaluana.com.br')
```
