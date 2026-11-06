import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authorization";
import { z } from "zod";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole(["ADMIN"]);

    if (error) return error;

    const { id } = await params;

    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
      return NextResponse.json(
        { error: "Identifiant invalide." },
        { status: 400 }
      );
    }

    const student = await prisma.user.findUnique({
      where: { id: Number(id) },
      select: { role: true },
    });

    if (!student || student.role !== "ETUDIANT") {
      return NextResponse.json(
        { error: "Étudiant introuvable." },
        { status: 404 }
      );
    }

    await prisma.user.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({
      message: "Étudiant supprimé.",
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Étudiant introuvable." },
        { status: 404 }
      );
    }

    console.error("Erreur suppression étudiant :", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
const pedagogieFields = {
  niveau: z.string().trim().min(1).nullable().optional(),
  groupe: z.string().trim().min(1).nullable().optional(),
};

const enseignantSchema = z.object(pedagogieFields).strict();

const adminSchema = z.object({
  name: z.string().trim().min(2).optional(),
  email: z.string().trim().email().optional(),
  ...pedagogieFields,
}).strict();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole([
      "ADMIN",
      "ENSEIGNANT",
    ]);

    if (error) return error;

    if (!user) {
      return NextResponse.json(
        { error: "Connexion nécessaire." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
      return NextResponse.json(
        { error: "Identifiant invalide." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => null);

    const schema =
      user.role === "ADMIN" ? adminSchema : enseignantSchema;

    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Données invalides ou champs non autorisés." },
        { status: 400 }
      );
    }

    if (Object.keys(result.data).length === 0) {
      return NextResponse.json(
        { error: "Indique au moins un champ à modifier." },
        { status: 400 }
      );
    }

    const student = await prisma.user.update({
      where: {
        id: Number(id),
        role: "ETUDIANT",
      },
      data: result.data,
      select: {
        id: true,
        name: true,
        email: true,
        niveau: true,
        groupe: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ student });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { error: "Étudiant introuvable." },
          { status: 404 }
        );
      }

      if (error.code === "P2002") {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé." },
          { status: 409 }
        );
      }
    }

    console.error("Erreur modification étudiant :", error);

    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}