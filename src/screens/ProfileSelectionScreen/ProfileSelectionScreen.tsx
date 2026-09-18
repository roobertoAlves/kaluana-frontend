import { useNavigate } from "react-router-dom";
import { ScreenLayout } from "../../components/ScreenLayout";
import { SignalMark } from "../../components/SignalMark";
import styles from "./ProfileSelectionScreen.module.css";

function ProfileSelectionScreen() {
  const navigate = useNavigate();

  return (
    <ScreenLayout
      title="Quem está usando o app?"
      subtitle="Isso ajuda a mostrar as telas certas para você."
    >
      <button
        type="button"
        className={styles.optionCard}
        onClick={() => navigate("/cadastro/principal")}
      >
        <SignalMark />
        <div>
          <span className={styles.optionTitle}>Sou eu que vou usar o app</span>
          <span className={styles.optionDescription}>
            Vou criar minha própria conta e organizar minha rotina.
          </span>
        </div>
      </button>

      <button
        type="button"
        className={styles.optionCard}
        onClick={() => navigate("/cadastro/responsavel")}
      >
        <SignalMark />
        <div>
          <span className={styles.optionTitle}>Sou responsável por alguém</span>
          <span className={styles.optionDescription}>
            Vou me conectar usando um código enviado pela pessoa principal.
          </span>
        </div>
      </button>
    </ScreenLayout>
  );
}

export { ProfileSelectionScreen };
