import styles from './ArrowButton.module.css';

interface ArrowButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
}

export function ArrowButton({ label, onClick, variant = 'primary', type = 'submit' }: ArrowButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${variant === 'primary' ? styles.primary : styles.secondary}`}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.arrow}>→</span>
    </button>
  );
}
