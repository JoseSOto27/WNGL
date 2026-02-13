import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase"; 

export const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        // Obtenemos el usuario actual de la sesión
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setIsAdmin(false);
          return;
        }

        // Consultamos el rol en la tabla profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error || !data) {
          setIsAdmin(false);
        } else {
          // Limpiamos el texto para evitar errores de saltos de línea (\n)
          const cleanRole = data.role.trim().toLowerCase();
          setIsAdmin(cleanRole === 'admin');
        }
      } catch (err) {
        console.error("Error verificando sesión:", err);
        setIsAdmin(false);
      }
    };

    checkUserRole();
  }, []);

  // Mientras se decide si es admin o no, mostramos un estado de carga
  if (isAdmin === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="text-lg font-medium text-slate-600 animate-pulse">
          Verificando credenciales...
        </div>
      </div>
    );
  }

  // Si es admin permite el paso, si no, redirige al login de administración
  return isAdmin ? children : <Navigate to="/admin" replace />;

  
};