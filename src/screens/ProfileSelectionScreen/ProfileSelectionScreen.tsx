import { useNavigate } from 'react-router-dom'
import { SignalMark } from '../../components/SignalMark'
import styles from './ProfileSelectionScreen.module.css'

export function ProfileSelectionScreen() {
  const navigate = useNavigate()

  return (
    <div className={styles.screen}>
      <span className={`${styles.corner} ${styles.cornerTL}`}>+</span>
      <span className={`${styles.corner} ${styles.cornerTR}`}>+</span>
      <span className={`${styles.corner} ${styles.cornerBL}`}>+</span>
      <span className={`${styles.corner} ${styles.cornerBR}`}>+</span>

      <div className={styles.hero}>
        <div className={styles.seal}>
          <SignalMark size={64} />
        </div>
        <h1 className={styles.heroTitle}>
          por onde<br />você quer<br />começar?
        </h1>
        <p className={styles.heroDesc}>
          Sem pressa. Cada caminho chega no mesmo lugar.
        </p>
      </div>

      <div className={styles.optionsArea}>
        <button className={`${styles.option} ${styles.optionOrange}`} onClick={() => navigate('/cadastro/principal')}>
          <div className={styles.optionInner}>
            <div>
              <span className={styles.optionNumber}>01</span>
              <span className={styles.optionTitle}>Registrar</span>
              <span className={styles.optionDesc}>criar uma conta nova</span>
            </div>
            <span className={styles.optionArrow}>→</span>
          </div>
        </button>

        <button className={`${styles.option} ${styles.optionBlue}`} onClick={() => navigate('/entrar')}>
          <div className={styles.optionInner}>
            <div>
              <span className={styles.optionNumber}>02</span>
              <span className={styles.optionTitle}>Entrar</span>
              <span className={styles.optionDesc}>já tenho uma conta</span>
            </div>
            <span className={styles.optionArrow}>→</span>
          </div>
        </button>

        <button className={`${styles.option} ${styles.optionDark}`} onClick={() => navigate('/cadastro/responsavel')}>
          <div className={styles.optionInner}>
            <div>
              <span className={styles.optionNumber}>03</span>
              <span className={styles.optionTitle}>Emparelhar</span>
              <span className={styles.optionDesc}>sou responsável ou parceiro de alguém</span>
            </div>
            <span className={styles.optionArrow}>→</span>
          </div>
        </button>
      </div>
    </div>
  )
}
