import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Flame, Star, Trophy, Beer, Zap, Utensils, Users, GlassWater } from "lucide-react";

const WeeklyPromos = () => {
  const promos = [
    { 
      dia: "MARTES", 
      titulo: "ALITAS A $1 PESO", 
      desc: "EN TU 2DA ORDEN DE 8 O 16 PZAS", 
      icon: <Flame />, 
      color: "text-[#49B981]" 
    },
    { 
      dia: "MIÉRCOLES", 
      titulo: "2X1 NACIONALES", 
      desc: "EN TODAS LAS CERVEZAS NACIONALES", 
      icon: <Beer />, 
      color: "text-amber-400" 
    },
    { 
      dia: "JUEVES", 
      titulo: "ALL YOU CAN EAT", 
      desc: "ALITAS ILIMITADAS POR SOLO $170", 
      icon: <Utensils />, 
      color: "text-[#49B981]" 
    },
    { 
      dia: "VIERNES", 
      titulo: "MOJITOS & MARGARITAS", 
      desc: "COCTELERÍA SELECCIONADA A SOLO $40", 
      icon: <GlassWater />, 
      color: "text-pink-400" 
    },
    { 
      dia: "SÁBADO", 
      titulo: "3X2 EN EL MENÚ", 
      desc: "HAMBURGUESAS, ALITAS Y BONELESS", 
      icon: <Zap />, 
      color: "text-blue-400" 
    },
    { 
      dia: "DOMINGO", 
      titulo: "DOMINGO ILIMITADO", 
      desc: "ALITAS Y BONELESS POR SOLO $189", 
      icon: <Users />, 
      color: "text-[#49B981]" 
    },
  ];

  const infinitePromos = [...promos, ...promos];

  return (
    /* AGREGAMOS EL ID AQUÍ PARA QUE EL HERO LO ENCUENTRE */
    <div id="WeeklyPromos" className="max-w-7xl mx-auto px-4 sm:px-8 my-12 scroll-mt-24">
      <div className="bg-[#1A2E05] py-12 rounded-[3rem] border-2 border-[#49B981]/20 overflow-hidden relative shadow-xl">
        
        <style>
          {`
            @keyframes marquee-wingool {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .animate-wingool-scroll {
              display: flex;
              width: max-content;
              animation: marquee-wingool 40s linear infinite;
            }
          `}
        </style>

        <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
          <Star size={250} className="text-[#49B981] stroke-[1px]" />
        </div>

        <div className="max-w-5xl mx-auto px-6 mb-8 relative z-10 text-center">
          <h2 className="text-4xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
            CALENDARIO <span className="text-[#49B981]">DE TEMPORADA</span>
          </h2>
          <p className="text-white/50 font-black uppercase italic tracking-[0.3em] text-[9px] sm:text-[10px] mt-4">
            PROMOCIONES VÁLIDAS DE MARTES A DOMINGO
          </p>
        </div>

        <div className="relative flex overflow-hidden py-2">
          <div className="animate-wingool-scroll">
            {infinitePromos.map((promo, index) => (
              <div 
                key={index} 
                className="mx-3 w-[250px] sm:w-[320px] bg-black/30 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] relative group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="bg-[#49B981] text-[#1A2E05] font-[1000] text-[9px] px-4 py-1 rounded-full italic tracking-tighter">
                    {promo.dia}
                  </div>
                  <div className={`${promo.color} drop-shadow-[0_0_8px_currentColor]`}>
                    {React.cloneElement(promo.icon, { size: 24, strokeWidth: 3 })}
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black text-white uppercase italic leading-none tracking-tighter">
                    {promo.dia === "DOMINGO" ? "DOMINGO ILIMITADO" : promo.titulo}
                  </h3>
                  <p className="text-[#49B981] font-black uppercase italic text-[9px] tracking-tight pt-3 border-t border-white/10 mt-3 h-10">
                    {promo.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10 relative z-10">
          <a 
            href="tel:+521234567890" 
            className="inline-block bg-[#49B981] text-[#1A2E05] font-black uppercase italic px-10 py-3 rounded-2xl hover:bg-white transition-all duration-300 shadow-lg active:scale-95 tracking-widest text-xs cursor-pointer border-none no-underline"
          >
            REALIZAR RESERVACIÓN
          </a>
        </div>
      </div>
    </div>
  );
};

export default WeeklyPromos;