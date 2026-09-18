import type { AuthResponse, AuthenticatedUser } from "../types";
import { createContext, useContext } from "react";

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider");
  }
  return context;
}
