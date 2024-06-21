import OpenAI from 'openai';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

dotenv.config();

const __dirname = path.resolve(); // Obter diretório atual

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const corsOptions = {
  origin: 'https://chatgptjoao.onrender.com/' // substitua com seu próprio domínio
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Servindo arquivos estáticos (como index.html)
app.use(express.static(path.join(__dirname, 'src')));

async function main(userMessage) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: userMessage }],
      model: "gpt-3.5-turbo",
    });

    console.log('Completion:', completion.choices[0].message);

    const reply = completion.choices && completion.choices.length > 0
      ? completion.choices[0].message.content
      : 'No response from AI';

    return reply;
  } catch (error) {
    console.error('Error in main function:', error);
    throw error;
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.post('/send-message', async (req, res) => {
  const { userMessage } = req.body;

  try {
    const reply = await main(userMessage);

    console.log('Full Response:', reply);

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
