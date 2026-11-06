import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-gray-900">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold">Connexion</h1>

        <AuthForm mode="login" />

        <p className="mt-6 text-center text-sm">
          Pas encore de compte ?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            S’inscrire
          </Link>
        </p>
      </section>
    </main>
  );
}