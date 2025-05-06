const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SERP_API_KEY = process.env.SERP_API_KEY;

app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});

app.post("/api/check-ranking", async (req, res) => {
  const { url, keyword, country, language, device, location } = req.body;

  const params = new URLSearchParams({
    engine: "google",
    q: keyword,
    google_domain: "google.com.tr",
    gl: country || "tr",
    hl: language === "lang_tr" ? "tr" : "en",
    device: device || "desktop",
    api_key: SERP_API_KEY,
    num: "100"
  });

  if (location && location !== "Türkiye") {
    params.set("location", `${location},Turkey`);
  }

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`);
    const data = await response.json();
    const results = data.organic_results || [];
    const ads_data = data.search_information || {};

    const position = results.findIndex((r) => r.link.includes(url)) + 1;
    const page = position > 0 ? Math.ceil(position / 10) : "Bulunamadı";

    const keyword_metrics = {
      search_volume: ads_data.total_results || "Bilinmiyor",
      competition: ads_data.competition || "Bilinmiyor",
      average_tbm: ads_data.average_cpc ? `$${ads_data.average_cpc}` : "Bilinmiyor"
    };

    res.json({
      position: position > 0 ? position : "Bulunamadı",
      page: position > 0 ? page : "-",
      location: location || "Türkiye",
      keyword_metrics
    });
  } catch (error) {
    res.status(500).json({ error: "API çağrısı başarısız", detail: error.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server ${PORT} portunda çalışıyor`));
