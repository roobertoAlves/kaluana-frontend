import { Navigate } from "react-router-dom";
import { ScreenLayout } from "../../components/ScreenLayout";
import { SignalMark } from "../../components/SignalMark";
import { useAuth } from "../../context/AuthContext";

function HomePlaceholderScreen() {
  const { user, clearSession } = useAuth();

  if (!user) {
    return <Navigate to="/selecionar-perfil" replace />;
  }

  const roleMessage =
    user.role === "PRIMARY"
      ? "Sua conta foi criada. Os módulos de rotina e registro entram aqui nas próximas etapas."
      : "Você está conectado(a) como responsável. Em breve, aqui aparecerão os relatórios de acompanhamento.";

  return (
    <ScreenLayout title={`Olá, ${user.name}`} subtitle={roleMessage}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "var(--space-5) 0",
        }}
      >
        <SignalMark size={40} />
      </div>
      <button
        type="button"
        onClick={clearSession}
        style={{
          background: "none",
          border: "none",
          color: "var(--text-secondary)",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        Sair
      </button>
    </ScreenLayout>
  );
}

export { HomePlaceholderScreen };
