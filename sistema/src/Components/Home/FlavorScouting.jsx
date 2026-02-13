import React, { useState, useMemo } from 'react';
import { Flame, Zap, Target, ShieldAlert, Thermometer } from 'lucide-react';

const FlavorScouting = () => {
  const [activeSabor, setActiveSabor] = useState(0);

  const sabores = [
    { nombre: 'LEMON GOAT', flamas: 1, picor: 'Bajo', desc: 'Cítrico refrescante, ideal para los que apenas inician el partido.' },
    { nombre: 'SLAM DUNK MUSTARD', flamas: 1, picor: 'Bajo', desc: 'Miel y mostaza con un toque dulce ganador.' },
    { nombre: 'HOME RUN BBQ', flamas: 2, picor: 'Medio-Bajo', desc: 'El clásico ahumado que nunca falla en el marcador.' },
    { nombre: 'FINTA PICANTE', flamas: 3, picor: 'Medio-Alto', desc: 'Un sabor que te engaña y luego te da el golpe de calor.' },
    { nombre: 'GOOL DE ORO', flamas: 3, picor: 'Medio-Alto', desc: 'Brillante, audaz y con el picante justo para celebrar.' },
    { nombre: 'BUFFALO BLITZ', flamas: 4, picor: 'Alto', desc: 'Ataque directo a las papilas. Solo para profesionales.' },
    { nombre: 'KNOCKOUT HABANERO', flamas: 5, picor: 'FUEGO', desc: 'El jefe final. Si pides esta, ya ganaste el respeto de la liga.' },
  ];

  // Lógica de colores dinámica con parpadeo estratégico
  const heatColor = useMemo(() => {
    const f = sabores[activeSabor].flamas;
    if (f >= 4) return { 
        text: 'text-red-500 animate-pulse', 
        bg: 'bg-red-500', 
        glow: 'bg-red-600/30 animate-blink-glow', 
        border: 'border-red-600 shadow-[0_0_25px_rgba(220,38,38,0.2)]' 
    };
    if (f === 3) return { 
        text: 'text-orange-500', 
        bg: 'bg-orange-500', 
        glow: 'bg-orange-500/20 animate-blink-glow', 
        border: 'border-orange-500' 
    };
    return { 
        text: 'text-emerald-500', 
        bg: 'bg-emerald-500', 
        glow: 'bg-emerald-500/20', 
        border: 'border-emerald-500' 
    };
  }, [activeSabor]);

  return (
    <section className="py-12 px-4 md:px-10 bg-white">
      {/* TARJETA CONTENEDORA PRINCIPAL */}
      <div className="max-w-6xl mx-auto bg-slate-50 rounded-[4rem] p-8 md:p-14 border border-slate-100 shadow-xl relative overflow-hidden">
        
        {/* ENCABEZADO */}
        <div className="mb-10 flex flex-col items-center text-center">
            <span className="flex items-center gap-2 text-emerald-600 font-[1000] text-[9px] uppercase tracking-[0.4em] mb-2 italic">
               <Thermometer size={12} /> SCOUTING REPORT
            </span>
            <h2 className="text-3xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
                INTENSIDAD DE <span className="text-emerald-500">SALSAS</span>
            </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-center">
          
          {/* SELECTOR TÁCTICO */}
          <div className="w-full lg:w-[45%] flex flex-col gap-2 relative z-10">
            {sabores.map((sabor, index) => (
              <button
                key={index}
                onClick={() => setActiveSabor(index)}
                className={`flex items-center justify-between p-4 md:p-5 rounded-[1.8rem] transition-all duration-500 relative overflow-hidden ${
                  activeSabor === index 
                  ? 'bg-[#1a2e05] text-white shadow-lg scale-[1.03] z-10' 
                  : 'bg-white text-slate-400 hover:bg-white hover:text-emerald-600 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                    <span className={`text-[10px] font-black italic ${activeSabor === index ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-[1000] uppercase italic text-xs md:text-sm tracking-tight">{sabor.nombre}</span>
                </div>
                <div className="flex gap-0.5 relative z-10">
                   {[...Array(5)].map((_, i) => (
                      <Flame 
                        key={i} 
                        size={12} 
                        fill={i < sabor.flamas ? "currentColor" : "none"} 
                        className={`${i < sabor.flamas ? (activeSabor === index ? 'text-orange-500' : 'text-emerald-500') : 'text-slate-100'}`} 
                      />
                   ))}
                </div>
              </button>
            ))}
          </div>

          {/* VISUALIZADOR DE TARJETA NEGRA */}
          <div className="w-full lg:w-[55%] flex justify-center relative">
              {/* GLOW DINÁMICO CON PARPADEO ANIMADO */}
              <div className={`absolute inset-0 rounded-full blur-[100px] transition-all duration-1000 ${heatColor.glow}`}></div>
              
              <div className={`relative w-full max-w-[340px] aspect-[3/4] bg-[#0f1a04] rounded-[3rem] p-10 border-b-[15px] shadow-2xl flex flex-col items-center text-center justify-between transition-all duration-700 ${heatColor.border} ${sabores[activeSabor].flamas >= 4 ? 'animate-vibrate' : ''}`}>
                
                <Zap size={180} className="absolute -top-10 -right-10 text-white/5 rotate-12 animate-pulse" />

                <div className="relative z-10">
                    {/* BOTÓN CENTRAL DINÁMICO */}
                    <div className={`size-20 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-2xl transition-all duration-700 ${heatColor.bg} ${sabores[activeSabor].flamas >= 4 ? 'scale-110 shadow-red-500/50' : ''}`}>
                        <Flame size={40} fill="currentColor" className="text-white animate-flame-wiggle" />
                    </div>
                    
                    <span className={`text-[9px] font-black uppercase tracking-[0.4em] italic mb-2 block transition-colors ${heatColor.text}`}>
                        ANÁLISIS MVP
                    </span>
                    <h3 className="text-3xl font-[1000] text-white uppercase italic leading-none tracking-tighter mb-4">
                        {sabores[activeSabor].nombre}
                    </h3>
                    <p className="text-white/50 text-[10px] font-bold italic leading-relaxed uppercase tracking-widest px-2">
                        "{sabores[activeSabor].desc}"
                    </p>
                </div>

                <div className="relative z-10 w-full pt-6 border-t border-white/10 mt-6">
                    <div className="flex justify-between items-center mb-3 px-2">
                        <span className="text-[8px] font-black text-white/30 uppercase italic">Power Level</span>
                        <span className={`text-xs font-[1000] italic uppercase transition-colors ${heatColor.text}`}>
                            {sabores[activeSabor].picor}
                        </span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden relative p-0.5 border border-white/10">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${heatColor.bg} ${sabores[activeSabor].flamas >= 4 ? 'shadow-[0_0_15px_rgba(239,68,68,0.6)]' : ''}`}
                          style={{ width: `${(sabores[activeSabor].flamas / 5) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-laser"></div>
                        </div>
                    </div>
                </div>

                {sabores[activeSabor].flamas >= 4 && (
                    <div className="absolute top-6 right-6 flex items-center gap-1 text-red-500 animate-pulse">
                        <ShieldAlert size={14} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Extreme</span>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes laser { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .animate-laser { animation: laser 2s infinite linear; }
        
        @keyframes flame-wiggle { 0%, 100% { transform: scale(1) rotate(-5deg); } 50% { transform: scale(1.1) rotate(5deg); } }
        .animate-flame-wiggle { animation: flame-wiggle 0.6s infinite ease-in-out; }
        
        @keyframes vibrate { 0%, 100% { transform: translate(0); } 25% { transform: translate(-1px, 1px); } 50% { transform: translate(1px, -1px); } 75% { transform: translate(-1px, -1px); } }
        .animate-vibrate { animation: vibrate 0.3s infinite linear; }
        
        @keyframes blink-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        .animate-blink-glow { animation: blink-glow 2s infinite ease-in-out; }
      `}</style>
    </section>
  );
};

export default FlavorScouting;