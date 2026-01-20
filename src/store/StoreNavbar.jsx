import { Link } from "react-router-dom";
import { User, Bell, ChevronDown, Zap } from "lucide-react";
import logo from "../assets/images/logo_light.webp"; 

const StoreNavbar = () => {
  return (
    <div className="flex items-center justify-between px-8 sm:px-12 py-3 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 transition-all">
      
      {/* SECCIÓN LOGO: EL ESCUDO */}
      <Link to="/" className="relative flex items-center group">
        <div className="absolute -inset-2 bg-emerald-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <img
          src={logo}
          alt="Wingool Logo"
          className="h-10 sm:h-16 transition-transform duration-500 group-hover:scale-105 relative z-10"
        />
      </Link>

      {/* SECCIÓN USUARIO: EL MVP */}
      <div className="flex items-center gap-6">
        
        {/* Notificaciones (Opcional) */}
        <button className="relative p-2 text-slate-300 hover:text-[#1a2e05] transition-colors hidden sm:block">
           <Bell size={20} />
           <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Perfil del Administrador */}
        <div className="flex items-center gap-4 bg-slate-50 pl-4 pr-2 py-1.5 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all cursor-pointer group">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-[10px] font-[1000] text-[#1a2e05] uppercase italic leading-none tracking-tighter">
              Alejandro
            </span>
            <div className="flex items-center justify-end gap-1 mt-1">
               <Zap size={8} className="text-emerald-500" fill="currentColor" />
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Administrador</span>
            </div>
          </div>
          
          <div className="bg-[#1a2e05] p-2 rounded-xl text-emerald-400 shadow-lg shadow-emerald-900/10 group-hover:bg-emerald-500 group-hover:text-[#1a2e05] transition-all">
            <User size={18} strokeWidth={3} />
          </div>
          
          <ChevronDown size={14} className="text-slate-300 group-hover:text-[#1a2e05] transition-colors" />
        </div>
      </div>

      <style jsx>{`
        /* Ajuste para que no se vea el borde doble con el sidebar */
        div {
          selection-background-color: #10b981;
          selection-color: white;
        }
      `}</style>
    </div>
  );
};

export default StoreNavbar;