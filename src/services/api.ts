import {
  type AuthResponse,
  type RegisterPrimaryPayload,
  type RegisterResponsiblePayload,
  type ValidateCodePayload,
  type ValidateCodeResponse,
} from "../types";
import { getApiBaseUrl } from "./runtimeConfig";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se o backend está no ar e tente novamente.",
      0,
    );
  }

  if (!response.ok) {
    const fallbackMessages: Record<number, string> = {
      400: "Confira os dados informados e tente novamente.",
      404: "Código de sincronização não encontrado.",
      409: "Este e-mail já está cadastrado.",
      410: "Este código de sincronização expirou. Peça um novo ao usuário principal.",
      429: "Muitas tentativas seguidas. Aguarde um pouco antes de tentar de novo.",
    };

    const message =
      fallbackMessages[response.status] ??
      "Não foi possível concluir a operação.";

    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) {
        throw new ApiError(data.message, response.status);
      }
    } catch {
      // corpo vazio ou não-JSON: mantém a mensagem padrão acima
    }

    throw new ApiError(message, response.status);
  }

  return (await response.json()) as TResponse;
}

function registerPrimary(payload: RegisterPrimaryPayload) {
  return request<AuthResponse>("api/auth/register/primary", payload);
}

function validateCode(payload: ValidateCodePayload) {
  return request<ValidateCodeResponse>("/api/pairing/validate-code", payload);
}

function registerResponsible(payload: RegisterResponsiblePayload) {
  return request<AuthResponse>("api/auth/register/responsible", payload);
}

export { registerPrimary, registerResponsible, validateCode };
