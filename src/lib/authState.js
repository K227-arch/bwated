import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';

export const   useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false); 
    };

    checkUser();

     const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user);
    });
    
    return () => authListener.subscription.unsubscribe();
  }, []);

  return { user, loading };
};
