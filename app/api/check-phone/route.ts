
import { NextResponse } from "next/server";

interface PhoneApiResponse {
  phone_number?: string;

  phone_format?: {
    international?: string;
    national?: string;
  };

  phone_carrier?: {
    name?: string;
    line_type?: string;
    mcc?: string;
    mnc?: string;
  };

  phone_location?: {
    country_name?: string;
    country_code?: string;
    country_prefix?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };

  phone_validation?: {
    is_valid?: boolean;
    line_status?: string;
    is_voip?: boolean;
    minimum_age?: number;
  };

  phone_risk?: {
    risk_level?: string;
    is_disposable?: boolean;
    is_abuse_detected?: boolean;
  };

  phone_breaches?: {
    total_breaches?: number;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const phone =
      typeof body.phone === "string" ? body.phone.trim() : "";

    if (!phone || phone.length > 25) {
      return NextResponse.json(
        { error: "Please provide a valid phone number." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ABSTRACT_PHONE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Phone API key is not configured." },
        { status: 500 }
      );
    }

    const apiUrl = new URL(
      "https://phoneintelligence.abstractapi.com/v1/"
    );

    apiUrl.searchParams.set("api_key", apiKey);
    apiUrl.searchParams.set("phone", phone);

    const apiResponse = await fetch(apiUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();

      console.error(
        "Abstract Phone API error:",
        apiResponse.status,
        errorText
      );

      return NextResponse.json(
        {
          error: "Phone verification service returned an error.",
          providerStatus: apiResponse.status,
        },
        { status: 502 }
      );
    }

    const data = (await apiResponse.json()) as PhoneApiResponse;

    const validation = data.phone_validation;
    const carrier = data.phone_carrier;
    const location = data.phone_location;
    const risk = data.phone_risk;

    const rawRisk = risk?.risk_level?.toLowerCase() ?? "unknown";

    let riskLevel = "Unknown";
    let result = "Not enough information to determine phone risk.";

    if (validation?.is_valid === false) {
      riskLevel = "Invalid / Unverified";
      result =
        "This phone number could not be validated. Its fraud risk cannot be confirmed.";
    } else if (validation?.is_valid === true) {
      if (rawRisk === "high") {
        riskLevel = "High";
        result = "High-risk phone indicators were detected.";
      } else if (rawRisk === "medium") {
        riskLevel = "Medium";
        result =
          "This phone number has some risk indicators and requires further verification.";
      } else if (rawRisk === "low") {
        riskLevel = "Low";
        result = "No major phone risk indicators were detected.";
      }
    }

    return NextResponse.json({
      success: true,

      phone: data.phone_number ?? phone,

      riskLevel,
      result,

      checks: {
        valid: validation?.is_valid ?? null,
        lineStatus: validation?.line_status ?? null,
        country: location?.country_name ?? null,
        countryCode: location?.country_code ?? null,
        region: location?.region ?? null,
        city: location?.city ?? null,
        lineType: carrier?.line_type ?? null,
        carrier: carrier?.name ?? null,
        isVoip: validation?.is_voip ?? null,
        riskLevel: risk?.risk_level ?? null,
        disposable: risk?.is_disposable ?? null,
        abuseDetected: risk?.is_abuse_detected ?? null,
        minimumAgeDays: validation?.minimum_age ?? null,
        totalBreaches: data.phone_breaches?.total_breaches ?? null,
      },

      note:
        "Phone validation and risk indicators do not prove that the phone number owner is a fraudster.",
    });
  } catch (error) {
    console.error("Phone verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify this phone number." },
      { status: 500 }
    );
  }
}
