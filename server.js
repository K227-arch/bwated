// import dotenv from "dotenv";
// import express from "express";
// import cors from "cors";
// import { WebSocketServer } from 'ws';
// import { createServer } from 'http';
// import OpenAI from 'openai';
// import Stripe from "stripe";

// dotenv.config();

// const app = express();
// const server = createServer(app);
// const wss = new WebSocketServer({ server });

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// app.use(cors());
// app.use(express.json());

// // Initialize OpenAI
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY
// });

// // Store chat histories
// const chatHistories = new Map();

// wss.on('connection', (ws) => {
//   console.log('New client connected');
//   let conversationHistory = [];

//   ws.on('message', async (message) => {
//     try {
//       const data = JSON.parse(message);
      
//       // Add user message to history
//       conversationHistory.push({
//         role: 'user',
//         content: data.text
//       });

//       // Get AI response
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4-turbo-preview",
//         messages: conversationHistory,
//         stream: true
//       });

//       let aiResponse = '';
      
//       for await (const chunk of completion) {
//         const content = chunk.choices[0]?.delta?.content || '';
//         if (content) {
//           aiResponse += content;
//           ws.send(JSON.stringify({
//             type: 'content',
//             content: content
//           }));
//         }
//       }

//       // Add AI response to history
//       conversationHistory.push({
//         role: 'assistant',
//         content: aiResponse
//       });

//       // Signal end of response
//       ws.send(JSON.stringify({ type: 'end' }));

//     } catch (error) {
//       console.error('Error:', error);
//       ws.send(JSON.stringify({ 
//         type: 'error', 
//         message: 'Failed to process message' 
//       }));
//     }
//   });

//   ws.on('close', () => {
//     console.log('Client disconnected');
//   });
// });

// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: { name: "Subscription Plan" },
//             unit_amount: req.body.price * 100, 
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: "https://localhost:3000/success",
//       cancel_url: "https://localhost:3000/cancel",
//     });

//     res.json({ id: session.id });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


import express from "express";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import "dotenv/config";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv"
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
dotenv.config();
const port = process.env.PORT || 3000;
const apiKey = process.env.VITE_OPENAI_KEY;
// console.log(apiKey)
// Configure Vite middleware for React client
const vite = await createViteServer({
  server: { middlewareMode: true },
  appType: "custom",
});
app.use(vite.middlewares);

// API route for token generation
app.get("/token", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini-realtime-preview-2024-12-17",
          voice: "verse",
        }),
      },
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Move this outside of the route handler to cache the template
let templateHtml = null;

// Render the React client
app.use("*", async (req, res, next) => {
  try {
    // Only load and transform the template once
    if (!templateHtml) {
      const indexPath = path.resolve(__dirname, '../index.html');
      const rawHtml = fs.readFileSync(indexPath, "utf-8");
      templateHtml = await vite.transformIndexHtml(req.originalUrl, rawHtml);
    }

    // Load and render the component
    const { render } = await vite.ssrLoadModule("/src/components/ChatInterface.jsx");
    
    if (typeof render !== 'function') {
      throw new Error('SSR render function not available');
    }

    const appHtml = await render(req.originalUrl);
    const html = templateHtml.replace('<!--ssr-outlet-->', appHtml?.html || '');

    return res
      .status(200)
      .set({ "Content-Type": "text/html" })
      .end(html);

  } catch (error) {
    vite.ssrFixStacktrace(error);
    console.error('SSR Error:', error);
    next(error);
  }
});

app.listen(port, () => {
  console.log(`Express server running on *:${port}`);
});
