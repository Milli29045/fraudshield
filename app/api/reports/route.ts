
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { jwtVerify } from "jose";

async function getUserId(request: NextRequest) {
  const token = request.cookies.get("fraudshield_session")?.value;

  if (!token || !process.env.SESSION_SECRET) {
    return null;
  }

  try {
    const secretKey = new TextEncoder().encode(
      process.env.SESSION_SECRET
    );

    const { payload } = await jwtVerify(token, secretKey);
    const userId = Number(payload.sub);

    return Number.isInteger(userId) && userId > 0
      ? userId
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login to submit a report." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const type = String(body.type || "").trim().toLowerCase();
    const reportedValue = String(body.reportedValue || "").trim();
    const category = String(body.category || "").trim();
    const description = String(body.description || "").trim();

    const allowedTypes = ["phone", "email", "website"];

    const allowedCategories = [
      "Spam Call",
      "Fraud",
      "Financial Scam",
      "Fake Job Offer",
      "Phishing",
      "Fake Online Shopping",
      "Harassment",
      "Other",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid report type." },
        { status: 400 }
      );
    }

    if (!reportedValue || reportedValue.length > 500) {
      return NextResponse.json(
        { success: false, message: "Please enter valid reported information." },
        { status: 400 }
      );
    }

    if (!allowedCategories.includes(category)) {
      return NextResponse.json(
        { success: false, message: "Please select a valid category." },
        { status: 400 }
      );
    }

    if (description.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Description is too long." },
        { status: 400 }
      );
    }

    const report = await prisma.fraudReport.create({
      data: {
        type,
        reportedValue,
        category,
        description: description || null,
        userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your report has been submitted for admin review.",
        report: {
          id: report.id,
          type: report.type,
          category: report.category,
          status: report.status,
          createdAt: report.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Fraud report error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to submit your report." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const reports = await prisma.fraudReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      total: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Fetch reports error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch reports." },
      { status: 500 }
    );
  }
}
