import { useLocation, Link } from "react-router-dom";
import { 
  HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, 
  Zap, Trophy, ShieldCheck 
} from "lucide-react";

const StoreSidebar = ({ storeInfo }) => {
  const location = useLocation();  

  const sidebarLinks = [
    { name: "Dashboard", href: "/store", icon: HomeIcon },
    { name: "Nuevo Fichaje", href: "/store/add-product", icon: SquarePlusIcon },
    { name: "Gestionar Plantilla", href: "/store/manage-product", icon: SquarePenIcon },
    { name: "Central de Pedidos", href: "/store/orders", icon: LayoutListIcon },
  ];

  return (
    <div className="flex h-full flex-col bg-[#1a2e05] border-r border-white/5 sm:min-w-64 relative overflow-hidden">
      {/* Luces de Estadio (Glow sutil) */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500 rounded-full blur-[100px] opacity-10 -translate-x-10 -translate-y-10"></div>

      {/* ENCABEZADO: ESCUDO WINGOOL */}
      <div className="flex flex-col gap-2 justify-center items-center py-12 relative z-10 border-b border-white/5 mx-6">
        <div className="bg-white/5 p-4 rounded-3xl border border-white/10 shadow-2xl mb-2">
            <ShieldCheck className="text-emerald-500" size={32} />
        </div>
        <p className="text-white font-[1000] uppercase italic tracking-[0.2em] text-[10px] text-center leading-tight">
          {storeInfo?.name || "Wingool Company"}
        </p>
        <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Sede Tulancingo</span>
        </div>
      </div>

      {/* LINKS TÁCTICOS */}
      <div className="mt-10 space-y-2 px-4 relative z-10">
        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-6 px-4">Menu Principal</p>
        
        {sidebarLinks.map((link, index) => {
          const isActive = location.pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={index}
              to={link.href}
              className={`group relative flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                isActive 
                ? "bg-emerald-500 text-[#1a2e05] shadow-[0_10px_30px_rgba(16,185,129,0.2)]" 
                : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
              </div>
              
              <p className={`max-sm:hidden text-[11px] font-[1000] uppercase italic tracking-widest ${isActive ? "tracking-[0.1em]" : ""}`}>
                {link.name}
              </p>

              {/* Indicador de Activación Estilo Zap */}
              {isActive && (
                <div className="absolute -left-1 w-1.5 h-6 bg-white rounded-full shadow-[0_0_15px_white]"></div>
              )}
            </Link>
          );
        })}
      </div>

      {/* FOOTER: ESTADO DEL SISTEMA */}
      <div className="mt-auto p-8 border-t border-white/5">
        <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="bg-emerald-500/20 p-2 rounded-xl">
                <Zap size={16} className="text-emerald-500 animate-pulse" fill="currentColor" />
            </div>
            <div className="flex flex-col">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Estado</span>
                <span className="text-[9px] font-black text-emerald-500 uppercase italic">Sistema MVP OK</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSidebar;