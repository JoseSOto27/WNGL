import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Bell, ChevronDown, Trophy, X, LogOut, Star, Zap, MapPin, CreditCard, Banknote } from "lucide-react";
import logo from "../assets/images/logo_light.webp"; 
import { supabase } from "../services/supabase";
import toast from "react-hot-toast";

const StoreNavbar = () => {
  const [adminName, setAdminName] = useState("Admin");
  const [notificaciones, setNotificaciones] = useState([]);
  const [showBellMenu, setShowBellMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const playWhistle = () => {
    const audio = new Audio('/whistle.mp3'); 
    audio.play().catch(() => {});
  };

  useEffect(() => {
    getAdminProfile();

    const channel = supabase
      .channel('navbar-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos_v2' }, 
        (payload) => {
          playWhistle();
          setNotificaciones(prev => [payload.new, ...prev]);
          
          // NOTIFICACIÓN GIGANTE Y DETALLADA
          toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-[#0f1a04] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[3rem] pointer-events-auto ring-2 ring-emerald-500 border-b-[12px] border-emerald-600 p-8`}>
                <div className="flex flex-col gap-6">
                  {/* Encabezado de Notificación */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500 p-2 rounded-xl text-[#0f1a04] animate-bounce">
                        <Trophy size={24} fill="currentColor" />
                      </div>
                      <span className="text-[10px] font-[1000] text-emerald-500 uppercase tracking-[0.4em] italic">Nuevo Pedido MVP</span>
                    </div>
                    <button onClick={() => toast.dismiss(t.id)} className="text-white/20 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  {/* Cuerpo Principal */}
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-white/30 uppercase italic tracking-widest leading-none">Cliente / Jugador</p>
                    <h3 className="text-3xl font-[1000] text-white uppercase italic tracking-tighter leading-tight">
                      {payload.new.cliente_nombre}
                    </h3>
                  </div>

                  {/* Detalles Tácticos */}
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 p-2 rounded-lg text-emerald-500">
                        {payload.new.metodo_pago?.toLowerCase().includes('efectivo') ? <Banknote size={18} /> : <CreditCard size={18} />}
                      </div>
                      <div className="leading-none">
                        <p className="text-[8px] font-black text-white/20 uppercase italic mb-1 tracking-widest">Pago</p>
                        <p className="text-[10px] font-black text-white uppercase italic">{payload.new.metodo_pago}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 p-2 rounded-lg text-emerald-500">
                        <MapPin size={18} />
                      </div>
                      <div className="leading-none">
                        <p className="text-[8px] font-black text-white/20 uppercase italic mb-1 tracking-widest">Sede</p>
                        <p className="text-[10px] font-black text-white uppercase italic truncate max-w-[80px]">Tulancingo</p>
                      </div>
                    </div>
                  </div>

                  {/* Marcador Final */}
                  <div className="bg-emerald-500 p-5 rounded-[2rem] flex justify-between items-center shadow-lg shadow-emerald-500/20">
                     <span className="text-[11px] font-[1000] text-[#0f1a04] uppercase italic tracking-widest">Total Cobrado</span>
                     <span className="text-4xl font-[1000] text-[#0f1a04] italic tracking-tighter leading-none">${payload.new.total}</span>
                  </div>
                </div>
            </div>
          ), { duration: 8000 });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getAdminProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('nombre').eq('id', user.id).single();
      if (data) setAdminName(data.nombre);
    }
  };

  return (
    <div className="flex items-center justify-between px-8 sm:px-12 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm font-sans">
      
      <Link to="/" className="flex items-center transition-transform hover:scale-105">
        <img src={logo} alt="Wingool" className="h-10 sm:h-12" />
      </Link>

      <div className="flex items-center gap-6">
        
        {/* CAMPANA CON ANIMACIÓN DE BALANCEO */}
        <div className="relative">
          <button 
            onClick={() => setShowBellMenu(!showBellMenu)} 
            className={`p-2.5 rounded-xl transition-all relative ${notificaciones.length > 0 ? 'text-emerald-500 bg-emerald-50' : 'text-slate-300 hover:bg-slate-50'}`}
          >
            <Bell size={22} className={notificaciones.length > 0 ? "animate-swing" : ""} />
            {notificaciones.length > 0 && (
              <span className="absolute top-0.5 right-0.5 size-5 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                {notificaciones.length}
              </span>
            )}
          </button>

          {/* MENÚ DE NOTIFICACIONES */}
          {showBellMenu && (
            <div className="absolute right-0 mt-5 w-80 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[60] animate-in slide-in-from-top-3">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <span className="text-[11px] font-[1000] text-[#0f1a04] uppercase italic tracking-[0.2em]">Vestidores</span>
                <button onClick={() => setNotificaciones([])} className="text-[9px] font-black text-slate-300 hover:text-red-500 uppercase italic">Limpiar</button>
              </div>
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notificaciones.length === 0 ? (
                  <div className="p-14 text-center">
                    <Zap size={28} className="mx-auto text-slate-100 mb-3" />
                    <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Estadio en silencio</p>
                  </div>
                ) : (
                  notificaciones.map((n, i) => (
                    <div key={i} className="p-5 border-b border-slate-50 hover:bg-slate-50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-[#0f1a04] group-hover:text-emerald-500 transition-all">
                          <Trophy size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-[1000] text-[#0f1a04] uppercase italic leading-none truncate">{n.cliente_nombre}</p>
                          <p className="text-[9px] font-black text-slate-400 mt-1 uppercase italic tracking-tighter">${n.total} • Ticket #{n.id.toString().slice(-4)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* PERFIL MVP ADMIN */}
        <div className="relative">
          <div onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-3 bg-slate-50 p-1.5 pr-5 rounded-[1.5rem] border border-slate-100 cursor-pointer hover:bg-white transition-all shadow-sm">
            <div className="bg-[#0f1a04] p-2.5 rounded-2xl text-emerald-400">
              <User size={18} strokeWidth={3} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[10px] font-black text-[#1a2e05] uppercase italic leading-none">{adminName}</p>
              <div className="flex items-center gap-1 mt-1 opacity-40">
                <Star size={7} fill="currentColor" className="text-amber-500" />
                <span className="text-[8px] font-black uppercase tracking-tighter">MVP ADMIN</span>
              </div>
            </div>
            <ChevronDown size={12} className={`text-slate-300 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </div>

          {showUserMenu && (
            <div className="absolute right-0 mt-4 w-52 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <button onClick={async () => { await supabase.auth.signOut(); navigate("/"); }} className="w-full flex items-center gap-4 px-6 py-4 text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={16} />
                <span className="text-[10px] font-black uppercase italic">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes swing {
          0%, 100% { transform: rotate(0deg); }
          15% { transform: rotate(20deg); }
          30% { transform: rotate(-15deg); }
          45% { transform: rotate(10deg); }
          60% { transform: rotate(-5deg); }
        }
        .animate-swing {
          animation: swing 2.5s infinite ease-in-out;
          transform-origin: top center;
        }
      `}</style>
    </div>
  );
};

export default StoreNavbar;