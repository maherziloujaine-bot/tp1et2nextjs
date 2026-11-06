"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type AuthFormProps = {
  mode: "login" | "register";
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const body = {
      ...(isRegister ? { name: formData.get("name") } : {}),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {isRegister && (
        <div>
          <label htmlFor="name" className="mb-1 block font-medium">
            Nom
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={inputClass}
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1 block font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          className={inputClass}
        />
        {isRegister && (
          <p className="mt-1 text-sm text-gray-500">
            Au moins 8 caractères.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Veuillez patienter..."
          : isRegister
            ? "Créer mon compte"
            : "Se connecter"}
      </button>
    </form>
  );
}