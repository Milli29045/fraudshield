
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

function normalizeValue(type: string, value: string) {
  const trimmed = value.trim();

  if (type === "phone") {
    return trimmed.replace(/\D/g, "");
  }

  if (type === "email") {
    return trimmed.toLowerCase();
  }

  if (type === "website") {
    try {
      const url = new URL(
        trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
      );

      return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/+$/, "")}`;
    } catch {
      return trimmed.toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
    }
  }

  return trimmed.toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type") || "";
    const value = request.nextUrl.searchParams.get("value") || "";

    if (!["phone", "email", "website"].includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid search type." },
        { status: 400 }
      );
    }

    if (!value.trim() || value.length > 500) {
      return NextResponse.json(
        { success: false, message: "Please enter valid information." },
        { status: 400 }
      );
    }

    const searchValue = normalizeValue(type, value);

    const reports = await prisma.fraudReport.findMany({
      where: {
        type,
        status: "approved",
      },
      select: {
        id: true,
        type: true,
        reportedValue: true,
        category: true,
        description: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 500,
    });

    const matchingReports = reports.filter((report) => {
      return normalizeValue(type, report.reportedValue) === searchValue;
    });

    return NextResponse.json({
      success: true,
      total: matchingReports.length,
      reports: matchingReports,
      message:
        matchingReports.length > 0
          ? "Community reports found for this information."
          : "No approved community reports found. This does not guarantee that the information is safe.",
    });
  } catch (error) {
    console.error("Community report search error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to search community reports." },
      { status: 500 }
    );
  }
}
