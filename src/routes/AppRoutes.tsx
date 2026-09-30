import { Navigate, Route, Routes } from 'react-router-dom'
import { HomeScreen } from '../screens/HomeScreen/HomeScreen'
import { LoginScreen } from '../screens/LoginScreen/LoginScreen'
import { PrimaryRegisterScreen } from '../screens/PrimaryRegisterScreen/PrimaryRegisterScreen'
import { ProfileSelectionScreen } from '../screens/ProfileSelectionScreen/ProfileSelectionScreen'
import { ResponsibleRegisterScreen } from '../screens/ResponsibleRegisterScreen/ResponsibleRegisterScreen'
import { SplashIFScreen } from '../screens/SplashIFScreen/SplashIFScreen'
import { SplashScreen } from '../screens/SplashScreen/SplashScreen'
import { ProfileScreen } from '../screens/ProfileScreen/ProfileScreen'
import { SettingsScreen } from '../screens/SettingsScreen/SettingsScreen'

function AppRoutes() {
  const hasSeenIF = localStorage.getItem('kaluana_seen_if') === '1'

  return (
    <Routes>
      <Route path="/" element={<Navigate to={hasSeenIF ? '/splash' : '/intro'} replace />} />
      <Route path="/intro" element={<SplashIFScreen />} />
      <Route path="/splash" element={<SplashScreen />} />
      <Route path="/selecionar-perfil" element={<ProfileSelectionScreen />} />
      <Route path="/selecionar-eixo" element={<ProfileSelectionScreen />} />
      <Route path="/entrar" element={<LoginScreen />} />
      <Route path="/cadastro/principal" element={<PrimaryRegisterScreen />} />
      <Route path="/cadastro/responsavel" element={<ResponsibleRegisterScreen />} />
      <Route path="/inicio" element={<HomeScreen />} />
      <Route path="/perfil" element={<ProfileScreen />} />
      <Route path="/configuracoes" element={<SettingsScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export { AppRoutes }
