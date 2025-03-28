import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/authState";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);

//   console.log("my user", user);

  useEffect(() => {
    const getAuth = async () => {
      if (user) {
        const { data: userData, error: userCheckError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (userCheckError) {
          console.error(userCheckError);
          setIsAdmin(false);
          return;
        }
        // console.log(userData);
        setIsAdmin(userData.role === 'admin');
      }
    };

    getAuth();
  }, [user]);

  if (loading) return <p>Loading...</p>;

  if (isAdmin === null) return null; // Still loading auth status

  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}
export default ProtectedRoute;
