import React from "react";
import { Star, Flame } from "lucide-react";

const services = [
  "Alitas Brutales",
  "Cervezas Heladas",
  "Burgers MVP",
  "Bebidas Premium",
  "Deportes en Vivo",
  "Ambiente Familiar",
  "Futbol En Pantalla",
  "NBA Nights",
  "F1 Racing",
  "Mojitos Mix",
  "HotDogs Pro",
  "Norteñitas Top",
];

const CategoriesMarquee = () => {
  return (
    <div className="mx-4 sm:mx-12 mt-8 mb-16">
      <div className="max-w-7xl mx-auto relative group">
        
        {/* CONTENEDOR PRINCIPAL: NEGRO CARBÓN CON BORDE ESMERALDA */}
        <div className="relative overflow-hidden bg-[#1a2e05] border-y-2 border-emerald-500/30 rounded-3xl shadow-[0_20px_50px_rgba(26,46,5,0.4)]">
          
          {/* LUZ DE ACENTO SUPERIOR */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>

          <div className="flex py-6 items-center">
            
            {/* TRACK 1 */}
            <div className="flex whitespace-nowrap animate-marquee group-hover:pause-marquee">
              {services.map((item, index) => (
                <div key={index} className="flex items-center px-6 sm:px-12">
                  <span className="text-white font-black text-[11px] sm:text-sm uppercase tracking-[0.25em] italic flex items-center gap-4">
                    {/* ICONO DE ESTRELLA ANTES DE CADA ITEM */}
                    <Star size={12} className="text-emerald-500" fill="currentColor" />
                    {item}
                    {/* SEPARADOR WINGOOL */}
                    <div className="ml-8 flex items-center gap-2">
                        <div className="h-1 w-8 bg-emerald-500/20 rounded-full"></div>
                        <Flame size={14} className="text-emerald-500/40" />
                        <div className="h-1 w-8 bg-emerald-500/20 rounded-full"></div>
                    </div>
                  </span>
                </div>
              ))}
            </div>

            {/* TRACK 2 (LOOP) */}
            <div className="flex whitespace-nowrap animate-marquee group-hover:pause-marquee" aria-hidden="true">
              {services.map((item, index) => (
                <div key={index} className="flex items-center px-6 sm:px-12">
                  <span className="text-white font-black text-[11px] sm:text-sm uppercase tracking-[0.25em] italic flex items-center gap-4">
                    <Star size={12} className="text-emerald-500" fill="currentColor" />
                    {item}
                    <div className="ml-8 flex items-center gap-2">
                        <div className="h-1 w-8 bg-emerald-500/20 rounded-full"></div>
                        <Flame size={14} className="text-emerald-500/40" />
                        <div className="h-1 w-8 bg-emerald-500/20 rounded-full"></div>
                    </div>
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* EFECTO DE DESENFOQUE EN LOS BORDES (FADE) */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#1a2e05] to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#1a2e05] to-transparent z-10"></div>
        </div>

        {/* ETIQUETA FLOTANTE "LIVE" */}
        <div className="absolute -top-3 -left-2 bg-emerald-500 text-[#1a2e05] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-lg z-20 animate-bounce">
            Live Now
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        .pause-marquee {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default CategoriesMarquee;