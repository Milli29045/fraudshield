
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("fraudshield_session")?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const secret = process.env.SESSION_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error("SESSION_SECRET is missing or too short.");
    }

    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jwtVerify(token, secretKey);

    const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { authenticated: false, message: "Invalid session." },
        { status: 401 }
      );
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

    if (!user) {
      return NextResponse.json(
        { authenticated: false, message: "User not found." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });

  } catch (error) {
    console.error("Session verification error:", error);

    return NextResponse.json(
      { authenticated: false, message: "Invalid or expired session." },
      { status: 401 }
    );
  }
}
