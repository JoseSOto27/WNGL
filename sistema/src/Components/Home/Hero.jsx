import { ArrowRightIcon, ChevronRightIcon, Sparkles, Trophy, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CategoriesMarquee from "../Common/CategoriesMarquee";

const Hero = () => {
  const navigate = useNavigate();

  // Función táctica para el scroll a promociones
  const scrollToPromos = (e) => {
    e.preventDefault();
    const section = document.getElementById('WeeklyPromos');
    
    if (section) {
      // Si la sección existe en esta página, desliza suavemente
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Si no existe, navega a la tienda
      navigate("/shop");
    }
  };

  return (
    <div className="mx-4 sm:mx-10 overflow-hidden pt-4">
      <div className="flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto mt-8 mb-12">

        {/* --- TARJETA PRINCIPAL (ESTILO MVP) --- */}
        <div
          className="relative flex-1 flex flex-col justify-center
          bg-[#1a2e05] rounded-[3.5rem] min-h-[500px] xl:min-h-[600px] 
          group overflow-hidden shadow-[0_35px_60px_-15px_rgba(26,46,5,0.3)]"
        >
          {/* Luces de Estadio (Degradados) */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[140px] opacity-20 -mr-40 -mt-40 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-emerald-600 rounded-full blur-[100px] opacity-10 -ml-20 -mb-20" />

          <div className="p-8 sm:p-20 relative z-10">
            {/* Badge Wingool */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl text-emerald-400 px-5 py-2 rounded-2xl text-[10px] font-black border border-white/10 mb-8 shadow-xl">
              <Trophy size={14} fill="currentColor" />
              <span className="uppercase tracking-[0.2em]">Sede Oficial del Sabor</span>
            </div>

            {/* Título Masivo */}
            <h2 className="text-5xl sm:text-7xl font-black leading-[0.9] max-w-2xl text-white uppercase italic tracking-tighter">
              Alitas <span className="text-emerald-500">Brutales</span> <br /> 
              Y Pasión <span className="text-emerald-500">Total.</span>
            </h2>

            <p className="text-lg sm:text-xl text-emerald-100/60 mt-8 max-w-md font-bold leading-tight uppercase italic tracking-tight">
              Vive cada partido con el sabor que solo Wingool Company Tulancingo te ofrece. ⚽️🔥
            </p>

            {/* Botón MVP */}
            <button 
              onClick={() => navigate("/shop")} 
              className="mt-12 bg-emerald-500 hover:bg-white text-[#1a2e05] font-black py-5 px-12 rounded-[2rem] transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/20 flex items-center gap-4 uppercase italic tracking-widest text-sm"
            >
              ¡ENTRAR A JUGAR!
              <ArrowRightIcon size={22} strokeWidth={3} />
            </button>
          </div>

          {/* Imagen de Hero con Glow */}
          <div className="absolute bottom-0 right-0 w-[65%] sm:w-[55%] xl:w-[60%] pointer-events-none">
             <div className="absolute inset-0 bg-emerald-500/20 blur-[100px] rounded-full"></div>
             <img
                className="relative z-10 drop-shadow-[-30px_30px_50px_rgba(0,0,0,0.8)] 
                group-hover:scale-110 group-hover:-rotate-2 transition-all duration-700 ease-out"
                src="/images/hero.png" 
                alt="Wingool Hero"
             />
          </div>
        </div>

        {/* --- COLUMNA DERECHA (SPECIALS) --- */}
        <div className="flex flex-col md:flex-row xl:flex-col gap-6 w-full xl:max-w-[420px]">

          {/* TARJETA 1: PROMOS */}
          <div
            className="flex-1 relative overflow-hidden bg-white
            rounded-[3rem] p-10 group border border-slate-100 shadow-xl hover:shadow-2xl transition-all"
          >
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest mb-3">
                    <Star size={14} fill="currentColor" /> Promociones
                </div>
                <p className="text-4xl font-black text-[#1a2e05] leading-none uppercase italic tracking-tighter">
                  365 Días <br /> <span className="text-emerald-500">Sin Pausa.</span>
                </p>
                <p className="text-slate-400 mt-4 text-xs font-bold uppercase tracking-tight max-w-[180px]">
                  Promos brutales todos los días del año.
                </p>
              </div>
              
              <button 
                onClick={scrollToPromos} 
                className="flex items-center gap-2 text-[#1a2e05] font-black text-xs mt-8 group-hover:gap-4 transition-all uppercase italic"
              >
                EXPLORAR PROMOS <ArrowRightIcon size={16} />
              </button>
            </div>

            <img
              className="absolute -right-8 -bottom-8 w-44 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 opacity-90 drop-shadow-2xl"
              src="/images/vehiculo.png"
              alt="Promo"
            />
          </div>

          {/* TARJETA 2: WALLET/PUNTOS */}
          <div
            className="flex-1 relative overflow-hidden bg-emerald-500
            rounded-[3rem] p-10 group shadow-xl hover:shadow-emerald-500/30 transition-all"
          >
            <div className="relative z-10">
              <span className="text-[#1a2e05]/50 font-black text-[10px] uppercase tracking-widest">Wingool Wallet</span>
              <p className="text-4xl font-black text-[#1a2e05] mt-2 leading-none uppercase italic tracking-tighter">
                Gana <br /> <span className="text-white">Puntos.</span>
              </p>
              <p className="text-[#1a2e05]/70 mt-4 text-xs font-bold uppercase tracking-tight max-w-[180px]">
                Recibe el 5% de cashback en cada mordida.
              </p>
              
              {/* BOTÓN ACTUALIZADO PARA IR AL LOGIN */}
              <button 
                onClick={() => navigate("/admin")} 
                className="flex items-center gap-2 text-white bg-[#1a2e05] px-6 py-3 rounded-2xl font-black text-[10px] uppercase italic mt-8 hover:scale-105 transition-all shadow-lg"
              >
                REGISTRARME <ChevronRightIcon size={14} />
              </button>
            </div>

            <img
              className="absolute -right-10 -bottom-10 w-52 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 drop-shadow-2xl"
              src="/images/hero2.png"
              alt="Puntos"
            />
          </div>

        </div>
      </div>

      <CategoriesMarquee />
    </div>
  );
};

export default Hero;