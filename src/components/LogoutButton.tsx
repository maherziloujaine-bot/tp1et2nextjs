"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Déconnexion impossible.");
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setError("Impossible de se déconnecter. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Déconnexion..." : "Se déconnecter"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}