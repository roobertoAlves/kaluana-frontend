import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SignalMark } from "../../components/SignalMark";
import styles from "./SplashScreen.module.css";

const AUTO_ADVANCE_MS = 1800;

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/selecionar-perfil");
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <button
      type="button"
      className={styles.wrapper}
      onClick={() => navigate("/selecionar-perfil")}
      aria-label="Toque para continuar"
    >
      <SignalMark size={64} />
      <h1 className={styles.title}>Kaluana</h1>
      <p className={styles.subtitle}>Um passo de cada vez.</p>
    </button>
  );
}

export { SplashScreen };
