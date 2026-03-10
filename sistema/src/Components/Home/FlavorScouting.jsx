import React, { useState, useMemo, useEffect } from 'react';
import { Flame, Activity, Radiation, Zap, ShieldAlert, Crosshair, ThermometerSnowflake } from 'lucide-react';

const FlavorScouting = () => {
  const [activeSabor, setActiveSabor] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  const sabores = [
    { nombre: 'LEMON GOAT', flamas: 1, picor: 'Bajo', desc: 'Cítrico refrescante.' },
    { nombre: 'SLAM DUNK MUSTARD', flamas: 1, picor: 'Bajo', desc: 'Miel y mostaza dulce.' },
    { nombre: 'HOME RUN BBQ', flamas: 2, picor: 'Medio-Bajo', desc: 'Ahumado clásico.' },
    { nombre: 'FINTA PICANTE', flamas: 3, picor: 'Medio-Alto', desc: 'Ataque cítrico y calor.' },
    { nombre: 'GOOL DE ORO', flamas: 3, picor: 'Medio-Alto', desc: 'Fuego audaz.' },
    { nombre: 'BUFFALO BLITZ', flamas: 4, picor: 'Alto', desc: 'Picante directo.' },
    { nombre: 'KNOCKOUT HABANERO', flamas: 5, picor: 'FUEGO', desc: 'Nuestra salsa más letal.' },
  ];

  const current = sabores[activeSabor];
  const isMaxHeat = current.flamas === 5;
  const isHighHeat = current.flamas >= 4;

  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 400);
    return () => clearTimeout(timer);
  }, [activeSabor]);

  const theme = useMemo(() => {
    const f = current.flamas;
    if (f >= 5) return { color: '#ff4d4d', bg: 'bg-red-600', text: 'text-red-500', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]', circle: 'border-red-500/50' };
    if (f === 4) return { color: '#f97316', bg: 'bg-orange-600', text: 'text-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.3)]', circle: 'border-orange-500/40' };
    return { color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-500', glow: 'shadow-[0_0_10px_rgba(16,185,129,0.1)]', circle: 'border-emerald-500/20' };
  }, [activeSabor]);

  return (
    /* ✅ FONDO BLANCO PURO PARA UNIFICAR */
    <section className="w-full flex items-center justify-center bg-white font-sans p-6 md:p-8 select-none overflow-hidden relative">
      
      <style>{`
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(1000%); } }
        .animate-scan { animation: scanline 3s linear infinite; }
        @keyframes vibrate { 0% { transform: translate(0); } 25% { transform: translate(-1px, 1px); } 50% { transform: translate(1px, -1px); } 75% { transform: translate(-1px, -1px); } 100% { transform: translate(0); } }
        .animate-vibrate { animation: vibrate 0.1s infinite; }
        @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.5; } 100% { transform: scale(1.3); opacity: 0; } }
        .animate-ring { animation: pulse-ring 2s cubic-bezier(0.21, 0.61, 0.35, 1) infinite; }
      `}</style>

      {/* ✅ TAMAÑO ORIGINAL (max-w-5xl) Y ESTILO LIMPIO */}
      <div className={`w-full max-w-5xl bg-white rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-xl relative overflow-hidden transition-all duration-700 ${isMaxHeat ? 'ring-2 ring-red-500/10' : ''}`}>
        
        <div className="absolute inset-0 bg-white/[0.01] animate-scan pointer-events-none h-4 w-full z-20"></div>

        {/* HEADER COMPACTO */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-emerald-600 font-black text-[9px] uppercase tracking-[0.3em] italic">
              <Activity size={14} className="animate-pulse" /> TERMOMETRO DE SABORES
            </div>
            <h2 className="text-3xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
              NUESTRAS <span className="text-emerald-500"> SALSAS</span>
            </h2>
          </div>
          
          <div className={`mt-3 md:mt-0 px-4 py-1.5 rounded-xl border transition-all duration-500 flex items-center gap-2 bg-white ${isMaxHeat ? 'border-red-500 shadow-red-100 shadow-lg' : 'border-slate-100'}`}>
             <div className={`size-2 rounded-full ${isScanning ? 'bg-blue-500 animate-ping' : theme.bg}`}></div>
             <span className={`text-[10px] font-black uppercase tracking-widest italic ${isMaxHeat ? 'text-red-600' : 'text-slate-500'}`}>
               {isScanning ? 'SCANNING...' : isMaxHeat ? 'CRITICAL' : 'STABLE'}
             </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* SELECTOR ORIGINAL */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            {sabores.map((sabor, index) => (
              <button
                key={index}
                onClick={() => setActiveSabor(index)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 border-2 font-sans relative overflow-hidden ${
                  activeSabor === index 
                  ? 'bg-[#1a2e05] border-[#1a2e05] text-white shadow-lg translate-x-2' 
                  : 'bg-white border-transparent text-slate-400 hover:border-emerald-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-black italic ${activeSabor === index ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="text-left leading-tight">
                    <p className="font-[1000] uppercase italic text-xs md:text-sm tracking-tight">{sabor.nombre}</p>
                    {activeSabor === index && <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-tighter mt-0.5">{sabor.desc}</p>}
                  </div>
                </div>
                <div className="flex gap-0.5">
                   {[...Array(5)].map((_, i) => (
                      <Flame 
                        key={i} 
                        size={13} 
                        fill={i < sabor.flamas ? (activeSabor === index ? "#10b981" : "#cbd5e1") : "none"} 
                        className={i < sabor.flamas ? (activeSabor === index ? 'text-emerald-500' : 'text-slate-300') : 'text-slate-100'} 
                      />
                   ))}
                </div>
              </button>
            ))}
          </div>

          {/* TERMÓMETRO ORIGINAL REDIMENSIONADO */}
          <div className="lg:col-span-8 flex flex-row items-center justify-center gap-8 md:gap-16 py-4 relative">
            
            <div className={`absolute inset-0 rounded-full blur-[80px] transition-all duration-1000 opacity-5 ${theme.bg}`}></div>

            <div className="flex items-center gap-6 md:gap-10 relative">
              
              {/* Escala */}
              <div className="flex flex-col justify-between h-[300px] md:h-[45vh] py-6 text-[9px] font-black text-slate-900 italic text-right tracking-widest leading-none opacity-40">
                <span className="flex items-center gap-2"><Zap size={10}/> MAX</span>
                <span>80%</span>
                <span>60%</span>
                <span>40%</span>
                <span>20%</span>
                <span>MIN</span>
              </div>

              {/* Instrumento */}
              <div className="relative flex flex-col items-center">
                <div className={`h-[280px] md:h-[40vh] w-14 md:w-20 bg-white rounded-t-full p-2 md:p-3 relative border-[6px] md:border-[8px] border-white shadow-xl overflow-hidden z-10 ${isMaxHeat ? 'animate-vibrate' : ''}`}>
                    <div className="absolute bottom-0 inset-x-1 flex flex-col justify-end h-full">
                        <div 
                          className={`w-full transition-all duration-700 relative ${theme.bg} ${theme.glow}`}
                          style={{ height: `${(current.flamas / 5) * 100}%` }}
                        >
                            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white/30 to-transparent blur-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Bulbo Base */}
                <div className="relative -mt-8 md:-mt-10 z-20">
                    {isHighHeat && <div className={`absolute inset-0 rounded-full border-2 animate-ring ${theme.circle}`}></div>}
                    
                    <div className={`size-24 md:size-32 rounded-full border-[8px] md:border-[10px] border-white shadow-xl transition-all duration-700 flex items-center justify-center ${theme.bg} ${theme.glow} ${isMaxHeat ? 'animate-vibrate scale-105' : ''}`}>
                        {isMaxHeat ? (
                          <Radiation size={40} className="text-white animate-spin" style={{ animationDuration: '4s' }} />
                        ) : isHighHeat ? (
                          <ShieldAlert size={40} className="text-white animate-pulse" />
                        ) : (
                          <Flame size={40} fill="white" className="text-white" />
                        )}
                    </div>
                </div>
              </div>

              {/* Lectura Digital */}
              <div className="flex flex-col items-start min-w-[90px] md:min-w-[200px] z-10">
                  <div className="flex flex-col mb-3">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] italic leading-none mb-1">PICANTE</span>
                    <div className="flex items-baseline leading-none">
                        <p className={`text-5xl md:text-8xl font-[1000] italic transition-colors duration-700 ${theme.text}`}>
                            {current.flamas * 20}
                        </p>
                        <span className={`text-xl md:text-3xl font-black italic ${theme.text} opacity-30 ml-1`}>%</span>
                    </div>
                </div>
                
                <div className={`px-4 py-2 rounded-xl border bg-white shadow-md transition-all duration-500 border-slate-50 ${isMaxHeat ? 'translate-x-2' : ''}`}>
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1 italic">NIVEL</p>
                  <p className={`text-sm md:text-xl font-[1000] uppercase italic leading-none ${theme.text}`}>
                    {current.picor}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* Footer Wingool */}
        <div className="mt-8 pt-6 border-t border-slate-50 text-center opacity-20">
           <p className="text-[8px] font-black text-[#1a2e05] uppercase tracking-[0.5em] italic">Wingool Laboratory Division</p>
        </div>
      </div>
    </section>
  );
};

export default FlavorScouting;