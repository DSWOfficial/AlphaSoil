import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const aiResponse = await getAIResponse(message);
  res.status(200).json({ reply: aiResponse });
}

async function getAIResponse(message) {
  const apiKey = process.env.MISTRAL_API_KEY;
  const model = 'mistral-medium-2505';
  const endpoint = 'https://api.mistral.ai/v1/chat/completions';

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

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('AI API error');
    const data = await response.json();
    return data.choices[0]?.message?.content || "AI is unavailable right now.";
  } catch (err) {
    console.error(err);
    return "AI is unavailable right now.";
  }
}
