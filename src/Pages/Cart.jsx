import React, { useEffect, useState } from "react";
import { Trash2Icon, ShoppingBag, ArrowLeft, Star, Flame, Loader2, User, Phone } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { deleteItemFromCart } from "../features/cart/cartSlice";
import Counter from "../Components/Common/Counter";
import OrderSummary from "../Components/Common/OrderSummary";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const currency = "$";
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // --- SELECTORES ---
  const cartItems = useSelector((state) => state?.cart?.cartItems) || {};
  const products = useSelector((state) => state?.product?.list) || [];
  
  const [cartArray, setCartArray] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const createCartArray = () => {
      let total = 0;
      const newCartArray = [];

      Object.entries(cartItems).forEach(([key, quantity]) => {
        const product = products.find((item) => String(item.id) === String(key));

        if (product) {
          const pOrig = Number(product.precio_original) || 0;
          const pOfer = Number(product.precio_oferta) || 0;
          const pFinal = (pOfer > 0 && pOfer < pOrig) ? pOfer : pOrig;

          newCartArray.push({
            ...product,
            quantity: Number(quantity) || 0,
            precioFinal: pFinal,
          });

          total += pFinal * (Number(quantity) || 0);
        }
      });

      setCartArray(newCartArray);
      setTotalPrice(total);
      setIsInitializing(false);
    };

    if (products.length > 0) {
      createCartArray();
    } else if (Object.keys(cartItems).length === 0) {
      setIsInitializing(false);
    }
  }, [cartItems, products]);

  const handleDeleteItemFromCart = (productId) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  if (isInitializing) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 italic font-black text-[#1a2e05]">
        <Loader2 className="animate-spin mb-2" /> REVISANDO TU ALINEACIÓN...
      </div>
    );
  }

  return cartArray.length > 0 ? (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-4 sm:px-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER DEL CARRITO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-[0.3em] mb-2 italic">
               <Star size={14} fill="currentColor" /> Tu Alineación Actual
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#1a2e05] uppercase italic tracking-tighter leading-none">
              Mi <span className="text-emerald-600">Carrito</span>
            </h1>
          </div>
          <Link to="/shop" className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-[#1a2e05] transition-colors border-b-2 border-transparent hover:border-[#1a2e05] pb-1">
            <ArrowLeft size={14} /> Seguir Agregando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* COLUMNA IZQUIERDA: PRODUCTOS */}
          <div className="lg:col-span-8 space-y-4">
            {cartArray.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6 group"
              >
                <div className="bg-slate-50 rounded-[2rem] size-28 flex items-center justify-center overflow-hidden shrink-0 group-hover:bg-emerald-50 transition-colors">
                  <img src={item.images?.[0] || "/default-image.png"} className="h-20 w-auto object-contain drop-shadow-lg" alt={item.name} />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-black text-[#1a2e05] uppercase italic tracking-tighter leading-tight">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-1">
                    {item.precio_oferta > 0 && item.precio_oferta < item.precio_original && (
                      <span className="text-[10px] text-slate-300 line-through font-bold">{currency}{Number(item.precio_original).toFixed(2)}</span>
                    )}
                    <span className="text-emerald-600 font-black text-sm italic">{currency}{item.precioFinal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="bg-slate-50 p-1 rounded-2xl border border-slate-100">
                    <Counter productId={item.id} />
                  </div>
                  
                  <div className="text-right min-w-[80px]">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Subtotal</p>
                    <p className="text-lg font-black text-[#1a2e05] italic">
                      {currency}{(item.precioFinal * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDeleteItemFromCart(item.id)}
                    className="bg-red-50 text-red-400 p-3 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
                  >
                    <Trash2Icon size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* COLUMNA DERECHA: RESUMEN DE ORDEN */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="bg-white rounded-[3rem] p-2 shadow-2xl border border-slate-100">
                {/* Aquí el OrderSummary ya debería manejar los inputs con texto negro */}
                <OrderSummary
                  totalPrice={totalPrice}
                  items={cartArray}
                />
            </div>
            
            {/* AVISO DE PUNTOS GANADOS (DEBAJO DEL RESUMEN) */}
            <div className="mt-4 bg-[#1a2e05] rounded-[2rem] p-6 text-white relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flame className="text-emerald-500 animate-pulse" size={20} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-emerald-400">Wingool Rewards</span>
                    <span className="text-xs font-bold italic uppercase tracking-tighter">Ganarás con este pedido</span>
                  </div>
                </div>
                <span className="text-2xl font-black text-emerald-500 italic">+{Math.floor(totalPrice * 0.05)} pts</span>
              </div>
              <div className="absolute right-[-10%] bottom-[-20%] w-24 h-24 bg-emerald-500 rounded-full blur-[40px] opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center">
      <div className="bg-white p-12 rounded-[4rem] shadow-xl border border-slate-100 flex flex-col items-center">
        <div className="bg-slate-50 p-8 rounded-[2.5rem] mb-6 text-slate-200">
           <ShoppingBag size={80} strokeWidth={1} />
        </div>
        <h2 className="text-3xl font-black text-[#1a2e05] uppercase italic tracking-tighter">Banca Vacía</h2>
        <p className="text-slate-400 text-sm font-medium mt-2 max-w-xs mb-8">
          Tu alineación no tiene titulares hoy. ¡Agrega unas alitas brutales para empezar!
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="px-12 py-4 bg-[#1a2e05] text-white rounded-[1.5rem] font-black uppercase italic tracking-widest text-xs hover:bg-emerald-600 transition-all active:scale-95"
        >
          Explorar el Menú
        </button>
      </div>
    </div>
  );

  {/* COLUMNA DERECHA: RESUMEN DE ORDEN */}
<div className="lg:col-span-4 sticky top-28">
  {session ? (
    <div className="bg-white rounded-[3rem] p-2 shadow-2xl border border-slate-100">
      <OrderSummary
        totalPrice={totalPrice}
        items={cartArray}
      />
    </div>
  ) : (
    /* TARJETA DE ACCESO PARA USUARIOS NO LOGGEADOS */
    <div className="bg-[#1a2e05] rounded-[3rem] p-8 text-center text-white shadow-2xl border border-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-20"></div>
      
      <div className="relative z-10">
        <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
          <User className="text-emerald-400" size={32} />
        </div>
        
        <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none mb-4">
          ¡Alto ahí, <span className="text-emerald-500">Campeón!</span>
        </h3>
        
        <p className="text-xs font-bold text-emerald-100/60 uppercase tracking-widest leading-relaxed mb-8">
          Necesitas iniciar sesión para procesar tu pedido y acumular puntos.
        </p>

        <button 
          onClick={() => navigate("/admin")}
          className="w-full bg-emerald-500 text-[#1a2e05] py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs hover:bg-white transition-all shadow-xl"
        >
          Iniciar Sesión Ahora
        </button>
        
        <p className="mt-6 text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
          Wingool Company • Tulancingo
        </p>
      </div>
    </div>
  )}
  
  {/* El aviso de puntos se puede quedar afuera para motivarlos */}
  <div className="mt-4 bg-[#1a2e05] rounded-[2rem] p-6 text-white relative overflow-hidden">
    {/* ... (tu código del banner de puntos que ya tienes) */}
  </div>
</div>
}
