import styles from './CoordinateField.module.css';

interface CoordinateFieldProps {
  coordinate: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}

export function CoordinateField({ coordinate, label, placeholder, value, onChange, type = 'text' }: CoordinateFieldProps) {
  return (
    <div className={styles.fieldWrapper}>
      <div className={styles.labelRow}>
        <span className={styles.coordinate}>{coordinate}</span>
        <span className={styles.label}>{label}</span>
      </div>
      <input
        type={type}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
