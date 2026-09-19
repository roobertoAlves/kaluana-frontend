import { Navigate, Route, Routes } from "react-router-dom";
import { HomePlaceholderScreen } from "../screens/HomePlaceholderScreen/HomePlaceHolderScreen";
import { LoginScreen } from "../screens/LoginScreen/LoginScreen";
import { PrimaryRegisterScreen } from "../screens/PrimaryRegisterScreen/PrimaryRegisterScreen";
import { ProfileSelectionScreen } from "../screens/ProfileSelectionScreen/ProfileSelectionScreen";
import { ResponsibleRegisterScreen } from "../screens/ResponsibleRegisterScreen/ResponsibleRegisterScreen";
import { SplashScreen } from "../screens/SplashScreen/SplashScreen";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/selecionar-perfil" element={<ProfileSelectionScreen />} />
      <Route path="/selecionar-eixo" element={<ProfileSelectionScreen />} />
      <Route path="/entrar" element={<LoginScreen />} />
      <Route path="/cadastro/principal" element={<PrimaryRegisterScreen />} />
      <Route
        path="/cadastro/responsavel"
        element={<ResponsibleRegisterScreen />}
      />
      <Route path="/inicio" element={<HomePlaceholderScreen />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export { AppRoutes };
