import { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreenModule from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  useFonts as useSpaceGrotesk,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk'
import {
  useFonts as useAtkinson,
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_400Regular_Italic,
  AtkinsonHyperlegible_700Bold,
} from '@expo-google-fonts/atkinson-hyperlegible'

import type { RootStackParamList } from './src/navigation/types'
import { AuthProvider } from './src/context/AuthProvider'
import { initRuntimeConfig } from './src/services/runtimeConfig'
import { hasSeenIntro } from './src/services/introFlag'

import { SplashIFScreen } from './src/screens/SplashIFScreen/SplashIFScreen'
import { SplashScreen } from './src/screens/SplashScreen/SplashScreen'
import { ProfileSelectionScreen } from './src/screens/ProfileSelectionScreen/ProfileSelectionScreen'
import { LoginScreen } from './src/screens/LoginScreen/LoginScreen'
import { PrimaryRegisterScreen } from './src/screens/PrimaryRegisterScreen/PrimaryRegisterScreen'
import { ResponsibleRegisterScreen } from './src/screens/ResponsibleRegisterScreen/ResponsibleRegisterScreen'
import { LoginSuccessScreen } from './src/screens/LoginSuccessScreen/LoginSuccessScreen'
import { HomeScreen } from './src/screens/HomeScreen/HomeScreen'
import { ProfileScreen } from './src/screens/ProfileScreen/ProfileScreen'
import { SettingsScreen } from './src/screens/SettingsScreen/SettingsScreen'

SplashScreenModule.preventAutoHideAsync().catch(() => {
  // Se isso falhar (chamado duas vezes, por exemplo), não é fatal.
})

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const [configReady, setConfigReady] = useState(false)
  const [introSeen, setIntroSeen] = useState(false)

  const [spaceGroteskLoaded] = useSpaceGrotesk({ SpaceGrotesk_500Medium, SpaceGrotesk_700Bold })
  const [atkinsonLoaded] = useAtkinson({
    AtkinsonHyperlegible_400Regular,
    AtkinsonHyperlegible_400Regular_Italic,
    AtkinsonHyperlegible_700Bold,
  })

  useEffect(() => {
    // A splash do IF só aparece na primeira abertura: o flag precisa estar
    // lido antes de o navegador montar a rota inicial.
    Promise.all([initRuntimeConfig(), hasSeenIntro().then(setIntroSeen)]).finally(() => setConfigReady(true))
  }, [])

  const appReady = configReady && spaceGroteskLoaded && atkinsonLoaded

  const onLayoutRootView = useCallback(() => {
    if (appReady) {
      SplashScreenModule.hideAsync().catch(() => {})
    }
  }, [appReady])

  if (!appReady) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator
              initialRouteName={introSeen ? 'Splash' : 'SplashIF'}
              screenOptions={{ headerShown: false, animation: 'fade' }}
            >
              <Stack.Screen name="SplashIF" component={SplashIFScreen} />
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="ProfileSelection" component={ProfileSelectionScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="PrimaryRegister" component={PrimaryRegisterScreen} />
              <Stack.Screen name="ResponsibleRegister" component={ResponsibleRegisterScreen} />
              <Stack.Screen name="LoginSuccess" component={LoginSuccessScreen} />
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Settings" component={SettingsScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
