
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("fraudshield_session")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Please log in to view your detection history." },
        { status: 401 }
      );
    }

    const secret = process.env.SESSION_SECRET;

    if (!secret) {
      return NextResponse.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);

   const userId = Number(payload.sub);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user session." },
        { status: 401 }
      );
    }

    const detections = await prisma.detectionHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      total: detections.length,
      detections,
    });
  } catch (error) {
    console.error("Detection History API error:", error);

    return NextResponse.json(
      { error: "Unable to load detection history." },
      { status: 401 }
    );
  }
}
