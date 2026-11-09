
import { NextResponse } from "next/server";

interface EmailReputationResponse {
  email_address?: string;
  suggested_correction?: string | null;
  email_deliverability?: {
    status?: string;
    status_detail?: string;
    is_format_valid?: boolean;
    is_smtp_valid?: boolean;
    is_mx_valid?: boolean;
  };
  email_quality?: {
    score?: string | number;
    is_free_email?: boolean;
    is_username_suspicious?: boolean;
    is_disposable?: boolean;
    is_catchall?: boolean;
    is_role?: boolean;
    is_dmarc_enforced?: boolean;
    is_spf_strict?: boolean;
  };
  email_domain?: {
    domain?: string;
    domain_age?: number;
    is_live_site?: boolean;
    is_risky_tld?: boolean;
  };
  email_risk?: {
    address_risk_status?: string;
    domain_risk_status?: string;
  };
  email_breaches?: {
    total_breaches?: number;
    date_first_breached?: string | null;
    date_last_breached?: string | null;
    breached_domains?: Array<{
      domain?: string;
      date_breached?: string;
    }>;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string" ? body.email.trim() : "";

    if (
      !email ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const apiKey = process.env.ABSTRACT_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Email API key is not configured." },
        { status: 500 }
      );
    }

    const apiUrl = new URL(
      "https://emailreputation.abstractapi.com/v1/"
    );

    apiUrl.searchParams.set("api_key", apiKey);
    apiUrl.searchParams.set("email", email);

    const apiResponse = await fetch(apiUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!apiResponse.ok) {
      console.error("Abstract Email Reputation API status:", apiResponse.status);

      return NextResponse.json(
        {
          error: "Email reputation service rejected the request.",
          providerStatus: apiResponse.status,
        },
        { status: 502 }
      );
    }

    const data =
      (await apiResponse.json()) as EmailReputationResponse;

    const addressRisk =
      data.email_risk?.address_risk_status?.toLowerCase();

    const domainRisk =
      data.email_risk?.domain_risk_status?.toLowerCase();

    const deliverability =
      data.email_deliverability?.status?.toLowerCase();

    const qualityScore = Number(data.email_quality?.score);

    let riskLevel = "Unknown";
    let result = "Not enough information to determine email risk.";

    if (
      addressRisk === "high" ||
      domainRisk === "high" ||
      deliverability === "undeliverable" ||
      data.email_quality?.is_disposable === true ||
      data.email_quality?.is_username_suspicious === true
    ) {
      riskLevel = "High";
      result = "High-risk indicators were detected for this email.";
    } else if (
      addressRisk === "medium" ||
      domainRisk === "medium" ||
      deliverability === "risky" ||
      data.email_domain?.is_risky_tld === true
    ) {
      riskLevel = "Medium";
      result = "Some email risk indicators require further checking.";
    } else if (
      addressRisk === "low" &&
      domainRisk === "low" &&
      deliverability === "deliverable"
    ) {
      riskLevel = "Low";
      result = "No major email reputation risks were detected.";
    }

    return NextResponse.json({
      success: true,
      email: data.email_address ?? email,
      riskLevel,
      result,
      checks: {
        deliverability: data.email_deliverability?.status ?? "Unknown",
        formatValid:
          data.email_deliverability?.is_format_valid ?? null,
        smtpValid:
          data.email_deliverability?.is_smtp_valid ?? null,
        mxValid:
          data.email_deliverability?.is_mx_valid ?? null,
        qualityScore: Number.isFinite(qualityScore)
          ? qualityScore
          : null,
        disposable: data.email_quality?.is_disposable ?? null,
        suspiciousUsername:
          data.email_quality?.is_username_suspicious ?? null,
        freeEmail: data.email_quality?.is_free_email ?? null,
        addressRisk: addressRisk ?? "Unknown",
        domainRisk: domainRisk ?? "Unknown",
        domain: data.email_domain?.domain ?? null,
        domainAge: data.email_domain?.domain_age ?? null,
        totalBreaches: data.email_breaches?.total_breaches ?? null,
      },
      note: "Email reputation signals do not prove that the email owner is a fraudster.",
    });
  } catch (error) {
    console.error("Email reputation error:", error);

    return NextResponse.json(
      { error: "Unable to check email reputation." },
      { status: 500 }
    );
  }
}
