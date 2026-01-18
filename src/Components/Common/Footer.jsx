import { Link } from "react-router-dom";
import { Phone, MapPin, MessageCircle, Instagram, Facebook, Star } from "lucide-react";
import logo from "../../assets/images/logo_light.webp";

const Footer = () => {
  const linkSections = [
    {
      title: "NAVEGACIÓN",
      links: [
        { text: "Inicio", path: "/" },
        { text: "Menú de Alitas", path: "/shop" },
        { text: "Mi Cuenta", path: "/mi-cuenta" },
        { text: "Contacto", path: "/contact" },
      ],
    },
  ];

  return (
    <>
      <footer className="mt-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* BANNER PROMOCIONAL PRE-FOOTER */}
          <div className="bg-[#1a2e05] rounded-[3rem] p-8 md:p-12 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-2xl">
            <Star className="absolute -left-10 -bottom-10 w-40 h-40 text-emerald-500 opacity-10 rotate-12" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                ¿LISTO PARA EL <span className="text-emerald-500">KICKOFF?</span>
              </h2>
              <p className="text-emerald-100/60 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
                Pide ahora y acumula puntos en tu Wingool Wallet
              </p>
            </div>
            <Link 
              to="/shop" 
              className="relative z-10 bg-emerald-500 text-[#1a2e05] px-10 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              ORDENAR AHORA
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-slate-100">
            {/* BRANDING */}
            <div className="md:col-span-5 space-y-6">
              <img
                src={logo}
                alt="Wingool Logo"
                className="h-20 w-auto object-contain hover:rotate-2 transition-transform"
              />
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                <span className="text-[#1a2e05] font-black italic uppercase">Wingool Company.</span> El SportBar definitivo. Alitas brutales, cervezas heladas y el mejor ambiente para vivir la pasión del deporte. ⚽️🔥
              </p>
              <div className="flex gap-4">
                <a href="#" className="bg-slate-100 p-3 rounded-2xl text-slate-600 hover:bg-emerald-500 hover:text-white transition-all"><Instagram size={20} /></a>
                <a href="#" className="bg-slate-100 p-3 rounded-2xl text-slate-600 hover:bg-emerald-500 hover:text-white transition-all"><Facebook size={20} /></a>
              </div>
            </div>

            {/* LINKS */}
            <div className="md:col-span-3">
              <h3 className="text-[#1a2e05] font-black uppercase italic tracking-tighter mb-6 text-lg">
                Empresa
              </h3>
              <ul className="space-y-4">
                {linkSections[0].links.map((link, i) => (
                  <li key={i}>
                    <Link
                      to={link.path}
                      className="text-slate-400 font-bold uppercase text-[11px] tracking-widest hover:text-emerald-600 transition-colors flex items-center gap-2 group"
                    >
                      <div className="w-0 h-[2px] bg-emerald-500 group-hover:w-4 transition-all"></div>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONTACTO */}
            <div className="md:col-span-4">
              <h3 className="text-[#1a2e05] font-black uppercase italic tracking-tighter mb-6 text-lg">
                Contacto Directo
              </h3>
              <div className="space-y-4">
                <a 
                  href="https://wa.me/527751521896" 
                  className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100 group hover:border-emerald-500 transition-all"
                >
                  <div className="bg-emerald-500 text-white p-2 rounded-xl group-hover:scale-110 transition-transform">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none">WhatsApp Central</p>
                    <p className="text-sm font-black text-[#1a2e05]">+52 775 152 1896</p>
                  </div>
                </a>
                
                <div className="flex items-center gap-4 p-4">
                  <div className="bg-slate-100 text-slate-500 p-2 rounded-xl">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Visítanos</p>
                    <p className="text-sm font-black text-[#1a2e05] uppercase italic">Tulancingo, Hidalgo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
              © 2026 CodeClick • WINGOOL COMPANY
            </p>
            <div className="flex gap-6">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-emerald-500">Términos</span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:text-emerald-500">Privacidad</span>
            </div>
          </div>
        </div>
      </footer>

      {/* BOTÓN WHATSAPP FLOTANTE WINGOOL STYLE */}
      <a
        href="https://wa.me/527751521896?text=Hola%20Wingool,%20quiero%20hacer%20un%20pedido"
        target="_blank"
        rel="noopener noreferrer"
        className="
          fixed bottom-8 right-8 z-[99]
          bg-[#1a2e05] text-white p-5 rounded-[2rem]
          shadow-2xl shadow-emerald-900/40
          transition-all duration-300
          hover:scale-110 active:scale-90
          border-2 border-emerald-500
          flex items-center gap-3 group
        "
        aria-label="WhatsApp Wingool"
      >
        <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <MessageCircle size={24} className="relative z-10" />
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-black uppercase italic text-xs tracking-widest">
            Hacer Pedido
        </span>
      </a>
    </>
  );
};

export default Footer;