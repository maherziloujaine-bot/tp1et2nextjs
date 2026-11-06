import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_DURATION = 7 * 24 * 60 * 60;

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET est absent du fichier .env.");
  }

  return new TextEncoder().encode(secret);
}

export async function createSession(userId: number) {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION * 1000
  );

  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
    expires: expiresAt,
  });
}

export async function getSession(): Promise<{
  userId: number;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  const secret = getSecret();

  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload.userId !== "number" ||
      !Number.isSafeInteger(payload.userId) ||
      payload.userId <= 0
    ) {
      return null;
    }

    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}