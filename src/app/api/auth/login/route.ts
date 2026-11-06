import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const { email, password } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    const validPassword = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !validPassword) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur connexion :", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}