import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { ErrorToast } from "../../components/ErrorToast";
import { ScreenLayout } from "../../components/ScreenLayout";
import { SignalMark } from "../../components/SignalMark";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import {
  ApiError,
  registerResponsible,
  validateCode,
} from "../../services/api";
import styles from "./ResponsibleRegisterScreen.module.css";

type Step = "code" | "register";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

function ResponsibleRegisterScreen() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [mainPersonName, setMainPersonName] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const [form, setForm] = useState<RegisterForm>({
    name: "",
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterForm, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleValidateCode(event: FormEvent) {
    event.preventDefault();
    setCodeError(null);

    if (code.trim().length < 4) {
      setCodeError("Digite o código enviado pela pessoa principal.");
      return;
    }

    setValidating(true);
    try {
      const result = await validateCode({ code: code.trim() });
      setMainPersonName(result.mainPersonName);
      setStep("register");
    } catch (error) {
      setCodeError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível validar o código.",
      );
    } finally {
      setValidating(false);
    }
  }

  function updateField<K extends keyof RegisterForm>(
    field: K,
    value: RegisterForm[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validateForm(): boolean {
    const errors: Partial<Record<keyof RegisterForm, string>> = {};

    if (form.name.trim().length < 2) errors.name = "Informe seu nome.";
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      errors.email = "Informe um e-mail válido.";
    if (form.password.length < 8)
      errors.password = "A senha precisa ter pelo menos 8 caracteres.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmitRegister(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const auth = await registerResponsible({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        code: code.trim(),
      });
      setSession(auth);
      navigate("/inicio");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Erro inesperado. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "code") {
    return (
      <ScreenLayout
        title="Código de sincronização"
        subtitle="Peça esse código para a pessoa principal, ela é quem consegue gerá-lo."
        onBack={() => navigate("/selecionar-perfil")}
      >
        <form onSubmit={handleValidateCode} noValidate>
          <TextField
            label="Código"
            autoComplete="one-time-code"
            placeholder="Ex.: 7F3K9A"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            error={codeError ?? undefined}
          />
          <Button type="submit" fullWidth loading={validating}>
            Validar código
          </Button>
        </form>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      title="Cadastro do responsável"
      onBack={() => setStep("code")}
    >
      <div className={styles.confirmation}>
        <SignalMark />
        <span>
          Você está se conectando com <strong>{mainPersonName}</strong>.
        </span>
      </div>

      <form onSubmit={handleSubmitRegister} noValidate>
        <TextField
          label="Nome"
          autoComplete="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          error={fieldErrors.name}
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          error={fieldErrors.email}
        />
        <TextField
          label="Senha"
          type="password"
          autoComplete="new-password"
          hint="Pelo menos 8 caracteres."
          value={form.password}
          onChange={(e) => updateField("password", e.target.value)}
          error={fieldErrors.password}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Concluir cadastro
        </Button>
      </form>

      <ErrorToast
        message={formError}
        onOpenChange={(open) => !open && setFormError(null)}
      />
    </ScreenLayout>
  );
}

export { ResponsibleRegisterScreen };
