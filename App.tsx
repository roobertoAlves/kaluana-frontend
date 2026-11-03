import { useCallback, useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreenModule from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native'
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
import { EventLogScreen } from './src/screens/EventLogScreen/EventLogScreen'
import { RemindersScreen } from './src/screens/RemindersScreen/RemindersScreen'
import { CheckInScreen } from './src/screens/CheckInScreen/CheckInScreen'
import { ContactsScreen } from './src/screens/ContactsScreen/ContactsScreen'
import { ReportScreen } from './src/screens/ReportScreen/ReportScreen'
import { TasksScreen } from './src/screens/TasksScreen/TasksScreen'
import { DayPlanScreen } from './src/screens/DayPlanScreen/DayPlanScreen'
import { EditProfileScreen } from './src/screens/EditProfileScreen/EditProfileScreen'
import { TimerPlanScreen } from './src/screens/TimerPlanScreen/TimerPlanScreen'
import { TimerScreen } from './src/screens/TimerScreen/TimerScreen'
import { TimerSoundScreen } from './src/screens/TimerSoundScreen/TimerSoundScreen'
import { TimerDoneScreen } from './src/screens/TimerDoneScreen/TimerDoneScreen'
import { ReminderAlertScreen } from './src/screens/ReminderAlertScreen/ReminderAlertScreen'
import { TimerProvider } from './src/context/TimerContext'
import { getInitialTap, listenNotificationTaps } from './src/services/notifications'
import type { NotificationTap } from './src/services/notifications'

SplashScreenModule.preventAutoHideAsync().catch(() => {
  // Se isso falhar (chamado duas vezes, por exemplo), não é fatal.
})

const Stack = createNativeStackNavigator<RootStackParamList>()
const navRef = createNavigationContainerRef<RootStackParamList>()

/** Toque em notificação: lembrete abre a tela L2; fim de sessão abre o temporizador. */
function openFromTap(t: NotificationTap) {
  if (!navRef.isReady()) return
  if (t.kind === 'session') navRef.navigate('TimerDone')
  else navRef.navigate('ReminderAlert', { title: t.title, reminderId: t.reminderId })
}

/** Renovação da sessão falhou (ex.: 30 dias sem uso): volta para o login. */
function goToLogin() {
  if (navRef.isReady()) navRef.reset({ index: 0, routes: [{ name: 'Login' }] })
}

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

  useEffect(() => {
    const off = listenNotificationTaps(openFromTap)
    return off
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
        <AuthProvider onExpired={goToLogin}>
          <TimerProvider>
          <NavigationContainer
            ref={navRef}
            onReady={() => {
              // App aberto a partir de uma notificação com o app fechado.
              void getInitialTap().then((t) => t && openFromTap(t))
            }}
          >
            <StatusBar style="dark" />
            <Stack.Navigator
              initialRouteName={process.env.EXPO_PUBLIC_DEV_HOME === '1' ? 'Home' : introSeen ? 'Splash' : 'SplashIF'}
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
              <Stack.Screen name="EventLog" component={EventLogScreen} />
              <Stack.Screen name="Reminders" component={RemindersScreen} />
              <Stack.Screen name="CheckIn" component={CheckInScreen} />
              <Stack.Screen name="Contacts" component={ContactsScreen} />
              <Stack.Screen name="Report" component={ReportScreen} />
              <Stack.Screen name="Tasks" component={TasksScreen} />
              <Stack.Screen name="DayPlan" component={DayPlanScreen} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} />
              <Stack.Screen name="TimerPlan" component={TimerPlanScreen} />
              <Stack.Screen name="TimerSound" component={TimerSoundScreen} />
              <Stack.Screen name="Timer" component={TimerScreen} />
              <Stack.Screen name="TimerDone" component={TimerDoneScreen} />
              <Stack.Screen name="ReminderAlert" component={ReminderAlertScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          </TimerProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
