import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from '@/lib/supabaseClient';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      console.log(user);  
    };
    getUser();
  }, []);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !user) return;

      try {
        const response = await axios.post(`https://bwat.netlify.app/.netlify/functions/api/confirm-payment`, {
          sessionId,
          userId: user.id,
          credits: 100, // Amount of credits purchased
          bonus: 10, // Any extra bonuses
        });

        console.log("Payment confirmed:", response.data);
      } catch (error) {
        console.error("Payment confirmation failed:", error.response?.data || error.message);
      }
    };

    confirmPayment();
  }, [sessionId, user]);

  return <h1>Payment Successful! Redirecting...</h1>;
};

export default PaymentSuccess;
