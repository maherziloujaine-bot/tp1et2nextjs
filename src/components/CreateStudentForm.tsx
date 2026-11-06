"use client";

import { useState, type FormEvent } from "react";

type Props = {
  onCreated: () => void;
};

export default function CreateStudentForm({ onCreated }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const fields = new FormData(form);

    const niveau = String(fields.get("niveau") ?? "").trim();
    const groupe = String(fields.get("groupe") ?? "").trim();

    setPending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.get("name"),
          email: fields.get("email"),
          password: fields.get("password"),
          niveau: niveau || null,
          groupe: groupe || null,
        }),
      });

      if (response.status === 401) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      if (response.status === 403) {
        throw new Error("Création réservée à ADMIN.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Création impossible.");
      }

      form.reset();
      setSuccess("Étudiant créé.");
      onCreated();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="my-6 space-y-4">
      <h3 className="text-lg font-semibold">Créer un étudiant</h3>

      <label className="block">
        Nom
        <input
          name="name"
          required
          minLength={2}
          className="mt-1 block w-full rounded border p-2"
        />
      </label>

      <label className="block">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded border p-2"
        />
      </label>

      <label className="block">
        Mot de passe
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1 block w-full rounded border p-2"
        />
      </label>

      <label className="block">
        Niveau
        <input
          name="niveau"
          type="text"
          className="mt-1 block w-full rounded border p-2"
        />
      </label>

      <label className="block">
        Groupe
        <input
          name="groupe"
          type="text"
          className="mt-1 block w-full rounded border p-2"
        />
      </label>

      {error && <p role="alert" className="text-red-600">{error}</p>}
      {success && <p role="status" className="text-green-700">{success}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Création…" : "Créer"}
      </button>
    </form>
  );
}