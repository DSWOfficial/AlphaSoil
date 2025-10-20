// server.js
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('AlphaSoil Backend is running 🚀');
});

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const aiResponse = await getAIResponse(message);
    res.json({ reply: aiResponse });
  } catch (error) {
    console.error('Error in /chat:', error);
    res.status(500).json({ reply: 'Alpha Soil is currently unavailable. Please try again later.' });
  }
});

// Function to call Mistral AI with priority for soil/agriculture topics
async function getAIResponse(message) {
  const apiKey = process.env.MISTRAL_API_KEY;
  const model = 'mistral-medium-2505';
  const endpoint = 'https://api.mistral.ai/v1/chat/completions';

  // Prompt instructions
  const systemPrompt = `
You are "Alpha Soil", an AI assistant. 
Prioritize answers regarding soil, agriculture, farming, and economy.
If someone asks who created you, respond: "Dinula Wijasinghe".
Keep answers informative, clear, and professional.
`;

  const payload = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
  };

  let retries = 2;
  while (retries >= 0) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || fallbackResponse(message);
      } else if (response.status === 429) {
        console.warn('Rate limit hit. Retrying in 2 seconds...');
        await new Promise(r => setTimeout(r, 2000));
        retries--;
      } else {
        console.error('Mistral API error:', response.statusText);
        return fallbackResponse(message);
      }
    } catch (err) {
      console.error('Network or API error:', err);
      return fallbackResponse(message);
    }
  }

  return fallbackResponse(message);
}

// Fallback response for exhibition / rate limit
function fallbackResponse(userMessage) {
  const responses = [
    "Alpha Soil is busy right now. Try again in a moment.",
    "I'm thinking... please wait a bit!",
    "AI is temporarily unavailable. Let's continue soon.",
    `You said: "${userMessage}". Alpha Soil will respond properly shortly!`
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
