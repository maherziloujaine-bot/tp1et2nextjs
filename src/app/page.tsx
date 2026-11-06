import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-gray-900">
      <section className="w-full max-w-lg rounded-xl bg-white p-10 text-center shadow">
        <h1 className="text-3xl font-bold">
          Application d’authentification
        </h1>

        <p className="mt-4 text-gray-600">
          Crée un compte ou connecte-toi pour accéder à ton espace.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Se connecter
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-blue-600 px-5 py-3 text-blue-600 hover:bg-blue-50"
          >
            S’inscrire
          </Link>
        </div>
      </section>
    </main>
  );
}