// server.js

// 1. Ladda in dotenv
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // node-fetch@2.6.7 (CommonJS)

const app = express();
const port = process.env.PORT || 3000;

// 2. Läs OPENAI_API_KEY från .env
// (Observera att du inte längre hårdkodar nyckeln)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 3. Endpoint som anropar GPT (ex. GPT-4)
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const requestBody = {
      model: 'ft:gpt-4o-2024-08-06:revenite-ab::An3gnmOO',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message }
      ],
      max_tokens: 200,
      temperature: 0.7
    };

    // Anropa OpenAI via fetch
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI error:', data);
      return res.status(response.status).json({ error: data });
    }

    const botReply = data.choices[0].message.content;
    res.json({ response: botReply });
  } catch (error) {
    console.error('Fel i /api/chat:', error);
    res.status(500).json({ error: 'Något gick fel med chatbot-API:et.' });
  }
});

// 4. Starta server
app.listen(port, () => {
  console.log(`Server körs på http://localhost:${port}`);
});

