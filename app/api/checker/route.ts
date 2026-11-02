
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

type CheckType = "app" | "phone" | "email" | "message";


const suspiciousPatterns = [
  {
    name: "Money Transfer Request",
    pattern: /\b(send|transfer|pay|give)\s+(me\s+)?(the\s+)?(money|cash|payment|amount)\b/i,
  },
  {
    name: "Urgent Payment",
    pattern: /\b(urgent|immediate|emergency)\s+(payment|transfer|fee|deposit)\b/i,
  },
  {
    name: "Account Verification Request",
    pattern: /\b(verify|confirm|update)\s+(your\s+)?(bank\s+)?(account|details|information)\b/i,
  },
  {
    name: "Prize or Reward Scam",
    pattern: /\b(claim|won|winner|receive)\b.{0,40}\b(prize|reward|gift|cash|money)\b/i,
  },
  {
    name: "Password or OTP Request",
    pattern: /\b(share|send|provide|enter|tell)\s+(me\s+)?(your\s+)?(password|otp|pin|verification code)\b/i,
  },
  {
    name: "Suspicious Link",
    pattern: /\b(click|open|visit)\s+(this\s+)?(link|url|website)\b/i,
  },
  {
    name: "Guaranteed Investment",
    pattern: /\b(guaranteed|double|triple|100%)\b.{0,40}\b(profit|investment|return|money)\b/i,
  },
  {
    name: "Bank Information Request",
    pattern: /\b(bank password|bank pin|card number|credit card details)\b/i,
  },
];


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const type = body.type as CheckType;
    const value =
      typeof body.value === "string" ? body.value.trim() : "";

    const allowedTypes: CheckType[] = [
      "app",
      "phone",
      "email",
      "message",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid detection type." },
        { status: 400 }
      );
    }

    if (!value || value.length > 5000) {
      return NextResponse.json(
        { error: "Please enter valid information." },
        { status: 400 }
      );
    }

    let riskLevel = "Needs Verification";
    let message = "";

    // Phone number checking
    if (type === "phone") {
      const cleanedPhone = value.replace(/[\s\-()]/g, "");
      const phonePattern = /^\+?[0-9]{7,15}$/;

      if (!phonePattern.test(cleanedPhone)) {
        return NextResponse.json(
          { error: "Please enter a valid phone number." },
          { status: 400 }
        );
      }

      message =
        "Phone number format is valid. Its fraud status cannot be confirmed without checking a trusted fraud database.";
    }

    // Email checking
    else if (type === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(value)) {
        return NextResponse.json(
          { error: "Please enter a valid email address." },
          { status: 400 }
        );
      }

      const suspiciousDomains = [
        "tempmail.com",
        "mailinator.com",
        "guerrillamail.com",
      ];

      const domain = value.split("@")[1].toLowerCase();

      if (suspiciousDomains.includes(domain)) {
        riskLevel = "Suspicious Pattern";
        message =
          "This email uses a known temporary email domain. Verify the sender before trusting it.";
      } else {
        message =
          "Email format is valid. The sender's identity and fraud status have not been verified.";
      }
    }

    // Message checking
 
// Message checking
else if (type === "message") {
  const foundPatterns = suspiciousPatterns.filter((item) =>
    item.pattern.test(value)
  );

  if (foundPatterns.length >= 2) {
    riskLevel = "High Suspicion";
    message =
      "Multiple suspicious patterns were detected. Do not share passwords, OTPs, or payment details.";
  } else if (foundPatterns.length === 1) {
    riskLevel = "Potentially Suspicious";
    message =
      "A suspicious pattern was detected. Verify the message before taking action.";
  } else {
    riskLevel = "No Suspicious Patterns Found";
    message =
      "No listed suspicious patterns were detected. This does not guarantee that the message is safe.";
  }
}

    // App checking
    else if (type === "app") {
      message =
        "App name received successfully. Its authenticity cannot be confirmed using the app name alone. More information or a trusted app database is required.";
    }

    // Get logged-in user, if available
    let userId: number | null = null;

    try {
      const sessionCookie = request.cookies.get("fraudshield_session")?.value;

      if (sessionCookie) {
        const { jwtVerify } = await import("jose");
        const secret = process.env.SESSION_SECRET;

        if (secret) {
          const secretKey = new TextEncoder().encode(secret);

          const { payload } = await jwtVerify(
            sessionCookie,
            secretKey
          );

          const sessionUserId = Number(payload.sub);

          if (Number.isInteger(sessionUserId) && sessionUserId > 0) {
            userId = sessionUserId;
          }
        }
      }
    } catch {
      // Continue as a guest if the session is invalid.
      userId = null;
    }

    // Save detection in database
    const detection = await prisma.detectionHistory.create({
      data: {
        type,
        inputValue: value,
        riskLevel,
        result: message,
        userId,
      },
    });

    return NextResponse.json({
      success: true,
      detectionId: detection.id,
      type,
      riskLevel,
      message,
      checkedAt: detection.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Detection API error:", error);

    return NextResponse.json(
      { error: "Unable to process your request." },
      { status: 500 }
    );
  }
}
