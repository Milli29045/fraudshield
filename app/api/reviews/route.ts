
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { analyzeSentiment } from "../../lib/sentiment";
import { requireAdmin, getCurrentUser } from "../../lib/auth";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const isAdmin = user?.role === "admin";

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
      where: {
        ...(appId !== undefined ? { appId } : {}),
        ...(isAdmin ? {} : { status: "approved" }),
      },
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
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please login before submitting a review." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const content =
      typeof body.content === "string" ? body.content.trim() : "";

    const appIdProvided =
      body.appId !== undefined &&
      body.appId !== null &&
      body.appId !== "";

    const appName =
      typeof body.appName === "string"
        ? body.appName.trim()
        : "";

    if (!content || content.length > 5000) {
      return NextResponse.json(
        { error: "Review is required and must be under 5000 characters." },
        { status: 400 }
      );
    }

    if (appIdProvided && appName) {
      return NextResponse.json(
        { error: "Provide either an app ID or an app name, not both." },
        { status: 400 }
      );
    }

    let app;

    if (appIdProvided) {
      const appId = Number(body.appId);

      if (!Number.isInteger(appId) || appId <= 0) {
        return NextResponse.json(
          { error: "A valid app ID is required." },
          { status: 400 }
        );
      }

      app = await prisma.app.findUnique({
        where: { id: appId },
        select: { id: true, name: true },
      });

      if (!app) {
        return NextResponse.json(
          { error: "App not found." },
          { status: 404 }
        );
      }
    } else {
      if (!appName || appName.length > 150) {
        return NextResponse.json(
          { error: "A valid app name is required." },
          { status: 400 }
        );
      }

      const existingApp = await prisma.app.findFirst({
        where: {
          name: {
            equals: appName,
            mode: "insensitive",
          },
        },
        select: { id: true, name: true },
      });

      app = existingApp;

      if (!app) {
        app = await prisma.app.create({
          data: {
            name: appName,
            category: null,
            fraudStatus: "Pending",
          },
          select: { id: true, name: true },
        });
      }
    }

    const existingReview = await prisma.review.findFirst({
      where: {
        appId: app.id,
        content: {
          equals: content,
          mode: "insensitive",
        },
      },
    });

    const sentiment = analyzeSentiment(content);

    const review = await prisma.review.create({
      data: {
        content,
        appId: app.id,
        sentiment,
        status: existingReview ? "duplicate" : "pending",
      },
    });

    return NextResponse.json(
      {
        message: existingReview
          ? "Duplicate review detected. It has been flagged for admin review."
          : "Review saved successfully.",
        app,
        appCreated: !existingApp && !appIdProvided,
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review API error:", error);

    return NextResponse.json(
      { error: "Unable to save review." },
      { status: 500 }
    );
  }
}


export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin();

    if (auth.response) {
      return auth.response;
    }

    const body = await request.json();

    const id = Number(body.id);
    const status = body.status;

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { error: "A valid review ID is required." },
        { status: 400 }
      );
    }

    if (
      typeof status !== "string" ||
      !["approved", "rejected"].includes(status)
    ) {
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
