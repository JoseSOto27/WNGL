import { Link } from "react-router-dom";
import { Phone, MapPin, MessageCircle, Instagram, Facebook, Star, ArrowRight } from "lucide-react";
import logo from "../../assets/images/logo_light.webp";

const Footer = () => {
  const linkSections = [
    {
      title: "NAVEGACIÓN",
      links: [
        { text: "Inicio", path: "/" },
        { text: "Menú", path: "/shop" },
        { text: "Mi Cuenta", path: "/mi-cuenta" },
        { text: "Contacto", path: "/contact" },
      ],
    },
  ];

  return (
    <>
      <footer className="mt-32 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* BANNER PROMOCIONAL PRE-FOOTER - VERSIÓN ESTILIZADA */}
          <div className="relative -mt-14 bg-[#1a2e05] rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden shadow-[0_30px_60px_-12px_rgba(26,46,5,0.3)] border border-white/5">
            {/* Elementos Decorativos */}
            <Star className="absolute -right-6 -top-6 w-32 h-32 text-emerald-500 opacity-10 rotate-12" />
            <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent hidden md:block"></div>
            
            <div className="relative z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.3em] mb-3 border border-emerald-500/20 italic">
                MVP Rewards
              </div>
              <h2 className="text-2xl md:text-4xl font-[1000] text-white italic uppercase tracking-tighter leading-none">
                ¿LISTO PARA EL <span className="text-emerald-500">KICKOFF?</span>
              </h2>
              <p className="text-emerald-100/40 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] mt-2">
                Acumula puntos en tu Wingool Wallet ahora
              </p>
            </div>

            <Link 
              to="/shop" 
              className="relative z-10 bg-emerald-500 text-[#1a2e05] px-10 py-4 rounded-xl font-[1000] uppercase italic tracking-[0.1em] hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-xl flex items-center gap-2 group/btn text-xs"
            >
              ORDENAR AHORA
              <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pb-16">
            {/* BRANDING */}
            <div className="md:col-span-5 space-y-8">
              <div className="flex flex-col items-center md:items-start">
                <img
                  src={logo}
                  alt="Wingool Logo"
                  className="h-20 md:h-24 w-auto object-contain transition-transform hover:scale-105 duration-500"
                />
                <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed max-w-sm mt-6 text-center md:text-left italic">
                  <span className="text-[#1a2e05] font-[1000] uppercase not-italic">Wingool Company.</span> El SportBar definitivo donde la pasión y el sabor juegan en el mismo equipo. ⚽️🔥
                </p>
              </div>
              
              <div className="flex justify-center md:justify-start gap-3">
                <a href="https://www.instagram.com/wingoolcompanytulancingo/" className="group bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-400 hover:bg-[#1a2e05] hover:text-emerald-400 hover:border-[#1a2e05] transition-all duration-300">
                  <Instagram size={20} className="group-hover:rotate-12 transition-transform" />
                </a>
                <a href="https://www.facebook.com/profile.php?id=61576125955219" className="group bg-slate-50 border border-slate-100 p-4 rounded-2xl text-slate-400 hover:bg-[#1a2e05] hover:text-emerald-400 hover:border-[#1a2e05] transition-all duration-300">
                  <Facebook size={20} className="group-hover:-rotate-12 transition-transform" />
                </a>
              </div>
            </div>

            {/* LINKS - REFINADOS */}
            <div className="md:col-span-3 text-center md:text-left">
              <h3 className="text-[#1a2e05] font-[1000] uppercase italic tracking-tighter mb-8 text-xl border-b-2 border-emerald-500 w-fit mx-auto md:mx-0 pb-1">
                Estrategia
              </h3>
              <ul className="space-y-5">
                {linkSections[0].links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="text-slate-400 font-black uppercase text-[11px] tracking-[0.2em] hover:text-emerald-500 transition-all flex items-center justify-center md:justify-start gap-3 group"
                    >
                      <span className="w-0 h-[2px] bg-emerald-500 group-hover:w-5 transition-all duration-300 rounded-full"></span>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONTACTO - CARDS SUTILES */}
            <div className="md:col-span-4 space-y-4">
              <h3 className="text-[#1a2e05] font-[1000] uppercase italic tracking-tighter mb-8 text-xl text-center md:text-left">
                Contacto Directo
              </h3>
              
              <a 
                href="https://wa.me/527751521896" 
                className="flex items-center gap-5 bg-white p-5 rounded-[2rem] border border-slate-100 group hover:border-emerald-500 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500"
              >
                <div className="bg-[#1a2e05] text-emerald-400 p-3 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-lg shadow-emerald-900/10">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">WhatsApp MVP</p>
                  <p className="text-base font-[1000] text-[#1a2e05] tracking-tight">+52 775 152 1896</p>
                </div>
              </a>
              
              <div className="flex items-center gap-5 bg-slate-50/50 p-5 rounded-[2rem] border border-transparent">
                <div className="bg-white text-slate-400 p-3 rounded-2xl shadow-sm border border-slate-100">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Sede Central</p>
                  <p className="text-sm font-[1000] text-[#1a2e05] uppercase italic tracking-tight">Tulancingo, Hidalgo</p>
                </div>
              </div>
            </div>
          </div>

          {/* COPYRIGHT REFINADO */}
          <div className="py-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] text-center italic">
              © 2026 <span className="text-[#1a2e05]">CodeClick</span> • WINGOOL COMPANY
            </p>
            <div className="flex gap-8">
                {["Términos", "Privacidad"].map((item) => (
                  <span key={item} className="text-[10px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-emerald-500 transition-colors relative group">
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-emerald-500 group-hover:w-full transition-all"></span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      </footer>

      {/* BOTÓN WHATSAPP FLOTANTE WINGOOL STYLE */}

    </>
  );
};

export default Footer;