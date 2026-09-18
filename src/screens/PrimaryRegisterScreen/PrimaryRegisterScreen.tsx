import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { ErrorToast } from "../../components/ErrorToast";
import { ScreenLayout } from "../../components/ScreenLayout";
import { TextField } from "../../components/TextField";
import { useAuth } from "../../context/AuthContext";
import { ApiError, registerPrimary } from "../../services/api";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function PrimaryRegisterScreen() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const errors: Partial<Record<keyof FormState, string>> = {};

    if (form.name.trim().length < 2) {
      errors.name = "Informe seu nome.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      errors.email = "Informe um e-mail válido.";
    }
    if (form.password.length < 8) {
      errors.password = "A senha precisa ter pelo menos 8 caracteres.";
    }
    if (form.confirmPassword !== form.password) {
      errors.confirmPassword = "As senhas não coincidem.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const auth = await registerPrimary({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
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

  return (
    <ScreenLayout
      title="Vamos criar sua conta"
      subtitle="Só o essencial para começar."
      onBack={() => navigate("/selecionar-perfil")}
    >
      <form onSubmit={handleSubmit} noValidate>
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
        <TextField
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          value={form.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          error={fieldErrors.confirmPassword}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Criar minha conta
        </Button>
      </form>

      <ErrorToast
        message={formError}
        onOpenChange={(open) => !open && setFormError(null)}
      />
    </ScreenLayout>
  );
}

export { PrimaryRegisterScreen };
