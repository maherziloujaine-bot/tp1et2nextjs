"use client";

import { useState, type FormEvent } from "react";

type Student = {
  id: number;
  name: string;
  email: string;
  niveau: string | null;
  groupe: string | null;
};

type Props = {
  student: Student;
  role: string;
  onSaved: () => void;
  onCancel: () => void;
};

export default function EditStudentForm({
  student,
  role,
  onSaved,
  onCancel,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const fields = new FormData(event.currentTarget);

    const data = {
      niveau: String(fields.get("niveau") ?? "").trim() || null,
      groupe: String(fields.get("groupe") ?? "").trim() || null,
      ...(role === "ADMIN"
        ? {
            name: String(fields.get("name") ?? "").trim(),
            email: String(fields.get("email") ?? "").trim(),
          }
        : {}),
    };

    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.status === 401) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      if (response.status === 403) {
        throw new Error("Tu ne peux pas modifier cet étudiant.");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Modification impossible.");
      }

      onSaved();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setPending(false);
    }
  }

  const inputs = [
    ...(role === "ADMIN"
      ? [
          { name: "name", label: "Nom", value: student.name },
          { name: "email", label: "Email", value: student.email },
        ]
      : []),
    { name: "niveau", label: "Niveau", value: student.niveau },
    { name: "groupe", label: "Groupe", value: student.groupe },
  ];

  return (
    <form onSubmit={handleSubmit} className="my-6 space-y-4 rounded border p-4">
      <h3 className="font-semibold">Modifier : {student.name}</h3>

      {inputs.map((input) => (
        <label key={input.name} className="block">
          {input.label}
          <input
            name={input.name}
            type={input.name === "email" ? "email" : "text"}
            defaultValue={input.value ?? ""}
            required={input.name === "name" || input.name === "email"}
            minLength={input.name === "name" ? 2 : undefined}
            className="mt-1 block w-full rounded border p-2"
          />
        </label>
      ))}

      {error && <p role="alert" className="text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="rounded border px-4 py-2"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}