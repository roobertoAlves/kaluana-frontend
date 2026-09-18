const STORAGE_KEY = "kaluana:api-base-url-override";

function getApiBaseUrl(): string {
  const override = readOverride();
  if (override) return override;

  return import.meta.env.VITE_API_BASE_URL;
}

function setApiBaseUrlOverride(url: string | null): void {
  try {
    if (url && url.trim()) {
      window.localStorage.setItem(STORAGE_KEY, url.trim());
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // localStorage indisponível (modo privado, WebView restrito etc.):
    // a troca simplesmente não persiste, sem quebrar o app.
  }
}

function getApiBaseUrlOverride(): string | null {
  return readOverride();
}

function readOverride(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

declare global {
  interface Window {
    kaluanaConfig?: {
      getApiBaseUrl: typeof getApiBaseUrl;
      setApiBaseUrlOverride: typeof setApiBaseUrlOverride;
      getApiBaseUrlOverride: typeof getApiBaseUrlOverride;
    };
  }
}

if (typeof window !== "undefined") {
  window.kaluanaConfig = {
    getApiBaseUrl,
    setApiBaseUrlOverride,
    getApiBaseUrlOverride,
  };
}

export { getApiBaseUrl, getApiBaseUrlOverride, setApiBaseUrlOverride };
