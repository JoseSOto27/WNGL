import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // Importación necesaria
import { fetchProducts } from "../../redux/productActions";
import ProductCard from "../Common/ProductCard";
import { Trophy, Flame, Loader2, AlertCircle } from "lucide-react";

const BestSelling = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Inicialización del hook
  const displayQuantity = 8;

  // Traemos los productos y el estado de carga
  const { list: products, loading, error } = useSelector((state) => state.product);

  // EFECTO: Si la lista está vacía y no está cargando, forzamos la carga
  useEffect(() => {
    if (products.length === 0 && !loading) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length, loading]);

  // Ordenamos los más vendidos (por cantidad de reseñas)
  const bestSellers = React.useMemo(() => {
    return [...products]
      .sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0))
      .slice(0, displayQuantity);
  }, [products]);

  // --- ESTADO: CARGANDO (Evita que se quede infinito) ---
  if (loading && products.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-[#1a2e05] font-black uppercase italic animate-pulse">
          Calentando la parrilla...
        </p>
      </div>
    );
  }

  // --- ESTADO: ERROR ---
  if (error && products.length === 0) {
    return (
      <div className="py-20 text-center">
        <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
        <p className="text-red-600 font-bold uppercase italic">Error al cargar la alineación</p>
        <button 
          onClick={() => dispatch(fetchProducts())}
          className="mt-4 bg-[#1a2e05] text-white px-6 py-2 rounded-xl font-black uppercase text-xs"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <section className="relative px-6 py-24 my-10 overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER WINGOOL */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-[#1a2e05] text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-2xl shadow-xl">
              <Flame size={14} fill="currentColor" stroke="none" /> Los MVP de la Casa
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#1a2e05] uppercase italic tracking-tighter leading-none">
              Nuestros <span className="text-emerald-600">Best Sellers</span>
            </h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-md italic">
              La selección titular favorita de Tulancingo.
            </p>
          </div>

          {/* BOTÓN CORREGIDO PARA JSX/REACT ROUTER */}
          <button 
            type="button"
            onClick={() => navigate('/shop')}
            className="group flex items-center gap-4 bg-slate-50 border-2 border-slate-100 p-2 pr-6 rounded-[2rem] hover:border-emerald-500 transition-all shadow-sm"
          >
            <div className="bg-[#1a2e05] text-white p-3 rounded-full group-hover:bg-emerald-600 transition-colors">
              <Trophy size={18} />
            </div>
            <span className="text-xs font-black uppercase italic tracking-widest text-[#1a2e05]">Ver Menú completo</span>
          </button>
        </div>

        {/* GRID DE PRODUCTOS */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
          {bestSellers.map((product, index) => (
            <div key={product.id || index} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSelling;