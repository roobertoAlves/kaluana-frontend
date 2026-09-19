import {
  type AuthResponse,
  type LoginPayload,
  type RegisterPrimaryPayload,
  type RegisterResponsiblePayload,
  type ValidateCodePayload,
  type ValidateCodeResponse,
} from "../types";
import { getApiBaseUrl } from "./runtimeConfig";
import { CapacitorHttp } from "@capacitor/core";

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
  try {
    const options = {
      url: `${getApiBaseUrl()}${path}`,
      headers: { "Content-Type": "application/json" },
      data: body,
    };

    const response = await CapacitorHttp.post(options);

    if (response.status < 200 || response.status >= 300) {
      const fallbackMessages: Record<number, string> = {
        400: "Confira os dados informados e tente novamente.",
        401: "E-mail ou senha inválidos.",
        404: "Código de sincronização não encontrado.",
        409: "Este e-mail já está cadastrado.",
        410: "Este código de sincronização expirou. Peça um novo ao usuário principal.",
        429: "Muitas tentativas seguidas. Aguarde um pouco antes de tentar de novo.",
      };

      const message =
        fallbackMessages[response.status] ??
        (response.data as any)?.message ??
        "Não foi possível concluir a operação.";

      throw new ApiError(message, response.status);
    }

    return response.data as TResponse;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    throw new ApiError(
      `Erro de conexão com ${getApiBaseUrl()}. Verifique se o backend está no ar e tente novamente.`,
      0,
    );
  }
}

function login(payload: LoginPayload) {
  return request<AuthResponse>("/api/auth/login", payload);
}

function registerPrimary(payload: RegisterPrimaryPayload) {
  return request<AuthResponse>("/api/auth/register/primary", payload);
}

function validateCode(payload: ValidateCodePayload) {
  return request<ValidateCodeResponse>("/api/pairing/validate-code", payload);
}

function registerResponsible(payload: RegisterResponsiblePayload) {
  return request<AuthResponse>("/api/auth/register/responsible", payload);
}

export { login, registerPrimary, registerResponsible, validateCode };
