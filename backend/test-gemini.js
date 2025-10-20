import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

async function testGemini() {
  const prompt = "Hello, Alpha Soil!";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-turbo:generateMessage?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: {
            messages: [
              {
                author: "user",
                content: prompt // must be a string
              }
            ]
          }
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Network/error:", err);
  }
}

testGemini();
