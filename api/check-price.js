import axios from "axios";

const TARGET_API = "https://laternaerp.smerp.io/price-checker/search";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const barcode = String(body?.barcode || "").trim();

    if (!barcode) {
      return res.status(400).json({ success: false, message: "Barcode is required" });
    }

    console.log(`Searching for barcode: ${barcode}`);

    const response = await axios.post(
      TARGET_API,
      { barcode },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      }
    );

    console.log("API Response:", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(
      "Proxy Error:",
      error.response ? error.response.data : error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Proxy failed to reach SMERP API",
    });
  }
}
