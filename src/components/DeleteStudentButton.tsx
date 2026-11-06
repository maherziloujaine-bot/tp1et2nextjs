"use client";

import { useState } from "react";

type Props = {
  studentId: number;
  studentName: string;
  onDeleted: () => void;
};

export default function DeleteStudentButton({
  studentId,
  studentName,
  onDeleted,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!window.confirm(`Supprimer l’étudiant ${studentName} ?`)) {
      return;
    }

    setPending(true);
    setError("");

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        throw new Error("Session expirée. Reconnecte-toi.");
      }

      if (response.status === 403) {
        throw new Error("Suppression réservée à ADMIN.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Suppression impossible.");
      }

      onDeleted();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded bg-red-600 px-3 py-2 text-white disabled:opacity-50"
      >
        {pending ? "Suppression…" : "Supprimer"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}