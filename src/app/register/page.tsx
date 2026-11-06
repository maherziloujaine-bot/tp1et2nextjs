import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-gray-900">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-3xl font-bold">Inscription</h1>

        <AuthForm mode="register" />

        <p className="mt-6 text-center text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Se connecter
          </Link>
        </p>
      </section>
    </main>
  );
}