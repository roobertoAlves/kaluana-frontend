import React from 'react';
import { SignalMark } from '../SignalMark';
import styles from './ScreenChrome.module.css';

interface ScreenChromeProps {
  children: React.ReactNode;
  stepNumber: string;
  contextLabel: string;
  fieldNoteNumber: string;
}

export function ScreenChrome({ children, stepNumber, contextLabel, fieldNoteNumber }: ScreenChromeProps) {
  return (
    <div className={styles.chromeWrapper}>
      {/* Marcas de Canto (Sinais +) */}
      <div className={styles.cornerTopLeft}>+</div>
      <div className={styles.cornerTopRight}>+</div>
      <div className={styles.cornerBottomLeft}>+</div>
      <div className={styles.cornerBottomRight}>+</div>

      {/* Cabeçalho Editorial */}
      <header className={styles.header}>
        <div className={styles.headerRow1}>
          <span className={styles.fieldNote}>KALUANA / FIELD NOTE {fieldNoteNumber}</span>
          <span className={styles.contextLabel}>{contextLabel}</span>
        </div>
        <div className={styles.headerRow2}>
          <span className={styles.stepNumber}>{stepNumber}</span>
          <span className={styles.signalActive}>SIGNAL / ACTIVE</span>
        </div>
      </header>

      {/* Selo da Raposa (SignalMark) */}
      <div className={styles.sealContainer}>
        <SignalMark />
      </div>

      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Grid de fundo sutil implementada via CSS no wrapper */}
    </div>
  );
}
