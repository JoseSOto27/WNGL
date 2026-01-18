import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  StarIcon,
  PlusIcon,
  CheckIcon,
  ChevronLeft,
  Flame,
  Clock,
  ShieldCheck,
  Star
} from "lucide-react";

import { addToCart } from "../features/cart/cartSlice";
import Counter from "../Components/Common/Counter";
import { useNotify } from "../hook/useNotify";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notify = useNotify();

  const products = useSelector((state) => state.product.list);
  const cart = useSelector((state) => state.cart.cartItems);

  const product = products.find((p) => String(p.id) === String(id));

  const [selectedExtras, setSelectedExtras] = useState([]);
  const [mainImage, setMainImage] = useState(product?.images?.[0] || "/default-image.png");

  // --- DATOS DE PRUEBA WINGOOL STYLE ---
  const ingredientesPrueba = [
    { id: "i1", nombre: "Extra Queso", precio: 15 },
    { id: "i2", nombre: "Salsa Habanero", precio: 10 },
    { id: "i3", nombre: "Tocineta Crujiente", precio: 25 },
    { id: "i4", nombre: "Cebolla Caramelizada", precio: 12 },
  ];

  const complementosPrueba = [
    { id: "a1", nombre: "Papas Crinkle", precio: 45, imagen: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=300" },
    { id: "a2", nombre: "Aros de Cebolla", precio: 55, imagen: "https://images.unsplash.com/photo-1639024471283-035188835118?q=80&w=300" },
  ];

  const bebidasPrueba = [
    { id: "b1", nombre: "Coca-Cola Fría", precio: 30, imagen: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=300" },
    { id: "b2", nombre: "Cerveza Nacional", precio: 45, imagen: "https://images.unsplash.com/photo-1612528443702-f6741f70a049?q=80&w=300" },
  ];

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50">
        <p className="text-2xl font-black text-[#1a2e05] uppercase italic">Producto fuera de la cancha</p>
        <button onClick={() => navigate("/shop")} className="mt-4 text-emerald-600 font-bold underline">Volver al Menú</button>
      </div>
    );
  }

  const listaIngredientes = product.ingredientes || ingredientesPrueba;
  const listaComplementos = product.complementos || complementosPrueba;
  const listaBebidas = product.bebidas || bebidasPrueba;

  const productId = product.id;
  const currency = "$";

  const averageRating = product.rating?.length
    ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
    : 5; // Default 5 para que luzca bien

  const precioOriginal = Number(product.precio_original) || 0;
  const precioOferta = Number(product.precio_oferta) || 0;
  const hasOffer = precioOferta > 0 && precioOferta < precioOriginal;
  const precioBase = hasOffer ? precioOferta : precioOriginal;

  const precioTotal = useMemo(() => {
    const costoExtras = selectedExtras.reduce((acc, item) => acc + (Number(item.precio) || 0), 0);
    return precioBase + costoExtras;
  }, [precioBase, selectedExtras]);

  const toggleExtra = (item) => {
    const isSelected = selectedExtras.find((e) => e.id === item.id);
    if (isSelected) {
      setSelectedExtras(selectedExtras.filter((e) => e.id !== item.id));
    } else {
      setSelectedExtras([...selectedExtras, item]);
    }
  };

  const addToCartHandler = () => {
    if (cart[productId]) {
      notify.warning("Ya está en tu alineación");
      return;
    }
    dispatch(addToCart({ productId, extras: selectedExtras, precioFinal: precioTotal }));
    notify.success("¡Agregado con éxito!");
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        {/* BOTÓN VOLVER */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#1a2e05] font-black text-[10px] uppercase tracking-[0.2em] mb-8 hover:text-emerald-600 transition-colors"
        >
          <ChevronLeft size={16} /> Volver al Menú
        </button>

        <div className="flex flex-col lg:flex-row gap-12 xl:gap-20">

          {/* ===== IZQUIERDA: GALERÍA VISUAL ===== */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="relative bg-slate-50 rounded-[3rem] h-[350px] sm:h-[450px] lg:h-[500px] flex items-center justify-center overflow-hidden border border-slate-100 shadow-inner group">
              {hasOffer && (
                <div className="absolute top-8 left-8 bg-red-500 text-white font-black px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl z-10 animate-pulse italic text-sm">
                  <Flame size={18} fill="currentColor" /> OFERTA MVP
                </div>
              )}
              <img
                src={mainImage}
                alt={product.name}
                className="max-h-[80%] max-w-[80%] object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* MINIATURAS */}
            <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(image)}
                  className={`relative shrink-0 bg-slate-50 rounded-2xl p-2 w-20 h-20 border-2 transition-all ${mainImage === image ? 'border-emerald-500 bg-white' : 'border-transparent'}`}
                >
                  <img src={image} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* ===== DERECHA: PERSONALIZACIÓN ===== */}
          <div className="w-full lg:w-1/2 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl font-black text-[#1a2e05] uppercase italic tracking-tighter leading-none">
                {product.name}
              </h1>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={averageRating > i ? "#10b981" : "#E2E8F0"} stroke="none" />
                  ))}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.rating?.length || 0} Reseñas</span>
              </div>
            </div>

            <p className="text-slate-500 font-medium leading-relaxed">
              {product.description || "El sabor auténtico de Wingool Company, preparado con ingredientes frescos y la pasión que nos caracteriza."}
            </p>

            {/* PRECIO DINÁMICO */}
            <div className="flex items-end gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio Final</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-[#1a2e05] italic">{currency}{precioTotal.toFixed(2)}</span>
                  {hasOffer && (
                    <span className="text-lg text-slate-300 line-through font-bold">{currency}{precioOriginal.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECCIÓN 1: INGREDIENTES */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1a2e05] uppercase italic tracking-widest flex items-center gap-2">
                <PlusIcon size={16} className="text-emerald-500" /> Personaliza tu jugada
              </h3>
              <div className="flex flex-wrap gap-2">
                {listaIngredientes.map((ing) => {
                  const isSelected = selectedExtras.find((e) => e.id === ing.id);
                  return (
                    <button
                      key={ing.id}
                      onClick={() => toggleExtra(ing)}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
                        isSelected 
                          ? "bg-[#1a2e05] border-[#1a2e05] text-white shadow-xl shadow-slate-200" 
                          : "bg-white border-slate-100 text-slate-500 hover:border-emerald-200"
                      }`}
                    >
                      {ing.nombre} (+${ing.precio})
                      {isSelected ? <CheckIcon size={14} strokeWidth={4} /> : <PlusIcon size={14} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 2: COMPLEMENTOS */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-[#1a2e05] uppercase italic tracking-widest">¿Hambre de más?</h3>
              <div className="grid grid-cols-2 gap-3">
                {listaComplementos.map((extra) => {
                  const isSelected = selectedExtras.find((e) => e.id === extra.id);
                  return (
                    <div 
                      key={extra.id} 
                      onClick={() => toggleExtra(extra)}
                      className={`relative cursor-pointer border-2 rounded-[2rem] p-4 transition-all ${
                        isSelected ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-500/10" : "border-slate-50 bg-white hover:border-slate-200"
                      }`}
                    >
                      <img src={extra.imagen} className="h-20 w-full object-cover rounded-2xl mb-3" alt={extra.nombre} />
                      <p className="text-[10px] font-black uppercase text-[#1a2e05] tracking-tight">{extra.nombre}</p>
                      <p className="text-xs text-emerald-600 font-black italic">+{currency}{extra.precio}</p>
                      <div className={`absolute top-3 right-3 size-6 rounded-full flex items-center justify-center shadow-sm ${isSelected ? "bg-emerald-500 text-white scale-110" : "bg-slate-100 text-slate-400"}`}>
                        {isSelected ? <CheckIcon size={14} strokeWidth={4} /> : <PlusIcon size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECCIÓN 3: BEBIDAS */}
            <div className="space-y-4 pb-8">
              <h3 className="text-xs font-black text-[#1a2e05] uppercase italic tracking-widest">Hidratación MVP</h3>
              <div className="grid grid-cols-2 gap-3">
                {listaBebidas.map((bebida) => {
                  const isSelected = selectedExtras.find((e) => e.id === bebida.id);
                  return (
                    <div 
                      key={bebida.id} 
                      onClick={() => toggleExtra(bebida)}
                      className={`relative cursor-pointer border-2 rounded-[2rem] p-4 transition-all flex items-center gap-4 ${
                        isSelected ? "border-emerald-500 bg-emerald-50 shadow-lg" : "border-slate-50 bg-white"
                      }`}
                    >
                      <img src={bebida.imagen} className="h-14 w-14 object-contain rounded-xl" alt={bebida.nombre} />
                      <div className="flex-1">
                        <p className="text-[10px] font-black uppercase text-[#1a2e05]">{bebida.nombre}</p>
                        <p className="text-xs text-emerald-600 font-black italic">+{currency}{bebida.precio}</p>
                      </div>
                      <div className={`shrink-0 size-6 rounded-full flex items-center justify-center ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100"}`}>
                        {isSelected ? <CheckIcon size={14} strokeWidth={4} /> : <PlusIcon size={14} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🛒 FOOTER DE ACCIÓN FIJO (OPCIONALMENTE) */}
            <div className="sticky bottom-4 left-0 w-full bg-white/80 backdrop-blur-md p-4 rounded-[2.5rem] border border-slate-100 shadow-2xl flex items-center gap-4 z-20">
              {cart[productId] ? (
                <div className="flex-1 flex items-center justify-between px-2">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-emerald-600 italic">En tu carrito</span>
                      <Counter productId={productId} />
                   </div>
                   <button 
                    onClick={() => navigate("/cart")}
                    className="bg-[#1a2e05] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs italic tracking-widest hover:bg-black transition-all"
                   >
                     Ver Carrito
                   </button>
                </div>
              ) : (
                <button
                  onClick={addToCartHandler}
                  className="w-full bg-[#1a2e05] text-white py-5 rounded-2xl font-black uppercase italic tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-emerald-900/10"
                >
                  Confirmar Jugada • {currency}{precioTotal.toFixed(2)}
                </button>
              )}
            </div>

            {/* CONFIANZA */}
            <div className="flex justify-center gap-8 py-4 opacity-50">
               <div className="flex flex-col items-center gap-1">
                  <Clock size={16} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Entrega Veloz</span>
               </div>
               <div className="flex flex-col items-center gap-1">
                  <ShieldCheck size={16} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Pago Seguro</span>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;