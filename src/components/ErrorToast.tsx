import * as Toast from "@radix-ui/react-toast";
import styles from "./ErrorToast.module.css";

interface ErrorToastProps {
  message: string | null;
  onOpenChange: (open: boolean) => void;
}

export function ErrorToast({ message, onOpenChange }: ErrorToastProps) {
  return (
    <Toast.Provider swipeDirection="up">
      <Toast.Root
        className={styles.root}
        open={Boolean(message)}
        onOpenChange={onOpenChange}
        duration={6000}
      >
        <Toast.Description className={styles.description}>
          {message}
        </Toast.Description>
      </Toast.Root>
      <Toast.Viewport className={styles.viewport} />
    </Toast.Provider>
  );
}
