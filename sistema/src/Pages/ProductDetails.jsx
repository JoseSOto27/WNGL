import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlusIcon,
  CheckIcon,
  ChevronLeft,
  Flame,
  Zap,
  ShoppingBag,
  PlusCircle,
  Trophy,
  ChefHat,
  Loader2,
  Droplets,
  Scaling,
  Ban // Icono para agotado
} from "lucide-react";

import { supabase } from "../services/supabase";
import { addToCart } from "../features/cart/cartSlice";
import { useNotify } from "../hook/useNotify";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notify = useNotify();

  const [localProduct, setLocalProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [mainImage, setMainImage] = useState("");
  
  const [selectedSalsa, setSelectedSalsa] = useState("");
  const [selectedSize, setSelectedSize] = useState(null);

  const products = useSelector((state) => state.product?.list) || [];

  // 🛡️ VALIDACIÓN DE DISPONIBILIDAD
  const esDisponible = localProduct?.disponible !== false && localProduct?.disponible !== "false";

  const OPCIONES_TAMAÑO = {
    ALITAS: [
      { id: 'a4', nombre: '4 PIEZAS', precio: 58 },
      { id: 'a8', nombre: '8 PIEZAS', precio: 109 },
      { id: 'a16', nombre: '16 PIEZAS', precio: 215 },
      { id: 'a24', nombre: '24 PIEZAS', precio: 319 },
    ],
    BONELESS: [
      { id: 'b200', nombre: '200 GRAMOS', precio: 115 },
      { id: 'b400', nombre: '400 GRAMOS', precio: 215 },
      { id: 'b600', nombre: '600 GRAMOS', precio: 309 },
      { id: 'b800', nombre: '800 GRAMOS', precio: 402 },
    ]
  };

  const SALSAS_LIST = [
    { id: 'lemon', nombre: 'LEMON GOAT', picor: 'Bajo', flamas: 1 },
    { id: 'mustard', nombre: 'SLAM DUNK MUSTARD', picor: 'Bajo', flamas: 1 },
    { id: 'bbq', nombre: 'HOME RUN BBQ', picor: 'Medio-Bajo', flamas: 2 },
    { id: 'buffalo', nombre: 'BUFFALO BLITZ', picor: 'Medio', flamas: 4 },
    { id: 'finta', nombre: 'FINTA PICANTE', picor: 'Medio-Alto', flamas: 3 },
    { id: 'oro', nombre: 'GOOL DE ORO', picor: 'Medio-Alto', flamas: 3 },
    { id: 'habanero', nombre: 'KNOCKOUT HABANERO', picor: 'Fuego', flamas: 5 }
  ];

  const categoriaConfigurable = useMemo(() => {
    const cat = (localProduct?.categoria || "").toUpperCase().trim();
    if (cat === "ALITAS" || cat === "BONELESS") return cat;
    return null;
  }, [localProduct]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        if (data) {
          setLocalProduct(data);
          setMainImage(data.imagen_url || "/default-image.png");
        }
      } catch (err) {
        console.error("Error cargando producto:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  const quickMenu = useMemo(() => {
    if (!products.length) return [];
    return products
      .filter((p) => String(p.id) !== String(id) && p.disponible !== false && p.disponible !== "false")
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
  }, [products, id]);

  const precioTotal = useMemo(() => {
    let base = 0;
    if (categoriaConfigurable) {
      base = selectedSize ? selectedSize.precio : 0;
    } else {
      const original = Number(localProduct?.precio_original) || 0;
      const oferta = Number(localProduct?.precio_oferta) || 0;
      base = (oferta > 0 && oferta < original) ? oferta : original;
    }
    const costoExtras = selectedExtras.reduce((acc, item) => acc + (Number(item.precio) || 0), 0);
    return base + costoExtras;
  }, [localProduct, categoriaConfigurable, selectedSize, selectedExtras]);

  const toggleExtra = (item) => {
    if (!esDisponible) return; // Bloqueo si no hay stock
    setSelectedExtras((prev) => {
      const isSelected = prev.find((e) => e.id === item.id);
      if (isSelected) {
        return prev.filter((e) => e.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const addToCartHandler = () => {
    if (!localProduct || !esDisponible) return; // Bloqueo final
    if (categoriaConfigurable && (!selectedSalsa || !selectedSize)) {
      notify.error("Selecciona tamaño y sabor para tu jugada");
      return;
    }

    const extrasIdString = selectedExtras.map(e => e.id).sort().join("-");
    const uniqueCartId = `${localProduct.id}-${selectedSize?.id || 'base'}-${selectedSalsa}-${extrasIdString}`;
    
    dispatch(addToCart({ 
      ...localProduct, 
      id: uniqueCartId, 
      originalId: localProduct.id,
      nombre: categoriaConfigurable ? `${localProduct.nombre} (${selectedSize.nombre})` : localProduct.nombre, 
      imagen_url: localProduct.imagen_url, 
      precio: precioTotal, 
      extras: selectedExtras,
      salsa: selectedSalsa,
      size: selectedSize?.nombre,
      quantity: 1 
    }));
    notify.success("¡Jugada en canasta!");
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase italic tracking-[0.3em] text-slate-400">Preparando alineación...</p>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-50/30 pt-20 pb-12 font-sans ${!esDisponible ? 'grayscale-[0.4]' : ''}`}>
      <div className="max-w-6xl mx-auto px-6">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] mb-8 hover:text-emerald-600 transition-all italic">
          <ChevronLeft size={14} strokeWidth={3} /> Regresar al Menú
        </button>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="w-full lg:w-[45%] lg:sticky lg:top-24">
            <div className={`relative bg-white rounded-[3rem] h-[350px] md:h-[480px] flex items-center justify-center overflow-hidden shadow-sm border transition-all ${!esDisponible ? 'border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.2)]' : 'border-slate-100 group'}`}>
              <img src={mainImage} alt={localProduct?.nombre} className={`max-h-[75%] max-w-[75%] object-contain drop-shadow-xl transition-transform duration-700 ${esDisponible ? 'group-hover:scale-105' : 'opacity-30'}`} />
              {!esDisponible && (
                <div className="absolute inset-0 bg-red-500/5 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase italic tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse flex items-center gap-2">
                    <Ban size={16} /> Fuera de Alineación
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[55%] space-y-8">
            <div className="space-y-3">
              <div className={`flex items-center gap-2 font-black text-[8px] uppercase tracking-[0.3em] italic ${esDisponible ? 'text-emerald-500' : 'text-red-500 animate-pulse'}`}>
                 <Zap size={10} fill="currentColor" /> {esDisponible ? 'Análisis de Sabor' : 'AVISO: PRODUCTO AGOTADO'}
              </div>
              <h1 className="text-3xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-tight">{localProduct?.nombre}</h1>
              <p className="text-slate-400 font-bold italic text-xs md:text-sm max-w-lg">{localProduct?.descripcion}</p>
            </div>

            <div className={`flex items-center justify-between p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden group border transition-all ${esDisponible ? 'bg-[#1a2e05] border-white/5' : 'bg-red-50 border-red-200 shadow-[0_0_15px_rgba(239,68,68,0.1)]'}`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-10"></div>
              <div className="relative z-10 text-white">
                <span className={`text-[8px] font-black uppercase tracking-[0.3em] mb-1 block italic opacity-70 ${esDisponible ? 'text-emerald-400' : 'text-red-400'}`}>Importe Jugada</span>
                <span className={`text-4xl md:text-5xl font-[1000] italic tracking-tighter leading-none ${esDisponible ? 'text-white' : 'text-red-600'}`}>
                  {esDisponible ? `$${precioTotal.toFixed(0)}` : 'AGOTADO'}
                </span>
              </div>
              <Trophy size={32} className={`relative z-10 ${esDisponible ? 'text-emerald-500/10' : 'text-red-500/10'}`} />
            </div>

            {categoriaConfigurable && (
              <div className="space-y-4 pt-4">
                <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic">
                  <Scaling size={14} className={esDisponible ? "text-emerald-500" : "text-red-400"} /> 1. Elige tu Porción
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {OPCIONES_TAMAÑO[categoriaConfigurable].map((opt) => (
                    <button 
                      key={opt.id} 
                      disabled={!esDisponible}
                      onClick={() => setSelectedSize(opt)}
                      className={`p-4 rounded-[1.5rem] border-2 transition-all flex justify-between items-center ${selectedSize?.id === opt.id ? "bg-emerald-500 border-emerald-500 text-[#1a2e05]" : "bg-white border-slate-100 text-slate-400"} ${!esDisponible ? 'opacity-50 grayscale cursor-not-allowed border-red-100' : ''}`}
                    >
                      <span className="text-[10px] font-black uppercase italic">{opt.nombre}</span>
                      <span className="text-xs font-black italic">${opt.precio}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {categoriaConfigurable && (
              <div className="space-y-4">
                <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic">
                  <Droplets size={14} className={esDisponible ? "text-orange-500" : "text-red-400"} /> 2. Baño de Sabor
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SALSAS_LIST.map((salsa) => (
                    <button 
                      key={salsa.id} 
                      disabled={!esDisponible}
                      onClick={() => setSelectedSalsa(salsa.nombre)} 
                      className={`relative flex flex-col items-start p-4 rounded-[1.5rem] border-2 transition-all ${selectedSalsa === salsa.nombre ? "bg-[#1a2e05] border-[#1a2e05] text-white" : "bg-white border-slate-100 text-slate-400"} ${!esDisponible ? 'opacity-50 grayscale cursor-not-allowed border-red-100' : ''}`}
                    >
                      <div className="flex items-center gap-0.5 mb-1">
                        {Array.from({ length: salsa.flamas }).map((_, i) => (
                          <Flame key={i} size={8} fill="currentColor" className={selectedSalsa === salsa.nombre ? "text-orange-400" : "text-yellow-500"} />
                        ))}
                      </div>
                      <span className="text-[9px] font-[1000] uppercase italic tracking-tighter leading-none">{salsa.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {localProduct?.ingredientes && localProduct.ingredientes.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic">
                  <ChefHat size={14} className={esDisponible ? "text-emerald-500" : "text-red-400"} /> Personaliza tu Jugada
                </h3>
                <div className="flex flex-wrap gap-2">
                  {localProduct.ingredientes.map((ing) => {
                    const isSelected = selectedExtras.find((e) => e.id === ing.id);
                    return (
                      <button 
                        key={ing.id} 
                        disabled={!esDisponible}
                        onClick={() => toggleExtra(ing)} 
                        className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300 flex items-center gap-2 ${isSelected ? "bg-[#1a2e05] border-[#1a2e05] text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200"} ${!esDisponible ? 'opacity-50 grayscale cursor-not-allowed border-red-50' : ''}`}
                      >
                        {ing.nombre} <span className={esDisponible ? "text-emerald-500" : "text-red-400"}>+${ing.precio}</span>
                        {isSelected ? <CheckIcon size={12} strokeWidth={4} /> : <PlusIcon size={12} strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="sticky bottom-6 left-0 w-full bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] border border-white/50 shadow-2xl z-20">
              <button 
                onClick={addToCartHandler} 
                disabled={!esDisponible}
                className={`w-full py-5 rounded-[1.8rem] font-[1000] uppercase italic text-sm tracking-[0.25em] flex items-center justify-center gap-4 transition-all group ${esDisponible ? 'bg-[#1a2e05] text-white hover:bg-emerald-500' : 'bg-red-50 text-red-600 border border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.2)] cursor-not-allowed animate-pulse'}`}
              >
                {esDisponible ? (
                  <>
                    <Zap size={20} fill="currentColor" className="text-emerald-400 group-hover:text-white" />
                    <span>{categoriaConfigurable && (!selectedSalsa || !selectedSize) ? "CONFIGURA TU PEDIDO" : `FICHAR AHORA • $${precioTotal.toFixed(0)}`}</span>
                  </>
                ) : (
                  <>
                    <Ban size={20} />
                    <span>JUGADA AGOTADA</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
      `}</style>
    </div>
  );
};

export default ProductDetails;