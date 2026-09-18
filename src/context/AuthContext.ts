import type { AuthResponse, AuthenticatedUser } from "../types";
import { createContext } from "react";

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  accessToken: string | null;
  setSession: (auth: AuthResponse) => void;
  clearSession: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
