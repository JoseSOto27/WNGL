import React, { useEffect, useState } from "react";
import { Trash2Icon, ShoppingBag, ArrowLeft, Star, Flame, Loader2, User, Zap, Plus, Minus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../services/supabase"; 
import { addToCart, removeFromCart, deleteItemFromCart } from "../features/cart/cartSlice";
import OrderSummary from "../Components/Common/OrderSummary";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const currency = "$";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- SELECTORES REDUX ---
  const cartItems = useSelector((state) => state?.cart?.cartItems) || [];
  
  // --- ESTADOS LOCALES ---
  const [session, setSession] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const total = cartItems.reduce((acc, item) => {
      const precioUnitario = Number(item.precio) || 0;
      const cantidad = Number(item.quantity) || 0;
      return acc + (precioUnitario * cantidad);
    }, 0);

    setTotalPrice(total);
    setIsInitializing(false);
  }, [cartItems]);

  if (isInitializing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
        <Loader2 className="animate-spin text-emerald-500" size={40} />
        <p className="text-[10px] font-[1000] uppercase italic tracking-[0.3em] text-[#1a2e05]">REVISANDO ALINEACIÓN...</p>
      </div>
    );
  }

  return cartItems.length > 0 ? (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-10 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER TACTICAL */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-[1000] text-[10px] uppercase tracking-[0.4em] mb-2 italic">
               <Zap size={14} fill="currentColor" /> Tu Alineación Actual
            </div>
            <h1 className="text-5xl md:text-6xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
              MI <span className="text-emerald-600">CARRITO</span>
            </h1>
          </div>
          <Link to="/shop" className="flex items-center gap-2 text-slate-400 font-[1000] text-[10px] uppercase tracking-widest hover:text-emerald-600 transition-all border-none no-underline italic">
            <ArrowLeft size={14} strokeWidth={3} /> SEGUIR FICHANDO
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* COLUMNA PRODUCTOS */}
          <div className="lg:col-span-8 space-y-6">
            {cartItems.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-8 group hover:shadow-xl transition-all duration-500"
              >
                {/* IMAGEN DEL PRODUCTO */}
                <div className="bg-slate-50 rounded-[2rem] size-28 flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-emerald-50 transition-colors border border-slate-100/50 shadow-inner">
                  <img 
                    src={item.imagen_url || "/default-image.png"} 
                    className="h-20 w-auto object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" 
                    alt={item.nombre} 
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  {/* NOMBRE CON TIPOGRAFÍA WINGOOL */}
                  <h3 className="text-xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none mb-2">
                    {item.nombre || "PRODUCTO SIN NOMBRE"}
                  </h3>
                  
                  {/* --- SECCIÓN DE SABOR Y EXTRAS --- */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mb-4">
                    {/* ETIQUETA DE SALSA (NUEVA) */}
                    {item.salsa && (
                      <span className="text-[8px] bg-orange-500 text-white px-2 py-1 rounded-lg font-black uppercase italic border border-orange-600 shadow-lg shadow-orange-200/50 flex items-center gap-1">
                        <Zap size={10} fill="currentColor" /> SABOR: {item.salsa}
                      </span>
                    )}

                    {/* TUS EXTRAS ORIGINALES (SIN MODIFICAR) */}
                    {item.extras && item.extras.length > 0 && (
                      item.extras.map((ex) => (
                        <span key={ex.id} className="text-[8px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg font-black uppercase italic border border-emerald-100/50">
                          + {ex.nombre}
                        </span>
                      ))
                    )}
                  </div>

                  <div>
                    <span className="text-emerald-600 font-[1000] text-xl italic tracking-tighter">
                      {currency}{Number(item.precio || 0).toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* CONTROLES DE CANTIDAD */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100 shadow-inner">
                    <button
                      onClick={() => dispatch(removeFromCart({ productId: item.id }))}
                      className="size-9 flex items-center justify-center rounded-xl bg-white text-[#1a2e05] hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 shadow-sm"
                    >
                      <Minus size={16} strokeWidth={3} />
                    </button>
                    
                    <span className="text-xl font-[1000] text-[#1a2e05] italic w-6 text-center">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => dispatch(addToCart(item))}
                      className="size-9 flex items-center justify-center rounded-xl bg-white text-[#1a2e05] hover:bg-emerald-50 hover:text-emerald-500 transition-all active:scale-90 shadow-sm"
                    >
                      <Plus size={16} strokeWidth={3} />
                    </button>
                  </div>
                  
                  <div className="text-right min-w-[100px]">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Subtotal</p>
                    <p className="text-2xl font-[1000] text-[#1a2e05] italic tracking-tighter">
                      {currency}{(Number(item.precio || 0) * Number(item.quantity)).toFixed(0)}
                    </p>
                  </div>

                  <button
                    onClick={() => dispatch(deleteItemFromCart({ productId: item.id }))}
                    className="bg-red-50 text-red-400 p-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                  >
                    <Trash2Icon size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* COLUMNA RESUMEN / LOGIN */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">
            {session ? (
              <div className="bg-white rounded-[3rem] p-2 shadow-2xl border border-slate-100">
                <OrderSummary totalPrice={totalPrice} items={cartItems} />
              </div>
            ) : (
              <div className="bg-[#1a2e05] rounded-[3rem] p-10 text-center text-white shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500 rounded-full blur-[90px] opacity-20"></div>
                <div className="relative z-10">
                  <div className="bg-white/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                    <User className="text-emerald-400" size={40} />
                  </div>
                  <h3 className="text-3xl font-[1000] uppercase italic tracking-tighter leading-none mb-6">
                    ¡ALTO AHÍ, <br /><span className="text-emerald-500 text-4xl">MVP!</span>
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-100/60 uppercase tracking-[0.2em] leading-relaxed mb-10 italic">
                    Necesitas iniciar sesión para procesar tu pedido y ganar puntos.
                  </p>
                  <button 
                    onClick={() => navigate("/admin")}
                    className="w-full bg-emerald-500 text-[#1a2e05] py-5 rounded-[2rem] font-[1000] uppercase italic tracking-[0.2em] text-[12px] hover:bg-white transition-all shadow-xl active:scale-95"
                  >
                    INICIAR SESIÓN AHORA
                  </button>
                </div>
              </div>
            )}
            
            {/* WINGOOL REWARDS */}
            <div className="bg-[#1a2e05] rounded-[2.5rem] p-6 text-white border border-white/5 shadow-xl relative overflow-hidden flex items-center justify-between group">
              <div className="absolute inset-0 bg-emerald-500 translate-x-full group-hover:translate-x-[70%] transition-transform opacity-10 duration-700"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="bg-emerald-500 p-3 rounded-2xl text-[#1a2e05] shadow-lg shadow-emerald-500/20">
                    <Flame size={24} fill="currentColor" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest">WINGOOL REWARDS</span>
                    <span className="text-sm font-[1000] italic uppercase tracking-tighter">Fichajes Ganados</span>
                </div>
              </div>
              <span className="text-3xl font-[1000] text-emerald-500 italic relative z-10">+{Math.floor(totalPrice * 0.05)} <span className="text-[12px]">PTS</span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
      <div className="bg-white p-16 rounded-[5rem] shadow-2xl border border-slate-100 flex flex-col items-center max-w-md">
        <div className="bg-slate-50 p-10 rounded-[3.5rem] mb-8 text-slate-200 border border-slate-100 shadow-inner">
           <ShoppingBag size={80} strokeWidth={1} />
        </div>
        <h2 className="text-4xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter mb-3">BANCA VACÍA</h2>
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest italic mb-10 px-4">Parece que aún no has reclutado ningún platillo a tu equipo.</p>
        <button
          onClick={() => navigate("/shop")}
          className="w-full py-6 bg-[#1a2e05] text-white rounded-[2.2rem] font-[1000] uppercase italic tracking-[0.25em] text-[12px] hover:bg-emerald-600 transition-all active:scale-95 shadow-2xl"
        >
          EXPLORAR EL MENÚ
        </button>
      </div>
    </div>
  );
}