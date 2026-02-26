import React, { useState, useEffect } from 'react';
import { Clock, Lock, X, Utensils, AlertTriangle, ShieldAlert, Calendar } from 'lucide-react';
// IMPORTAMOS LA UTILIDAD
import { checkWingoolStatus } from './verificarHorario'; 

const BannerHorario = () => {
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState({ titulo: "", cuerpo: "", sub: "" });

  const checkStatus = () => {
    // LLAMAMOS AL ÁRBITRO CENTRAL
    const { isClosed, status } = checkWingoolStatus();

    if (!isClosed) {
      setShowModal(false);
      return;
    }

    let nuevoMensaje = {};

    switch (status) {
      case "LUNES":
        nuevoMensaje = {
          titulo: "ESTADIO EN <span class='text-[#ef4444]'>MANTENIMIENTO</span>",
          cuerpo: "Los lunes nos tomamos un respiro para volver con todo el poder.",
          sub: "TE ESPERAMOS MAÑANA MARTES A PARTIR DE LA 1:00 PM"
        };
        break;
      case "PREPARANDO":
        nuevoMensaje = {
          titulo: "PREPARANDO LA <span class='text-[#ef4444]'>ALINEACIÓN</span>",
          cuerpo: "La cocina se está calentando. Abrimos hoy a las 1:00 PM.",
          sub: "AFILA EL COLMILLO, FALTA POCO PARA EL PITAZO INICIAL"
        };
        break;
      case "FINALIZADO":
        nuevoMensaje = {
          titulo: "FINAL DEL <span class='text-[#ef4444]'>PARTIDO</span>",
          cuerpo: "El servicio de hoy ha terminado. Cerramos a las 10:00 PM.",
          sub: "TE ESPERAMOS MAÑANA A PARTIR DE LA 1:00 PM"
        };
        break;
      default:
        break;
    }

    setMensaje(nuevoMensaje);
    setShowModal(true);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const cerrarModal = () => setShowModal(false);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#0a0f02]/90 backdrop-blur-md font-sans">
      <style>{`
        @keyframes border-flicker {
          0%, 100% { border-color: #ef4444; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
          50% { border-color: #7f1d1d; box-shadow: 0 0 40px rgba(239, 68, 68, 0.6); }
        }
        @keyframes bg-pulse-soft {
          0%, 100% { background-color: #ef4444; }
          50% { background-color: #b91c1c; }
        }
        .animate-border-flicker { animation: border-flicker 1.5s infinite ease-in-out; }
        .animate-bg-pulse-soft { animation: bg-pulse-soft 1.5s infinite ease-in-out; }
      `}</style>

      <div className="bg-white w-full max-w-md rounded-[3.5rem] overflow-visible shadow-2xl border-[6px] relative animate-in fade-in zoom-in duration-300 animate-border-flicker">
        
        <button onClick={cerrarModal} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-20">
          <X size={28} strokeWidth={3} />
        </button>

        <div className="py-12 flex justify-center relative overflow-visible animate-bg-pulse-soft rounded-t-[2.8rem]">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          
          <div className="absolute -bottom-10 bg-white p-5 rounded-[1.8rem] shadow-2xl border-4 border-white z-50">
            {mensaje.sub.includes("MAÑANA") 
              ? <Calendar size={45} className="text-[#ef4444]" /> 
              : <Clock size={45} className="text-[#ef4444] animate-pulse" />
            }
          </div>
          <ShieldAlert size={140} className="text-white/10 absolute -left-8 -top-8 rotate-12" />
          <Lock size={140} className="text-white/10 absolute -right-8 -top-8 -rotate-12" />
        </div>

        <div className="p-10 pt-20 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
             <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
             <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] italic">Aviso de Estadio</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-[0.9] mb-6" dangerouslySetInnerHTML={{ __html: mensaje.titulo }} />
          
          <div className="w-16 h-2 bg-slate-100 mx-auto rounded-full mb-8"></div>
          <p className="text-slate-500 font-black italic text-sm leading-tight mb-8 uppercase px-4">{mensaje.cuerpo}</p>

          <div className="bg-red-50 p-5 rounded-[2rem] mb-10 border-2 border-red-100/50">
            <p className="text-[11px] text-[#ef4444] font-[1000] uppercase tracking-widest italic leading-none">{mensaje.sub}</p>
          </div>

          <button onClick={cerrarModal} className="w-full bg-[#1a2e05] text-white py-6 rounded-[2rem] font-[1000] uppercase italic tracking-widest hover:bg-emerald-600 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden">
            EXPLORAR MENÚ <Utensils size={20} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerHorario;