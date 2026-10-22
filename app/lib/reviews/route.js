
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    const appId = Number(body.appId);

    if (!content || content.length > 5000) {
      return NextResponse.json(
        { error: "Review is required and must be under 5000 characters." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(appId) || appId <= 0) {
      return NextResponse.json(
        { error: "A valid appId is required." },
        { status: 400 }
      );
    }

    const app = await prisma.app.findUnique({
      where: { id: appId },
      select: { id: true },
    });

    if (!app) {
      return NextResponse.json(
        { error: "App not found. Please use an existing appId." },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        content,
        appId,
      },
    });

    return NextResponse.json(
      { message: "Review saved successfully.", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review API error:", error);

    return NextResponse.json(
      { error: "Unable to save review. Check the server logs." },
      { status: 500 }
    );
  }
}
