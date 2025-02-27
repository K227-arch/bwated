import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import OpenAI from 'openai';
import Stripe from "stripe";

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store chat histories
const chatHistories = new Map();

wss.on('connection', (ws) => {
  console.log('New client connected');
  let conversationHistory = [];

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      // Add user message to history
      conversationHistory.push({
        role: 'user',
        content: data.text
      });

      // Get AI response
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: conversationHistory,
        stream: true
      });

      let aiResponse = '';
      
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          aiResponse += content;
          ws.send(JSON.stringify({
            type: 'content',
            content: content
          }));
        }
      }

      // Add AI response to history
      conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      });

      // Signal end of response
      ws.send(JSON.stringify({ type: 'end' }));

    } catch (error) {
      console.error('Error:', error);
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Failed to process message' 
      }));
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Subscription Plan" },
            unit_amount: req.body.price * 100, 
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://localhost:3000/success",
      cancel_url: "https://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
