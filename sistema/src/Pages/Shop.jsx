import React, { useState, useMemo, useEffect } from "react";
import { 
  LayoutGrid, Utensils, Trophy, Soup, Sandwich, SearchX, Zap, 
  Flame, Target, Beer, GlassWater, Package, IceCream, Wine, Coffee 
} from "lucide-react"; 
import { useSelector, useDispatch } from "react-redux"; // ✅ Se añade useDispatch
import { fetchProducts } from "../redux/productActions"; // ✅ Importa tu acción de carga
import Loading from "../Components/Common/Loading";
import ProductCard from "../Components/Common/ProductCard";

function ContenidoTienda() {
  const dispatch = useDispatch();
  const [categoriaActiva, setCategoriaActiva] = useState("TODOS");

  const { list: productos = [], loading } = useSelector((state) => state.product || {});

  // ✅ EFECTO ANTI-RECARGA: Si F5 limpia Redux, volvemos a traer los productos
  useEffect(() => {
    if (productos.length === 0 && !loading) {
      dispatch(fetchProducts());
    }
  }, [dispatch, productos.length, loading]);

  const productosFiltrados = useMemo(() => {
    if (categoriaActiva === "TODOS") return productos;

    return productos.filter((p) => {
      // ✅ Normalización para evitar errores de texto entre DB y Botón
      const catDB = (p.categoria || "").toString().toUpperCase().trim();
      const catBoton = categoriaActiva.toUpperCase().trim();
      return catDB === catBoton;
    });
  }, [productos, categoriaActiva]);

  // Si está cargando y no hay productos aún, mostramos el loading
  if (loading && productos.length === 0) return <Loading text="CONECTANDO CON LA COCINA..." />;

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

          <button onClick={() => setCategoriaActiva("ALITAS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "ALITAS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Flame size={14}/> ALITAS
          </button>

          <button onClick={() => setCategoriaActiva("BONELESS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "BONELESS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Target size={14}/> BONELESS
          </button>

          <button onClick={() => setCategoriaActiva("ENTRADAS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "ENTRADAS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Utensils size={14}/> ENTRADAS
          </button>

          <button onClick={() => setCategoriaActiva("HAMBURGUESAS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "HAMBURGUESAS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Utensils size={14}/> HAMBURGUESAS
          </button>

          <button onClick={() => setCategoriaActiva("CAMPEONAS NORTEÑAS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "CAMPEONAS NORTEÑAS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Trophy size={14}/> CAMPEONAS NORTEÑAS
          </button>

          <button onClick={() => setCategoriaActiva("EMPAREDADO CORNER")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "EMPAREDADO CORNER" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Sandwich size={14}/> EMPAREDADOS
          </button>

          <button onClick={() => setCategoriaActiva("CERVEZAS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "CERVEZAS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Beer size={14}/> ZONA DE CERVEZAS
          </button>

          <button onClick={() => setCategoriaActiva("COCTELES DE CAMPEONATO")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "COCTELES DE CAMPEONATO" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Wine size={14}/> CÓCTELES
          </button>

          <button onClick={() => setCategoriaActiva("COPEO")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "COPEO" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <GlassWater size={14}/> COPEO
          </button>

          <button onClick={() => setCategoriaActiva("POMOS")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "POMOS" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <GlassWater size={14}/> POMOS
          </button>

          <button onClick={() => setCategoriaActiva("PAQUETES")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "PAQUETES" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Package size={14}/> PAQUETES
          </button>

          <button onClick={() => setCategoriaActiva("TIEMPO FUERA (SIN ALCOHOL)")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "TIEMPO FUERA (SIN ALCOHOL)" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <Coffee size={14}/> SIN ALCOHOL
          </button>

          <button onClick={() => setCategoriaActiva("POSTRES")} 
            className={`px-6 py-4 rounded-2xl text-[10px] font-black border-2 transition-all whitespace-nowrap flex items-center gap-2 ${categoriaActiva === "POSTRES" ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
            <IceCream size={14}/> POSTRES
          </button>
        </div>

        {/* LISTADO DE PRODUCTOS */}
        {productosFiltrados.length === 0 && !loading ? (
          <div className="py-20 text-center bg-red-50/30 rounded-[3rem] border-2 border-dashed border-red-200 animate-pulse">
            <SearchX size={40} className="mx-auto mb-4 text-red-300" />
            <p className="font-black text-red-400 uppercase italic text-sm">Alineación no encontrada</p>
            <button onClick={() => setCategoriaActiva("TODOS")} className="mt-4 text-red-600 font-black text-[10px] underline uppercase italic tracking-widest">Revisar vestidores</button>
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