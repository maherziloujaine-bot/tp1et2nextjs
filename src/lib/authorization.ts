import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

type Role = "ADMIN" | "ENSEIGNANT" | "ETUDIANT";

export async function requireRole(rolesAutorises: Role[]) {
  const session = await getSession();

  if (!session) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Connexion nécessaire." },
        { status: 401 }
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Utilisateur introuvable." },
        { status: 401 }
      ),
    };
  }

  const autorise = rolesAutorises.some(
    (role) => role === user.role
  );

  if (!autorise) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Accès interdit." },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}