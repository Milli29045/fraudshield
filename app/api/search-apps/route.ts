
import { NextRequest, NextResponse } from "next/server";
import gplay from "@mradex77/google-play-scraper";

interface StoreApp {
  id: string;
  name: string;
  description: string;
  icon: string | null;
  rating: number | null;
  installs: string | null;
  platform: "Android" | "iOS";
  storeUrl: string;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json(
      { success: false, message: "Please enter at least 2 characters." },
      { status: 400 }
    );
  }

  try {
    const [androidResult, iosResult] = await Promise.allSettled([
      gplay.search({
        term: query,
        num: 10,
        country: "us",
        lang: "en",
      }),
      fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=software&limit=10&country=us`,
        { cache: "no-store" }
      ).then(async (response) => {
        if (!response.ok) {
          throw new Error("Apple App Store search failed.");
        }

        return response.json();
      }),
    ]);

    const androidApps: StoreApp[] =
      androidResult.status === "fulfilled"
        ? androidResult.value.map((app: any) => ({
            id: String(app.appId),
            name: app.title,
            description: app.summary || "",
            icon: app.icon || null,
            rating: app.score ?? null,
            installs: app.installs ?? null,
            platform: "Android",
            storeUrl:
              app.url ||
              `https://play.google.com/store/apps/details?id=${app.appId}`,
          }))
        : [];

    const iosApps: StoreApp[] =
      iosResult.status === "fulfilled"
        ? iosResult.value.results.map((app: any) => ({
            id: String(app.trackId),
            name: app.trackName,
            description: app.description || "",
            icon: app.artworkUrl512 || app.artworkUrl100 || null,
            rating: app.averageUserRating ?? null,
            installs: null,
            platform: "iOS",
            storeUrl: app.trackViewUrl,
          }))
        : [];

    const apps = [...androidApps, ...iosApps];

    return NextResponse.json({
      success: true,
      query,
      total: apps.length,
      apps,
      sources: {
        googlePlay: androidResult.status,
        appleAppStore: iosResult.status,
      },
    });
  } catch (error) {
    console.error("App search error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to search apps right now." },
      { status: 500 }
    );
  }
}
