import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";
import { createSession } from "@/lib/session";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const { name, email, password } = result.data;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Cette adresse email est déjà utilisée." },
        { status: 409 }
      );
    }

    console.error("Erreur inscription :", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}