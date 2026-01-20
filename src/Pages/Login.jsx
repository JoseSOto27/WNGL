import React, { useEffect } from "react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaTwitter, FaStar, FaTrophy } from "react-icons/fa";
import logo from "../assets/images/logo_light.webp"; // Asegúrate de que la ruta sea correcta

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/"); 
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSocialLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/`, 
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div id="login" className="h-screen w-full flex bg-white overflow-hidden font-sans">
      
      {/* SECCIÓN IZQUIERDA: EL ESTADIO WINGOOL */}
      <div className="hidden lg:flex lg:w-3/5 bg-[#1a2e05] relative items-center justify-center p-12 overflow-hidden">
        {/* Imagen de fondo con overlay de marca */}
        <img 
          src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1974&auto=format&fit=crop"          
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
          alt="SportBar Vibe"
        />
        
        {/* Luces de estadio (Glow) */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-500 rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-600 rounded-full blur-[120px] opacity-20" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
          <img 
            src={logo} 
            alt="Logo Wingool" 
            className="w-48 h-auto mb-8 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-bounce-slow"
          />

          <h1 className="text-7xl font-black leading-none mb-4 tracking-tighter italic uppercase text-white">
            ¡ENTRA AL <span className="text-emerald-500">JUEGO!</span>
          </h1>

          <div className="flex items-center gap-4 mb-8">
             <div className="h-[2px] w-12 bg-emerald-500"></div>
             <FaStar className="text-emerald-500" />
             <div className="h-[2px] w-12 bg-emerald-500"></div>
          </div>

          <p className="text-2xl font-black text-emerald-400 uppercase italic tracking-tighter leading-tight">
            ÚNETE A LA AFICIÓN Y GANA <br /> 5% EN PUNTOS WINGOOL
          </p>
          
          <div className="mt-10 flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
            <FaTrophy className="text-yellow-500" />
            <p className="text-slate-200 text-xs font-black uppercase tracking-widest">
              Sede Oficial: Tulancingo, Hidalgo
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: ACCESO */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Logo visible solo en móvil */}
          <img src={logo} className="h-16 mx-auto mb-8 lg:hidden" alt="Logo" />
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-[#1a2e05] uppercase italic tracking-tighter leading-none">
              Bienvenido <br /> <span className="text-emerald-600">MVP</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-3">
              Ingresa para ordenar tus alitas
            </p>
          </div>

          <div className="space-y-4">
            {/* Google */}
            <button 
              onClick={() => handleSocialLogin('google')}
              className="w-full flex items-center justify-between px-6 py-4 bg-white text-[#1a2e05] border-2 border-slate-100 rounded-[2rem] font-black uppercase italic text-xs tracking-widest hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-95 group"
            >
              <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-white transition-colors">
                <FcGoogle size={20}/>
              </div>
              <span className="flex-1 text-center pr-6">Acceso con Google</span>
            </button>

            {/* Facebook */}
            <button 
              onClick={() => handleSocialLogin('facebook')}
              className="w-full flex items-center justify-between px-6 py-4 bg-[#1877F2] text-white rounded-[2rem] font-black uppercase italic text-xs tracking-widest hover:bg-[#145dbf] hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 group"
            >
              <div className="bg-white p-2 rounded-xl">
                <FaFacebook size={20} className="text-[#1877F2]" />
              </div>
              <span className="flex-1 text-center pr-6">Acceso con Facebook</span>
            </button>

            {/* Twitter / X */}
            <button 
              onClick={() => handleSocialLogin('twitter')}
              className="w-full flex items-center justify-between px-6 py-4 bg-black text-white rounded-[2rem] font-black uppercase italic text-xs tracking-widest hover:bg-slate-800 transition-all active:scale-95 group"
            >
              <div className="bg-white p-2 rounded-xl">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-black fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </div>
              <span className="flex-1 text-center pr-6">Acceso con Twitter</span>
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
              Al ingresar aceptas nuestras reglas de la cancha <br /> 
              <span className="text-emerald-500 underline cursor-pointer">Términos y condiciones</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;