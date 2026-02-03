import { useLocation, Link } from "react-router-dom";
import { 
  HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon, 
  Zap, Trophy, ShieldCheck, ChevronRight, Activity
} from "lucide-react";

const StoreSidebar = ({ storeInfo }) => {
  const location = useLocation();  

  const sidebarLinks = [
    { name: "Dashboard", href: "/store", icon: HomeIcon, desc: "Vista General" },
    { name: "Nuevo Fichaje", href: "/store/add-product", icon: SquarePlusIcon, desc: "Añadir Menú" },
    { name: "Gestionar Plantilla", href: "/store/manage-product", icon: SquarePenIcon, desc: "Editar Items" },
    { name: "Central de Pedidos", href: "/store/orders", icon: LayoutListIcon, desc: "Comandas Real-time" },
  ];

  return (
    // CAMBIO: Fondo verde más sutil y oscuro (#0f1a04)
    <div className="flex h-full flex-col bg-[#0f1a04] border-r border-white/5 sm:min-w-[260px] relative overflow-hidden">
      
      {/* Glow sutil en la esquina superior */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500 rounded-full blur-[100px] opacity-[0.05]"></div>

      {/* HEADER: WINGOOL CENTRAL */}
      <div className="flex flex-col items-center py-10 relative z-10 border-b border-white/5 mx-6">
        <div className="relative mb-4">
            <div className="absolute -inset-2 bg-emerald-500 rounded-full blur-xl opacity-10"></div>
            <div className="relative bg-white/5 p-4 rounded-[2rem] border border-white/10 shadow-2xl">
                <ShieldCheck className="text-emerald-500" size={28} strokeWidth={2.5} />
            </div>
        </div>
        
        <p className="text-white font-[1000] uppercase italic tracking-[0.2em] text-[10px] text-center leading-tight">
          {storeInfo?.name || "Wingool Central"}
        </p>
        <span className="text-[7px] font-black text-emerald-500/60 uppercase tracking-widest italic mt-1">Sede Tulancingo</span>
      </div>

      {/* LINKS */}
      <div className="mt-8 space-y-1.5 px-4 relative z-10">
        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 px-4">Estrategia</p>
        
        {sidebarLinks.map((link, index) => {
          const isActive = location.pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={index}
              to={link.href}
              className={`group relative flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${
                isActive 
                ? "bg-emerald-500 text-[#0f1a04] shadow-lg shadow-emerald-500/20" 
                : "text-white/40 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                <div>
                    <p className={`text-[10px] font-[1000] uppercase italic tracking-wider leading-none ${isActive ? "text-[#0f1a04]" : "text-white"}`}>
                        {link.name}
                    </p>
                </div>
              </div>
              {isActive && <ChevronRight size={14} strokeWidth={3} className="text-[#0f1a04]" />}
            </Link>
          );
        })}
      </div>

      {/* FOOTER: STATUS */}
      <div className="mt-auto p-6">
        <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5 backdrop-blur-sm flex items-center gap-3">
            <div className="bg-[#1a2e05] p-2 rounded-xl border border-white/5">
                <Zap size={14} className="text-emerald-500" fill="currentColor" />
            </div>
            <div className="flex flex-col">
                <span className="text-[7px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Status</span>
                <span className="text-[9px] font-[1000] text-emerald-500 uppercase italic">RED WINGOOL OK</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSidebar;