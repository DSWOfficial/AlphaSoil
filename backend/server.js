// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const reply = await getAIResponse(message);
    res.json({ reply });
  } catch (err) {
    console.error("Error in /chat:", err);
    res.status(500).json({ reply: "Alpha Soil is currently unavailable. Please try again later." });
  }
});

// Mistral AI call
async function getAIResponse(message) {
  const apiKey = process.env.MISTRAL_API_KEY;
  const model = "mistral-medium-2505";
  const endpoint = "https://api.mistral.ai/v1/chat/completions";

  const systemPrompt = `
You are "Alpha Soil", an AI assistant.
Focus on soil, agriculture, farming, and economy.
If someone asks who created you, reply: "Dinula Wijasingha".
`;

  const payload = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content || "Alpha Soil could not generate a response.";
    } else {
      console.error("Mistral API error:", response.statusText);
      return "Alpha Soil is temporarily unavailable.";
    }
  } catch (err) {
    console.error("Network/API error:", err);
    return "Alpha Soil is busy right now. Try again later.";
  }
}

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "../frontend/build");
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Alpha Soil server running on port ${PORT}`);
});
