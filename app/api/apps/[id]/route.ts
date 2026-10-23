
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id: rawId } = await params;
    const id = Number(rawId);
    const body = await request.json();

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Valid app ID required." },
        { status: 400 }
      );
    }

    if (!["Genuine", "Fraud", "Pending"].includes(body.fraudStatus)) {
      return NextResponse.json(
        { error: "Status must be Genuine, Fraud, or Pending." },
        { status: 400 }
      );
    }

    const app = await prisma.app.update({
      where: { id },
      data: { fraudStatus: body.fraudStatus },
    });

    return NextResponse.json({
      message: "App classification updated successfully.",
      app,
    });
  } catch (error) {
    console.error("App classification error:", error);

    return NextResponse.json(
      { error: "App not found or classification update failed." },
      { status: 404 }
    );
  }
}
