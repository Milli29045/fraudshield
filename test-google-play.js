const gplay = require("@mradex77/google-play-scraper");

async function testGooglePlay() {
  try {
    const results = await gplay.search({
      term: "WhatsApp",
      num: 5
    });

    console.log(JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Google Play search failed:", error.message);
  }
}

testGooglePlay();