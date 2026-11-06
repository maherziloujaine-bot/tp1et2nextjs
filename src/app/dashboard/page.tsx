import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import LogoutButton from "@/components/LogoutButton";
import StudentsManager from "@/components/StudentsManager";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true,
      email: true,
      role: true,
      niveau: true,
      groupe: true,
      createdAt: true,
},
  });

  if (!user) {
    redirect("/api/auth/logout-invalid");
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-16 text-gray-900">
      <section className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">
          Bienvenue, {user.name} !
        </h1>

        <p className="mt-2 text-gray-600">
          Tu es connecté à ton espace personnel.
        </p>

        <dl className="my-8 space-y-4">
          <div>
            <dt className="font-semibold">Nom</dt>
            <dd>{user.name}</dd>
          </div>

          <div>
            <dt className="font-semibold">Email</dt>
            <dd>{user.email}</dd>
          </div>

          <div>
            <dt className="font-semibold">Date d’inscription</dt>
            <dd>
              {user.createdAt.toLocaleDateString("fr-FR", {
                timeZone: "Africa/Tunis",
              })}
            </dd>
          </div>
        </dl>
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
  <p className="font-semibold">
    Rôle : {user.role}
  </p>

  {user.role === "ADMIN" && (
    <p className="mt-2">
      Tu peux créer, consulter, modifier et supprimer les étudiants.
    </p>
  )}

  {user.role === "ENSEIGNANT" && (
    <p className="mt-2">
      Tu peux consulter les étudiants et modifier leur niveau et leur groupe.
    </p>
  )}

  {user.role === "ETUDIANT" && (
    <div className="mt-2 space-y-2">
      <p>Tu peux consulter uniquement tes informations.</p>
      <p>Niveau : {user.niveau ?? "Non renseigné"}</p>
      <p>Groupe : {user.groupe ?? "Non renseigné"}</p>
    </div>
  )}
</div>
{(user.role === "ADMIN" || user.role === "ENSEIGNANT") && (
<StudentsManager role={user.role} />)}

        <LogoutButton />
      </section>
    </main>
  );
}