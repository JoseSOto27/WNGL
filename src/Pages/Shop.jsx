import React, { useState, useMemo } from "react";
import { LayoutGrid, Utensils, Trophy, Soup, Sandwich, SearchX, Zap } from "lucide-react"; // Agregamos Sandwich
import { useSelector } from "react-redux";
import Loading from "../Components/Common/Loading";
import ProductCard from "../Components/Common/ProductCard";

function ContenidoTienda() {
  const [categoriaActiva, setCategoriaActiva] = useState("TODOS");

  const { list: productos = [], loading } = useSelector((state) => state.product || {});

  const productosFiltrados = useMemo(() => {
    if (categoriaActiva === "TODOS") return productos;

    return productos.filter((p) => {
      const catDB = (p.categoria || "").toString().toUpperCase().trim();
      const catBoton = categoriaActiva.toUpperCase().trim();
      return catDB === catBoton;
    });
  }, [productos, categoriaActiva]);

  if (loading) return <Loading text="CONECTANDO CON LA COCINA..." />;

  return (
    <div className="min-h-screen bg-white pb-32 pt-28 sm:pt-32 font-sans">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        <div className="mb-10">
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-2 italic">
            <Zap size={14} fill="currentColor" /> Selección Wingool
          </div>
          <h1 className="text-4xl sm:text-6xl font-[1000] text-[#1a2e05] uppercase italic leading-none tracking-tighter">
            NUESTRO <span className="text-emerald-500">MENÚ</span>
          </h1>
        </div>

        {/* BARRA DE BOTONES */}
        <div className="flex items-center gap-2 overflow-x-auto pb-8 mb-6 no-scrollbar">
          
          <button onClick={() => setCategoriaActiva("TODOS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "TODOS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <LayoutGrid size={14}/> TODO EL MENÚ
          </button>

          <button onClick={() => setCategoriaActiva("ENTRADAS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "ENTRADAS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Utensils size={14}/> ENTRADAS
          </button>

          <button onClick={() => setCategoriaActiva("CAMPEONAS NORTEÑAS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "CAMPEONAS NORTEÑAS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Trophy size={14}/> CAMPEONAS NORTEÑAS
          </button>

          {/* NUEVA SECCIÓN: EMPAREDADOS */}
          <button onClick={() => setCategoriaActiva("EMPAREDADO CORNER")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "EMPAREDADO CORNER" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Sandwich size={14}/> EMPAREDADOS
          </button>

          <button onClick={() => setCategoriaActiva("POSTRES")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "POSTRES" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Soup size={14}/> POSTRES
          </button>

        </div>

        {/* LISTADO DE PRODUCTOS */}
        {productosFiltrados.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <SearchX size={40} className="mx-auto mb-4 text-slate-200" />
            <p className="font-black text-slate-300 uppercase italic text-sm">No se encontraron productos en esta sección</p>
            <button onClick={() => setCategoriaActiva("TODOS")} className="mt-4 text-emerald-500 font-black text-[10px] underline uppercase">Ver todo el menú</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 lg:gap-10">
            {productosFiltrados.map((producto) => (
              <ProductCard key={producto.id} product={producto} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default ContenidoTienda;