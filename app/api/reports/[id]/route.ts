
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { jwtVerify } from "jose";

async function getUserId(request: NextRequest) {
  const token = request.cookies.get("fraudshield_session")?.value;

  if (!token || !process.env.SESSION_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(
      process.env.SESSION_SECRET
    );

    const { payload } = await jwtVerify(token, secret);
    const id = Number(payload.sub);

    return Number.isInteger(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Please login first." },
        { status: 401 }
      );
    }

    const admin = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!admin || admin.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;
    const reportId = Number(id);

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid report ID." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const status = String(body.status || "").trim().toLowerCase();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid report status." },
        { status: 400 }
      );
    }

    const existingReport = await prisma.fraudReport.findUnique({
      where: { id: reportId },
      select: { id: true },
    });

    if (!existingReport) {
      return NextResponse.json(
        { success: false, message: "Report not found." },
        { status: 404 }
      );
    }

    const updatedReport = await prisma.fraudReport.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message: `Report ${status} successfully.`,
      report: updatedReport,
    });
  } catch (error) {
    console.error("Report approval error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update report." },
      { status: 500 }
    );
  }
}
