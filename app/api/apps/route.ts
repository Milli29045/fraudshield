
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const apps = await prisma.app.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    return NextResponse.json({ apps });
  } catch (error) {
    console.error("Fetch apps error:", error);

    return NextResponse.json(
      { error: "Apps could not be fetched." },
      { status: 500 }
    );
  }
}
