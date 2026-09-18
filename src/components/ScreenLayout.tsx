import type { ReactNode } from "react";
import styles from "./ScreenLayout.module.css";

interface ScreenLayoutProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function ScreenLayout({
  title,
  subtitle,
  onBack,
  children,
  footer,
}: ScreenLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <main className={styles.card}>
        {onBack && (
          <button
            type="button"
            className={styles.backButton}
            onClick={onBack}
            aria-label="Voltar para a tela anterior"
          >
            ← Voltar
          </button>
        )}
        {title && (
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
        )}
        <div className={styles.content}>{children}</div>
      </main>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
}
