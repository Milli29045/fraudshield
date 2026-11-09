
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

type CheckType = "app" | "phone" | "email" | "message" | "url";


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


function normalizeReportValue(type: string, value: string) {
  const trimmed = value.trim();

  if (type === "phone") {
    return trimmed.replace(/\D/g, "");
  }

  if (type === "email") {
    return trimmed.toLowerCase();
  }

  if (type === "url") {
    try {
      const url = new URL(
        trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
      );

      return `${url.hostname.toLowerCase()}${url.pathname.replace(/\/+$/, "")}`;
    } catch {
      return trimmed.toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/+$/, "");
    }
  }

  return trimmed.toLowerCase();
}

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
  "url",
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

    // URL and phishing detection
    if (type === "url") {
      let checkedUrl: URL;

      try {
        const inputUrl = /^https?:\/\//i.test(value)
          ? value
          : `https://${value}`;

        checkedUrl = new URL(inputUrl);

        if (
          !["http:", "https:"].includes(checkedUrl.protocol) ||
          !checkedUrl.hostname.includes(".") ||
          checkedUrl.username ||
          checkedUrl.password
        ) {
          throw new Error("Invalid URL");
        }
      } catch {
        return NextResponse.json(
          { error: "Please enter a valid website URL." },
          { status: 400 }
        );
      }

      const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;

      if (!apiKey) {
        return NextResponse.json(
          { error: "URL security service is not configured." },
          { status: 503 }
        );
      }

      const googleResponse = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            client: {
              clientId: "fraudshield",
              clientVersion: "1.0.0",
            },
            threatInfo: {
              threatTypes: [
                "MALWARE",
                "SOCIAL_ENGINEERING",
                "UNWANTED_SOFTWARE",
              ],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [
                { url: checkedUrl.toString() },
              ],
            },
          }),
          cache: "no-store",
        }
      );

      if (!googleResponse.ok) {
        console.error(
          "Google Safe Browsing error:",
          googleResponse.status
        );

        return NextResponse.json(
          { error: "URL security verification is temporarily unavailable." },
          { status: 502 }
        );
      }

      const googleData = await googleResponse.json();
      const matches = googleData.matches || [];

      if (matches.length > 0) {
        riskLevel = "High Suspicion";
        message =
          "Warning: Google Safe Browsing identified this URL as a known threat. Avoid opening it or sharing personal information.";
      } else {
        riskLevel = "No Known Threat Found";
        message =
          "Google Safe Browsing did not identify this URL as a known threat. This does not guarantee that the website is safe.";
      }
    }

    

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

    // Search approved community fraud reports
    let communityReports: {
      id: number;
      category: string;
      description: string | null;
      createdAt: Date;
    }[] = [];

    if (["phone", "email", "url"].includes(type)) {
      const reportType = type === "url" ? "website" : type;
      const searchValue = normalizeReportValue(type, value);

      const approvedReports = await prisma.fraudReport.findMany({
        where: {
          type: reportType,
          status: "approved",
        },
        select: {
          id: true,
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

      communityReports = approvedReports
        .filter(
          (report) =>
            normalizeReportValue(type, report.reportedValue) === searchValue
        )
        .map((report) => ({
          id: report.id,
          category: report.category,
          description: report.description,
          createdAt: report.createdAt,
        }));

      if (communityReports.length > 0) {
        riskLevel = "Community Reports Found";

        const categories = [
          ...new Set(communityReports.map((report) => report.category)),
        ];

        message +=
          ` Community reports found: ${communityReports.length} approved report(s). ` +
          `Reported categories: ${categories.join(", ")}. ` +
          "Review the reported information carefully. Community reports are not independent proof of fraud.";
      } else {
        message +=
          " No approved community reports were found. This does not guarantee that the information is safe.";
      }
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
  communityReports,
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
