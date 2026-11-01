
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { requireAdmin } from "../../lib/auth";

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

export async function POST(request: Request) {
  // Only admins can add apps.
  const auth = await requireAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : null;

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : null;

    const fraudStatus = body.fraudStatus || "Pending";

    if (!name || name.length > 150) {
      return NextResponse.json(
        { error: "App name is required and must be under 150 characters." },
        { status: 400 }
      );
    }

    if (!["Genuine", "Fraud", "Pending"].includes(fraudStatus)) {
      return NextResponse.json(
        { error: "Status must be Genuine, Fraud, or Pending." },
        { status: 400 }
      );
    }

    const existingApp = await prisma.app.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: "This app already exists." },
        { status: 409 }
      );
    }

    const app = await prisma.app.create({
      data: {
        name,
        description,
        category,
        fraudStatus,
      },
    });

    return NextResponse.json(
      {
        message: "App added successfully.",
        app,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add app error:", error);

    return NextResponse.json(
      { error: "Unable to add app. Please try again." },
      { status: 500 }
    );
  }
}

