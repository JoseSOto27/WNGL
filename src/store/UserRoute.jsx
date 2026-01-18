import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase"; 

export const UserRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Cargando...</div>;

  // Aquí no importa si es 'admin' o 'cliente', solo que esté logueado
  return session ? children : <Navigate to="/shop" />;
};