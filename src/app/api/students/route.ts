import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const { user, error } = await requireRole([
      "ADMIN",
      "ENSEIGNANT",
      "ETUDIANT",
    ]);

    if (error) return error;

    if (!user) {
      return NextResponse.json(
        { error: "Connexion nécessaire." },
        { status: 401 }
      );
    }

    const students = await prisma.user.findMany({
      where:
        user.role === "ETUDIANT"
          ? { id: user.id, role: "ETUDIANT" }
          : { role: "ETUDIANT" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        niveau: true,
        groupe: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Erreur liste étudiants :", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}

const studentSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court."),
  email: z.string().trim().email("Email invalide."),
  password: z.string().min(8, "Minimum 8 caractères."),
  niveau: z.string().trim().min(1).nullable().optional(),
  groupe: z.string().trim().min(1).nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const { error } = await requireRole(["ADMIN"]);

    if (error) return error;

    const body = await request.json().catch(() => null);
    const result = studentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error.issues[0]?.message ?? "Données invalides.",
        },
        { status: 400 }
      );
    }

    const { name, email, password, niveau, groupe } = result.data;
    const hashedPassword = await bcrypt.hash(password, 12);

    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ETUDIANT",
        niveau: niveau ?? null,
        groupe: groupe ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        niveau: true,
        groupe: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé." },
        { status: 409 }
      );
    }

    console.error("Erreur création étudiant :", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}