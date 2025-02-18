import { supabase } from "@/lib/supabaseClient";
import {  Navigate } from "react-router-dom";

export const signOut = async () => {
  const nav = Navigate()
    await supabase.auth.signOut();
    nav("/login")
  };