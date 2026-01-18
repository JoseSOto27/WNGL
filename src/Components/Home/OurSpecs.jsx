import { Trophy, Leaf, Users, Star } from "lucide-react";

/* =========================
   DATA ACTUALIZADA (ESTILO WINGOOL)
========================= */
const ourSpecsData = [
  {
    title: "Sabor de Campeonato",
    description:
      "Nuestras alitas no son cualquier cosa. Usamos recetas de autor y salsas preparadas desde cero para que cada mordida sea un touchdown.",
    icon: Trophy,
    accent: "#10b981", 
  },
  {
    title: "Materia Prima MVP",
    description:
      "Seleccionamos solo los mejores cortes y proveedores locales. Calidad de grandes ligas para paladares que no aceptan menos.",
    icon: Leaf,
    accent: "#10b981",
  },
  {
    title: "La Mejor Afición",
    description:
      "En Wingool no eres un cliente, eres parte del equipo. Te hacemos sentir en la tribuna VIP con atención rápida y personalizada.",
    icon: Users,
    accent: "#10b981",
  },
];

const OurSpecs = () => {
  return (
    <div className="px-6 my-32 max-w-7xl mx-auto">
      {/* HEADER DEL COMPONENTE */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-4">
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full flex items-center gap-2">
               <Star size={12} fill="currentColor" /> El ADN de Wingool
            </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-[#1a2e05] uppercase italic tracking-tighter leading-none">
          ¿Por qué somos los <br /> <span className="text-emerald-600">dueños de la cancha?</span>
        </h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto mt-6 italic">
          No solo servimos comida, creamos la experiencia deportiva definitiva.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-20">
        {ourSpecsData.map((spec, index) => (
          <div
            key={index}
            /* SOLUCIÓN: Quitamos h-44 y usamos min-h para que no se corte */
            className="relative bg-white pt-16 pb-10 px-8 flex flex-col items-center text-center border border-slate-100 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group overflow-visible"
          >
            {/* ICONO - Ajustado para que no se corte */}
            <div
              className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#1a2e05] text-emerald-500 size-16 flex items-center justify-center rounded-2xl shadow-xl shadow-emerald-900/20 group-hover:rotate-6 transition-transform duration-300 z-10"
            >
              <spec.icon size={32} strokeWidth={2.5} />
            </div>

            {/* CONTENIDO */}
            <div className="relative z-0">
                <h3 className="text-[#1a2e05] font-black uppercase italic text-xl tracking-tighter mb-4">
                {spec.title}
                </h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed">
                {spec.description}
                </p>
            </div>

            {/* BARRA DECORATIVA */}
            <div className="mt-6 w-12 h-1.5 bg-emerald-500 rounded-full opacity-20 group-hover:opacity-100 group-hover:w-20 transition-all duration-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurSpecs;