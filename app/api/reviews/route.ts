
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { analyzeSentiment } from "../../lib/sentiment";


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appIdParam = searchParams.get("appId");

    let appId: number | undefined;

    if (appIdParam !== null) {
      appId = Number(appIdParam);

      if (!Number.isInteger(appId) || appId <= 0) {
        return NextResponse.json(
          { error: "A valid app ID is required." },
          { status: 400 }
        );
      }
    }

    const reviews = await prisma.review.findMany({
      where: appId !== undefined ? { appId } : undefined,
      include: {
        app: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Fetch reviews error:", error);

    return NextResponse.json(
      { error: "Unable to load reviews." },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();

    const content =
      typeof body.content === "string" ? body.content.trim() : "";

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
        { error: "App not found. Please create an app first." },
        { status: 404 }
      );
    }

const sentiment = analyzeSentiment(content);

const review = await prisma.review.create({
  data: {
    content,
    appId,
    sentiment,
  },
});

    return NextResponse.json(
      { message: "Review saved successfully.", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review API error:", error);

    return NextResponse.json(
      { error: "Unable to save review. Check the terminal." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = Number(body.id);
    const status = body.status;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "Valid review ID required." },
        { status: 400 }
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Status must be approved or rejected." },
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: "Review not found." },
        { status: 404 }
      );
    }

    const review = await prisma.review.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: "Review status updated successfully.",
      review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return NextResponse.json(
      { error: "Unable to update review status." },
      { status: 500 }
    );
  }
}
