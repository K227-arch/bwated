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
app.get('/', (req, res) => {
  res.status(200).send('Server is working!');
});


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
    console.log(req.body);

    if (!sessionId || !userId) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }
    
    // Get the actual amount paid from Stripe session (converting cents to dollars)
    const amountPaid = session.amount_total / 100; // Convert cents to dollars
    console.log(amountPaid);
    // Fetch the user's balanceP
    let { data: userAccount, error } = await supabase
      .from("user_accounts")
      .select("balance")
      .eq("user_id", userId)
      .single();

    if (error && error.code === "PGRST116") {
      // No user account found, create a new one with a 0 balance
      const { data: newAccount, error: createError } = await supabase
        .from("user_accounts")
        .insert({ user_id: userId, balance: 0 })
        .select()
        .single();

      if (createError) throw createError;
      userAccount = newAccount;
    } else if (error) {
      throw error;
    }

    // Formula: 100 credits = 1 dollar, so credits/100 = amount in dollars
    const creditAmount = (credits + bonus) / 100; 

    // Calculate new balance
    const newBalance = (userAccount?.balance || 0) + amountPaid ;

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
      amount: amountPaid, // Securely getting amount from Stripe session
      credits: credits + bonus,
      status: "Completed",
      created_at: new Date().toISOString(),
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
