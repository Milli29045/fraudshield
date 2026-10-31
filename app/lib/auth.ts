
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  try {
    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) {
      console.error("SESSION_SECRET is missing or too short.");
      return null;
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("fraudshield_session")?.value;

    if (!token) {
      return null;
    }

    const key = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });

    if (!payload.sub || !/^\d+$/.test(payload.sub)) {
      return null;
    }

    // Database se current role verify karein.
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: Response.json(
        { error: "Please login first." },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "admin") {
    return {
      user: null,
      response: Response.json(
        { error: "Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}
