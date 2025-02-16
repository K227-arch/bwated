import { supabase } from "@/lib/supabaseClient";
import { Navigate, useNavigate } from "react-router-dom";

export const signOut = async () => {
  const nav = useNavigate()
    await supabase.auth.signOut();
    nav("/login")
  };