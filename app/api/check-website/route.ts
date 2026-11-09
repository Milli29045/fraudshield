
import { NextResponse } from "next/server";

interface ThreatMatch {
  threatType?: string;
  platformType?: string;
  threatEntryType?: string;
  threat?: {
    url?: string;
  };
}

interface SafeBrowsingResponse {
  matches?: ThreatMatch[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const website =
      typeof body.url === "string" ? body.url.trim() : "";

    if (!website || website.length > 2048) {
      return NextResponse.json(
        { error: "Please enter a valid website URL." },
        { status: 400 }
      );
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(
        /^https?:\/\//i.test(website)
          ? website
          : `https://${website}`
      );
    } catch {
      return NextResponse.json(
        { error: "Invalid website URL." },
        { status: 400 }
      );
    }

    if (
      !["http:", "https:"].includes(parsedUrl.protocol) ||
      !parsedUrl.hostname.includes(".")
    ) {
      return NextResponse.json(
        { error: "Please enter a valid website URL." },
        { status: 400 }
      );
    }

    const apiKey =
      process.env.GOOGLE_SAFE_BROWSING_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Google Safe Browsing API key is missing." },
        { status: 500 }
      );
    }

    const apiUrl = new URL(
      "https://safebrowsing.googleapis.com/v4/threatMatches:find"
    );

    apiUrl.searchParams.set("key", apiKey);

    const apiResponse = await fetch(apiUrl.toString(), {
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
            { url: parsedUrl.toString() },
          ],
        },
      }),
      cache: "no-store",
    });

    if (!apiResponse.ok) {
      const errorDetails = await apiResponse.text();

      console.error(
        "Google Safe Browsing error:",
        apiResponse.status,
        errorDetails
      );

      return NextResponse.json(
        {
          error: "Google website verification failed.",
          providerStatus: apiResponse.status,
        },
        { status: 502 }
      );
    }

    const data =
      (await apiResponse.json()) as SafeBrowsingResponse;

    const matches = data.matches ?? [];

    const threats = matches.map((item) => ({
      threatType: item.threatType ?? "Unknown",
      platformType: item.platformType ?? "Unknown",
      threatEntryType: item.threatEntryType ?? "URL",
    }));

    const isThreatDetected = matches.length > 0;

    return NextResponse.json({
      success: true,
      website: parsedUrl.toString(),
      riskLevel: isThreatDetected ? "High" : "No Known Threat Found",
      result: isThreatDetected
        ? "Potential security threats were detected."
        : "No known threats were found in Google Safe Browsing lists.",
      checks: {
        threatsDetected: matches.length,
        threatTypes: threats.map((item) => item.threatType),
        platformTypes: threats.map((item) => item.platformType),
      },
      threats,
      note: "No known threats found does not guarantee that a website is completely safe.",
    });
  } catch (error) {
    console.error("Website checker error:", error);

    return NextResponse.json(
      { error: "Unable to check this website." },
      { status: 500 }
    );
  }
}
