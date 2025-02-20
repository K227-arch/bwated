require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());

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


app.listen(5000, () => console.log("Server running on port 5000"));
