import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "./prisma";

export async function getChatUser(request: NextRequest) {
  try {
    const token = request.cookies.get("fraudshield_session")?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("SESSION_SECRET is missing or too short.");
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Chat authentication error:", error);
    return null;
  }
}