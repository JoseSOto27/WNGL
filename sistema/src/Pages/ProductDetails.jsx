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
  Ban,
  Monitor,
  GlassWater,
  Percent,
  Check
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
  
  // ESTADOS PARA COPEO Y POMOS
  const [selectedSubCat, setSelectedSubCat] = useState(null);
  const [tipoMezcla, setTipoMezcla] = useState("SOLO"); 
  const [mezcladores, setMezcladores] = useState([]); // Para copeo (1 o 2) y pomos (hasta 6)
  const [porcentajeRefresco1, setPorcentajeRefresco1] = useState(50);

  const products = useSelector((state) => state.product?.list) || [];
  const esDisponible = localProduct?.disponible !== false && localProduct?.disponible !== "false";

  // ✅ DATA MAESTRA DE POMOS (Nueva Imagen)
  const MENU_POMOS = [
    { nombre: 'BLACK & WHITE', precio: 650 },
    { nombre: 'BACARDI', precio: 550 },
    { nombre: 'RED LABEL', precio: 720 },
    { nombre: 'JOSE CUERVO TRADICIONAL', precio: 950 },
    { nombre: 'JIMADOR REPOSADO', precio: 850 },
    { nombre: 'TORRES 5', precio: 650 },
  ];

  const MENU_COPEO = {
    WHISKY: [
      { nombre: 'Black & White', precio: 55 },
      { nombre: 'Etiqueta Roja', precio: 70 },
      { nombre: 'Jack Daniel\'s Black', precio: 95 },
      { nombre: 'Old Parr 12', precio: 125 },
      { nombre: 'Buchanan\'s 12', precio: 160 },
    ],
    RON: [
      { nombre: 'Bacardí Blanco', precio: 55 },
      { nombre: 'Bacardí Coco', precio: 60 },
      { nombre: 'Bacardí Raspberry', precio: 60 },
      { nombre: 'Bacardí Mango', precio: 60 },
      { nombre: 'Matusalem', precio: 60 },
    ],
    VODKA: [
      { nombre: 'Smirnoff', precio: 55 },
      { nombre: 'Smirnoff Tamarindo', precio: 55 },
      { nombre: 'Absolut Azul', precio: 55 },
      { nombre: 'Stolichnaya', precio: 65 },
    ],
    TEQUILA: [
      { nombre: 'Tradicional Reposado', precio: 75 },
      { nombre: 'Jimador Reposado', precio: 60 },
      { nombre: 'Don Julio Blanco', precio: 110 },
      { nombre: 'Don Julio Reposado', precio: 120 },
      { nombre: 'Don Julio 70', precio: 160 },
      { nombre: 'Maestro Dobel', precio: 130 },
      { nombre: '1800 Cristalino', precio: 140 },
    ],
    GINEBRA: [
      { nombre: 'Bombay', precio: 90 },
      { nombre: 'Tanqueray', precio: 90 },
    ],
    MEZCAL: [
      { nombre: '400 Conejos', precio: 115 },
      { nombre: 'Amaras', precio: 110 },
      { nombre: 'Chile Ancho', precio: 85 },
    ],
    "COGNAC & BRANDY": [
      { nombre: 'Torres V', precio: 65 },
      { nombre: 'Torres X', precio: 70 },
    ]
  };

  const REFRESCOS_LIST = ["Coca-Cola", "Squirt", "Agua Mineral", "Agua Natural", "Sprite", "Manzanita", "Jugo de Piña"];

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
    if (cat === "PAQUETES" || cat === "PAQUETE") return "PAQUETES"; 
    if (cat === "COPEO") return "COPEO";
    if (cat === "POMOS" || cat === "POMO") return "POMOS"; // ✅ ADICIÓN PARA POMOS
    return null;
  }, [localProduct]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from("productos").select("*").eq("id", id).single();
        if (error) throw error;
        if (data) {
          setLocalProduct(data);
          setMainImage(data.imagen_url || "/default-image.png");
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchProductData();
  }, [id]);

  const quickMenu = useMemo(() => {
    if (!products.length) return [];
    return products.filter((p) => String(p.id) !== String(id) && p.disponible !== false).sort(() => 0.5 - Math.random()).slice(0, 5);
  }, [products, id]);

  const precioTotal = useMemo(() => {
    let base = 0;
    if (categoriaConfigurable === "COPEO" || categoriaConfigurable === "POMOS" || (categoriaConfigurable && categoriaConfigurable !== "PAQUETES")) {
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
    if (!esDisponible) return;
    setSelectedExtras((prev) => prev.find((e) => e.id === item.id) ? prev.filter((e) => e.id !== item.id) : [...prev, item]);
  };

  const toggleMezclador = (refresco) => {
    if (categoriaConfigurable === "POMOS") {
        // Lógica para Pomos: permite hasta 6
        setMezcladores(prev => {
            if (prev.length < 6) return [...prev, refresco];
            return prev;
        });
    } else if (tipoMezcla === "SOLO") {
      setMezcladores([refresco]);
    } else {
      setMezcladores(prev => prev.includes(refresco) ? prev.filter(r => r !== refresco) : (prev.length < 2 ? [...prev, refresco] : [prev[1], refresco]));
    }
  };

  const removeMezcladorPomo = (index) => {
    setMezcladores(prev => prev.filter((_, i) => i !== index));
  };

  const addToCartHandler = () => {
    if (!localProduct || !esDisponible) return;
    
    let infoMezcla = "";

    if (categoriaConfigurable === "COPEO") {
      if (!selectedSubCat || !selectedSize) { notify.error("Selecciona licor y marca"); return; }
      if (mezcladores.length === 0) { notify.error("Selecciona mezclador"); return; }
      if (tipoMezcla === "CAMPECHANO" && mezcladores.length < 2) { notify.error("Selecciona 2 refrescos"); return; }
      infoMezcla = tipoMezcla === "SOLO" ? `CON ${mezcladores[0]}` : `CAMPECHANO: ${porcentajeRefresco1}% ${mezcladores[0]} / ${100 - porcentajeRefresco1}% ${mezcladores[1]}`;
    } else if (categoriaConfigurable === "POMOS") {
        if (!selectedSize) { notify.error("Selecciona el Pomo"); return; }
        if (mezcladores.length < 6) { notify.error("Selecciona tus 6 refrescos"); return; }
        infoMezcla = `REFRESCOS: ${mezcladores.join(", ")}`;
    } else {
      if (categoriaConfigurable && !selectedSalsa) { notify.error("Selecciona el sabor"); return; }
      if (categoriaConfigurable && categoriaConfigurable !== "PAQUETES" && !selectedSize) { notify.error("Selecciona el tamaño"); return; }
    }

    const extrasIdString = selectedExtras.map(e => e.id).sort().join("-");
    const uniqueId = `${localProduct.id}-${selectedSubCat || 'base'}-${selectedSize?.nombre || 'base'}-${infoMezcla.replace(/\s+/g, '')}-${Date.now()}`;

    dispatch(addToCart({ 
      ...localProduct, 
      id: uniqueId, 
      originalId: localProduct.id,
      nombre: (categoriaConfigurable === "COPEO" || categoriaConfigurable === "POMOS") ? `${localProduct.nombre}: ${selectedSize.nombre}` : (selectedSize ? `${localProduct.nombre} (${selectedSize.nombre})` : localProduct.nombre), 
      precio: precioTotal, 
      salsa: (categoriaConfigurable === "COPEO" || categoriaConfigurable === "POMOS") ? infoMezcla : selectedSalsa,
      preparacion: infoMezcla,
      extras: selectedExtras,
      size: selectedSize?.nombre,
      quantity: 1 
    }));
    notify.success("¡Jugada en canasta!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>;

  return (
    <div className={`min-h-screen bg-slate-50/30 pt-20 pb-12 font-sans ${!esDisponible ? 'grayscale-[0.4]' : ''}`}>
      <div className="max-w-6xl mx-auto px-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 font-black text-[9px] uppercase tracking-[0.2em] mb-8 hover:text-emerald-600 transition-all italic">
          <ChevronLeft size={14} strokeWidth={3} /> Regresar al Menú
        </button>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <div className="w-full lg:w-[45%] lg:sticky lg:top-24">
            <div className={`relative bg-white rounded-[3rem] h-[350px] md:h-[480px] flex items-center justify-center overflow-hidden shadow-sm border ${!esDisponible ? 'border-red-500' : 'border-slate-100'}`}>
              <img src={mainImage} alt="" className="max-h-[75%] max-w-[75%] object-contain drop-shadow-xl" />
            </div>
          </div>

          <div className="w-full lg:w-[55%] space-y-8">
            <div className="space-y-3">
              <div className={`flex items-center gap-2 font-black text-[8px] uppercase tracking-[0.3em] italic ${esDisponible ? 'text-emerald-500' : 'text-red-500'}`}>
                 <Zap size={10} fill="currentColor" /> {esDisponible ? 'Análisis de Sabor' : 'AGOTADO'}
              </div>
              <h1 className="text-3xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-tight">{localProduct?.nombre}</h1>
              <p className="text-slate-400 font-bold italic text-xs md:text-sm">{localProduct?.descripcion}</p>
            </div>

            <div className="flex items-center justify-between p-6 rounded-[2.5rem] shadow-xl bg-[#1a2e05] border border-white/5">
              <div className="relative z-10 text-white">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] mb-1 block italic text-emerald-400">Importe Jugada</span>
                <span className="text-4xl md:text-5xl font-[1000] italic tracking-tighter leading-none">${precioTotal.toFixed(0)}</span>
              </div>
              <Trophy size={32} className="text-emerald-500/10" />
            </div>

            {/* ✅ SECCIÓN DINÁMICA DE POMOS */}
            {categoriaConfigurable === "POMOS" && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic"><Scaling size={14} className="text-emerald-500" /> 1. Fichar Pomo</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {MENU_POMOS.map((pomo) => (
                      <button key={pomo.nombre} onClick={() => { setSelectedSize({ nombre: pomo.nombre, precio: pomo.precio }); setMezcladores([]); }} className={`p-4 rounded-[1.5rem] border-2 transition-all flex justify-between items-center ${selectedSize?.nombre === pomo.nombre ? "bg-emerald-500 border-emerald-500 text-[#1a2e05]" : "bg-white border-slate-100 text-slate-400"}`}>
                        <span className="text-[10px] font-black uppercase italic">{pomo.nombre}</span>
                        <span className="text-xs font-black italic">${pomo.precio}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedSize && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                      <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic"><GlassWater size={14} className="text-blue-500" /> 2. Elige tus 6 Refrescos</h3>
                      
                      {/* Lista de Seleccionados */}
                      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        {mezcladores.length === 0 && <span className="text-[10px] font-bold text-slate-300 italic">No has seleccionado refrescos aún...</span>}
                        {mezcladores.map((m, i) => (
                            <button key={i} onClick={() => removeMezcladorPomo(i)} className="bg-blue-500 text-white px-3 py-1.5 rounded-xl text-[9px] font-black flex items-center gap-2 animate-in zoom-in">
                                {m} <Check size={10} strokeWidth={4} />
                            </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {REFRESCOS_LIST.map((r) => (
                          <button key={r} disabled={mezcladores.length >= 6} onClick={() => toggleMezclador(r)} className={`px-4 py-2 rounded-xl border transition-all text-[9px] font-bold italic ${mezcladores.length >= 6 ? "opacity-30 cursor-not-allowed" : "bg-white border-slate-100 text-slate-400 hover:border-blue-300"}`}>{r}</button>
                        ))}
                      </div>
                      
                      <p className={`text-[8px] font-black uppercase tracking-widest italic ${mezcladores.length === 6 ? 'text-emerald-500' : 'text-slate-400'}`}>
                        Seleccionados: {mezcladores.length} / 6
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COPEO SECTIONS */}
            {categoriaConfigurable === "COPEO" && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic"><Monitor size={14} className="text-emerald-500" /> 1. Área de Jugada</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(MENU_COPEO).map((tipo) => (
                      <button key={tipo} onClick={() => { setSelectedSubCat(tipo); setSelectedSize(null); setMezcladores([]); }} className={`px-4 py-2 rounded-xl border-2 font-black text-[10px] italic transition-all ${selectedSubCat === tipo ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white border-slate-100 text-slate-400"}`}>{tipo}</button>
                    ))}
                  </div>
                </div>

                {selectedSubCat && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic"><Scaling size={14} className="text-emerald-500" /> 2. Fichar Marca</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MENU_COPEO[selectedSubCat].map((licor) => (
                        <button key={licor.nombre} onClick={() => setSelectedSize({ nombre: licor.nombre, precio: licor.precio })} className={`p-4 rounded-[1.5rem] border-2 transition-all flex justify-between items-center ${selectedSize?.nombre === licor.nombre ? "bg-emerald-500 border-emerald-500 text-[#1a2e05]" : "bg-white border-slate-100 text-slate-400"}`}>
                          <span className="text-[10px] font-black uppercase italic">{licor.nombre}</span>
                          <span className="text-xs font-black italic">${licor.precio}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSize && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
                      <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic"><GlassWater size={14} className="text-blue-500" /> 3. Estilo de Mezcla</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {["SOLO", "CAMPECHANO"].map((m) => (
                          <button key={m} onClick={() => { setTipoMezcla(m); setMezcladores([]); }} className={`p-3 rounded-xl border-2 font-black text-[10px] italic transition-all ${tipoMezcla === m ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-slate-50 border-transparent text-slate-400"}`}>{m}</button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {REFRESCOS_LIST.map((r) => (
                          <button key={r} onClick={() => toggleMezclador(r)} className={`px-4 py-2 rounded-xl border transition-all text-[9px] font-bold italic ${mezcladores.includes(r) ? "bg-blue-500 border-blue-500 text-white shadow-lg" : "bg-white border-slate-100 text-slate-400"}`}>{r}</button>
                        ))}
                      </div>
                      {tipoMezcla === "CAMPECHANO" && mezcladores.length === 2 && (
                        <div className="pt-4 space-y-4">
                          <div className="flex justify-between text-[10px] font-black italic uppercase">
                            <span className="text-blue-600">{porcentajeRefresco1}% {mezcladores[0]}</span>
                            <span className="text-emerald-600">{100 - porcentajeRefresco1}% {mezcladores[1]}</span>
                          </div>
                          <input type="range" min="10" max="90" step="5" value={porcentajeRefresco1} onChange={(e) => setPorcentajeRefresco1(Number(e.target.value))} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#1a2e05]" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ALITAS/BONELESS SIZE */}
            {categoriaConfigurable && !["PAQUETES", "COPEO", "POMOS"].includes(categoriaConfigurable) && (
              <div className="space-y-4 pt-4">
                <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic"><Scaling size={14} className="text-emerald-500" /> 1. Elige tu Porción</h3>
                <div className="grid grid-cols-2 gap-3">
                  {OPCIONES_TAMAÑO[categoriaConfigurable].map((opt) => (
                    <button key={opt.id} onClick={() => setSelectedSize(opt)} className={`p-4 rounded-[1.5rem] border-2 transition-all flex justify-between items-center ${selectedSize?.id === opt.id ? "bg-emerald-500 border-emerald-500 text-[#1a2e05]" : "bg-white border-slate-100 text-slate-400"}`}>
                      <span className="text-[10px] font-black uppercase italic">{opt.nombre}</span>
                      <span className="text-xs font-black italic">${opt.precio}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SALSAS */}
            {categoriaConfigurable && !["COPEO", "POMOS"].includes(categoriaConfigurable) && (
              <div className="space-y-4">
                <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic"><Droplets size={14} className="text-orange-500" /> Baño de Sabor</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SALSAS_LIST.map((salsa) => (
                    <button key={salsa.id} onClick={() => setSelectedSalsa(salsa.nombre)} className={`relative flex flex-col items-start p-4 rounded-[1.5rem] border-2 transition-all ${selectedSalsa === salsa.nombre ? "bg-[#1a2e05] border-[#1a2e05] text-white" : "bg-white border-slate-100 text-slate-400"}`}>
                       <div className="flex gap-0.5 mb-1">
                        {Array.from({ length: salsa.flamas }).map((_, i) => <Flame key={i} size={8} fill="currentColor" className={selectedSalsa === salsa.nombre ? "text-orange-400" : "text-yellow-500"} />)}
                      </div>
                      <span className="text-[9px] font-[1000] uppercase italic leading-none">{salsa.nombre}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* EXTRAS */}
            {localProduct?.ingredientes?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-[9px] font-black text-[#1a2e05] uppercase tracking-[0.3em] flex items-center gap-2 italic"><ChefHat size={14} className="text-emerald-500" /> Personaliza</h3>
                <div className="flex flex-wrap gap-2">
                  {localProduct.ingredientes.map((ing) => (
                    <button key={ing.id} onClick={() => toggleExtra(ing)} className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedExtras.find(e => e.id === ing.id) ? "bg-[#1a2e05] text-white border-[#1a2e05]" : "bg-white text-slate-400 border-slate-100"}`}>
                      {ing.nombre} <span className="text-emerald-500">+${ing.precio}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* RECOMENDADOS */}
            {quickMenu.length > 0 && (
              <div className="space-y-5 pt-8 border-t border-slate-100">
                  <h3 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.3em] flex items-center gap-2 italic"><ShoppingBag size={14} fill="currentColor" /> Recomendados</h3>
                  <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                      {quickMenu.map((item) => (
                        <div key={item.id} className="min-w-[140px] bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                            <div className="h-20 flex items-center justify-center mb-3">
                                <img src={item.imagen_url || "/default-image.png"} className="max-h-full object-contain" alt="" />
                            </div>
                            <p className="text-[9px] font-black text-[#1a2e05] uppercase italic truncate mb-1 tracking-tight">{item.nombre || item.name}</p>
                            <div className="flex justify-between items-center mt-2">
                              <p className="text-[11px] font-[1000] text-emerald-600 italic">${Number(item.precio_original || item.precio).toFixed(0)}</p>
                              <button onClick={() => { navigate(`/product/${item.id}`); window.scrollTo(0,0); }} className="bg-slate-50 text-[#1a2e05] p-1.5 rounded-lg hover:bg-[#1a2e05] hover:text-white transition-all"><PlusCircle size={14} /></button>
                            </div>
                        </div>
                      ))}
                  </div>
              </div>
            )}

            <div className="sticky bottom-6 left-0 w-full bg-white/60 backdrop-blur-md p-4 rounded-[2.5rem] border border-white/50 shadow-2xl z-20">
              <button onClick={addToCartHandler} disabled={!esDisponible} className={`w-full py-5 rounded-[1.8rem] font-[1000] uppercase italic text-sm tracking-[0.25em] flex items-center justify-center gap-4 transition-all ${esDisponible ? 'bg-[#1a2e05] text-white hover:bg-emerald-500 shadow-xl' : 'bg-red-50 text-red-600'}`}>
                <Zap size={20} fill="currentColor" className="text-emerald-400" />
                <span>{esDisponible ? `FICHAR AHORA • $${precioTotal.toFixed(0)}` : 'AGOTADO'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;