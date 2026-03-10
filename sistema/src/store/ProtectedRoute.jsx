import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../services/supabase"; 
import { Loader2, ShieldCheck, Zap } from "lucide-react"; // Añadimos iconos para el estilo Wingool

export const AdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          setIsAdmin(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (error || !data) {
          setIsAdmin(false);
        } else {
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

  // ✅ ESTADO DE CARGA CON ESTILO WINGOOL
  if (isAdmin === null) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-white font-sans overflow-hidden relative">
        {/* Iluminación de fondo sutil */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
        
        <div className="relative flex flex-col items-center">
          {/* Icono de Seguridad Estilizado */}
          <div className="relative mb-6">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
              <ShieldCheck size={48} className="text-emerald-500" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#1a2e05] p-2 rounded-xl shadow-lg border border-white/10">
              <Loader2 size={18} className="text-emerald-400 animate-spin" />
            </div>
          </div>

          {/* Textos Wingool */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-[1000] text-[10px] uppercase tracking-[0.4em] italic mb-1">
              <Zap size={12} fill="currentColor" /> Acceso VIP
            </div>
            <h2 className="text-2xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
              REVISANDO <span className="text-emerald-500">CREDENCIALES</span>
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
              Validando rango en la cancha...
            </p>
          </div>
        </div>

        {/* Footer Discreto */}
        <div className="absolute bottom-10 opacity-20">
          <p className="text-[8px] font-black text-[#1a2e05] uppercase tracking-[0.6em] italic">
            Wingool Admin • Security Protocol
          </p>
        </div>
      </div>
    );
  }

  return isAdmin ? children : <Navigate to="/admin" replace />;
};