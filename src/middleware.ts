import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET est absent du fichier .env.");
  }

  let authenticated = false;

  if (token) {
    try {
      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret),
        { algorithms: ["HS256"] }
      );

      authenticated =
        typeof payload.userId === "number" &&
        Number.isSafeInteger(payload.userId) &&
        payload.userId > 0;
    } catch {
      authenticated = false;
    }
  }

  const pathname = request.nextUrl.pathname;
  const isDashboard =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  if (isDashboard && !authenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    authenticated &&
    (pathname === "/login" || pathname === "/register")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};