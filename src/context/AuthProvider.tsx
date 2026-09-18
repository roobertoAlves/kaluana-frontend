import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthContextValue } from "./AuthContext";
import type { AuthenticatedUser } from "../types";

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      setSession: (auth) => {
        setUser(auth.user);
        setAccessToken(auth.accessToken);
      },
      clearSession: () => {
        setUser(null);
        setAccessToken(null);
      },
    }),
    [user, accessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
