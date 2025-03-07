import express from "express";
import Stripe from "stripe";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const stripe = Stripe(process.env.VITE_STRIPE_SECRET_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_KEY);


console.log(process.env.VITE_STRIPE_PUBLIC_KEY);

app.use(cors());
app.use(express.json());

// Create a checkout session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { amount, userId, email, credits, bonus } = req.body;
    
    if (!amount || !userId || !email) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Account Credit" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout?canceled=true`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

// Confirm payment and update balance
app.post("/confirm-payment", async (req, res) => {
  try {
    const { sessionId, userId, credits, bonus } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // Fetch the user’s balance
    const { data: userAccount, error } = await supabase
      .from("user_accounts")
      .select("balance")
      .eq("user_id", userId)
      .single();
    
    if (error) throw error;
    const newBalance = (userAccount?.balance || 0) + (credits + bonus) / 10;

    // Update balance
    const { error: updateError } = await supabase
      .from("user_accounts")
      .update({ balance: newBalance })
      .eq("user_id", userId);

    if (updateError) throw updateError;

    // Log transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "Deposit",
      amount: session.amount_total / 100,
      credits: credits + bonus,
      status: "Completed",
    });

    res.json({ message: "Payment successful", newBalance });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({ message: "Payment confirmation failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
