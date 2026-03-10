import React, { useState, useEffect } from 'react';
import { Clock, Lock, X, Utensils, ShieldAlert, Calendar, Zap, AlertCircle } from 'lucide-react';
import { checkWingoolStatus } from './verificarHorario'; 

const BannerHorario = () => {
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState({ titulo: "", cuerpo: "", sub: "" });

  const checkStatus = () => {
    const { isClosed, status } = checkWingoolStatus();
    if (!isClosed) { setShowModal(false); return; }

    let nuevoMensaje = {};
    switch (status) {
      case "LUNES":
        nuevoMensaje = {
          titulo: "ESTADIO EN <span class='text-red-600'>MANTENIMIENTO</span>",
          cuerpo: "Los lunes recargamos el poder para la próxima victoria.",
          sub: "NOS VEMOS MAÑANA MARTES • 1:00 PM"
        };
        break;
      case "PREPARANDO":
        nuevoMensaje = {
          titulo: "PREPARANDO LA <span class='text-red-600'>ALINEACIÓN</span>",
          cuerpo: "La cocina está entrando en calor. Abrimos hoy a la 1:00 PM.",
          sub: "AFILA EL COLMILLO, FALTA POCO"
        };
        break;
      case "FINALIZADO":
        nuevoMensaje = {
          titulo: "FINAL DEL <span class='text-red-600'>PARTIDO</span>",
          cuerpo: "El silbatazo final ha sonado. Los vestidores están cerrados.",
          sub: "PRÓXIMO ENCUENTRO: MAÑANA • 1:00 PM"
        };
        break;
      default: break;
    }
    setMensaje(nuevoMensaje);
    setShowModal(true);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-[#0a0f02]/90 backdrop-blur-md font-sans">
      
      <style>{`
        @keyframes border-alert {
          0%, 100% { border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.3); }
          50% { border-color: #1a2e05; box-shadow: 0 0 5px rgba(26, 46, 5, 0.1); }
        }
        @keyframes pulse-icon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-border-alert { animation: border-alert 3s infinite ease-in-out; }
        .animate-pulse-icon { animation: pulse-icon 2s infinite ease-in-out; }
      `}</style>

      {/* ✅ CARD COMPACTA Y SIN LÍNEA DE ESCANEO */}
      <div className="relative w-full max-w-[380px] bg-white border-[4px] animate-border-alert rounded-[3rem] overflow-hidden shadow-2xl">
        
        {/* CABECERA COMPACTA */}
        <div className="pt-8 pb-4 flex justify-center relative">
          <div className="absolute inset-0 opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="relative z-10 bg-white p-4 rounded-[1.8rem] shadow-lg border border-red-50 animate-pulse-icon">
            {mensaje.sub.includes("MAÑANA") 
              ? <Calendar size={36} className="text-red-600" /> 
              : <Clock size={36} className="text-red-500" />
            }
            <div className="absolute -top-1 -right-1 bg-red-600 rounded-full p-1 border-2 border-white">
              <AlertCircle size={10} className="text-white" />
            </div>
          </div>
          
          <button 
            onClick={() => setShowModal(false)} 
            className="absolute top-5 right-7 text-slate-300 hover:text-red-600 transition-colors z-50"
          >
            <X size={22} strokeWidth={3} />
          </button>
        </div>

        {/* CONTENIDO REDUCIDO */}
        <div className="px-8 pt-6 pb-10 text-center relative z-20">
          <div className="inline-flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1 rounded-full mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-[8px] font-black text-red-700 uppercase tracking-[0.3em] italic">Mantenimiento</span>
          </div>

          <h2 
            className="text-3xl md:text-4xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-[0.9] mb-4"
            dangerouslySetInnerHTML={{ __html: mensaje.titulo }} 
          />
          
          <div className="w-12 h-1 bg-red-100 mx-auto rounded-full mb-6"></div>

          <p className="text-slate-500 font-bold italic text-xs leading-tight mb-8 uppercase px-2">
            {mensaje.cuerpo}
          </p>

          {/* BANNER HORARIO COMPACTO */}
          <div className="bg-[#1a2e05] p-4 rounded-[1.5rem] mb-8 border-l-[5px] border-red-600 shadow-md transform hover:scale-[1.02] transition-transform">
            <p className="text-[11px] text-white font-[1000] uppercase tracking-wider italic leading-none">
              {mensaje.sub}
            </p>
          </div>

          {/* BOTÓN ESTILIZADO */}
          <button 
            onClick={() => setShowModal(false)}
            className="w-full bg-[#1a2e05] text-white py-4 rounded-[1.5rem] font-[1000] uppercase italic tracking-widest hover:bg-emerald-600 transition-all active:scale-[0.97] shadow-lg flex items-center justify-center gap-3"
          >
            <Zap size={16} fill="currentColor" className="text-red-500" />
            <span className="text-xs">EXPLORAR MENÚ</span>
            <Utensils size={16} className="text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerHorario;