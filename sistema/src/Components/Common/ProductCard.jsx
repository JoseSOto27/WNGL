import React from "react";
import { StarIcon, Zap, Flame, Check, Trophy, ArrowRight, Settings2 } from "lucide-react"; // Agregamos Settings2
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../features/cart/cartSlice";
import { useNotify } from "../../hook/useNotify";

const ProductCard = ({ product }) => {
  const currency = "$";
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems) || [];
  const notify = useNotify();

  // --- NORMALIZACIÓN DE DATOS WINGOOL ---
  const displayNombre = product.nombre || product.name || "PRODUCTO";
  const displayImagen = product.imagen_url || product.image || (product.images && product.images[0]) || "/default-image.png";
  const productId = product.id;
  const categoria = (product.categoria || "").toUpperCase().trim();

  // 🚨 REGLA DE NEGOCIO: Alitas y Boneless requieren configuración
  const requiereConfiguracion = categoria === "ALITAS" || categoria === "BONELESS";

  const isInCart = cartItems.some(item => String(item.id).split('-')[0] === String(productId));

  const precioOriginal = Number(product.precio_original) || 0;
  const precioOferta = Number(product.precio_oferta) || 0;
  const hasOffer = precioOferta > 0 && precioOferta < precioOriginal;
  const precioActual = hasOffer ? precioOferta : precioOriginal;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (requiereConfiguracion) {
      notify.success("¡Excelente elección! Personaliza tu jugada.");
      navigate(`/product/${productId}`);
      return;
    }

    dispatch(addToCart({ 
      ...product,
      id: productId,
      nombre: displayNombre,
      imagen_url: displayImagen,
      precio: precioActual,
      quantity: 1,
      extras: []
    }));
    
    notify.success("¡Jugada en canasta!");
  };

  return (
    <div className="bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100 group relative flex flex-col h-full font-sans">
      <Link to={`/product/${product.id}`} className="no-underline flex-grow">
        
        {/* BADGES SUPERIORES */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            {hasOffer && !requiereConfiguracion && ( // No mostramos oferta si requiere configuración para no confundir
            <div className="bg-red-500 text-white text-[8px] font-[1000] px-3 py-1 rounded-full flex items-center gap-1 shadow-lg italic uppercase tracking-wider">
                <Flame size={10} fill="currentColor" /> OFERTA
            </div>
            )}
            
            <div className="bg-[#1a2e05] text-emerald-400 text-[8px] font-[1000] px-3 py-1 rounded-full flex items-center gap-1 shadow-lg border border-white/10 italic uppercase tracking-wider animate-bounce-slow">
                <Trophy size={10} fill="currentColor" /> Best Seller
            </div>
        </div>

        {/* CONTENEDOR IMAGEN */}
        <div className="bg-slate-50/50 rounded-[1.8rem] h-40 flex items-center justify-center overflow-hidden relative group-hover:bg-emerald-50/50 transition-colors">
          <img
            src={displayImagen}
            alt={displayNombre}
            className="h-28 w-auto object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
          />
        </div>

        <div className="mt-4 px-2">
          {/* RATING DE ESTRELLAS */}
          <div className="flex gap-0.5 mb-2">
            {[...Array(5)].map((_, i) => (
                <StarIcon key={i} size={10} fill="#10b981" className="text-emerald-500" />
            ))}
          </div>

          <h3 className="text-[11px] font-[1000] text-[#1a2e05] uppercase italic leading-tight tracking-tighter w-full mb-3">
            {displayNombre}
          </h3>
          
          <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent mb-3"></div>

          {/* SECCIÓN PRECIO CONDICIONAL */}
          <div className="flex items-baseline gap-2 mb-2 min-h-[24px]">
             {requiereConfiguracion ? (
               <div className="flex items-center gap-1.5 text-emerald-600 animate-pulse">
                 <Settings2 size={12} strokeWidth={3} />
                 <span className="text-[9px] font-[1000] uppercase italic tracking-tighter">
                   PRECIO SEGÚN TAMAÑO
                 </span>
               </div>
             ) : (
               <>
                 <span className="text-xl font-[1000] text-[#1a2e05] italic tracking-tighter leading-none">
                    {currency}{precioActual.toFixed(0)}
                 </span>
                 {hasOffer && (
                    <span className="text-[10px] text-slate-300 line-through font-bold italic">
                      {currency}{precioOriginal.toFixed(0)}
                    </span>
                 )}
               </>
             )}
          </div>
        </div>
      </Link>

      <div className="mt-auto px-1">
        {!isInCart ? (
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-xl font-[1000] uppercase text-[10px] tracking-[0.2em] italic flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md group/btn ${
              requiereConfiguracion 
              ? "bg-emerald-500 text-[#1a2e05] hover:bg-emerald-400" 
              : "bg-[#1a2e05] text-white hover:bg-emerald-600"
            }`}
          >
            {requiereConfiguracion ? (
              <>
                <ArrowRight size={14} strokeWidth={3} />
                PERSONALIZAR
              </>
            ) : (
              <>
                <Zap size={14} fill="currentColor" className="text-emerald-400 group-hover/btn:text-white transition-colors" />
                FICHAR
              </>
            )}
          </button>
        ) : (
          <div className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-xl font-[1000] uppercase text-[9px] tracking-[0.15em] italic flex items-center justify-center gap-2 border border-emerald-100 shadow-inner">
            <Check size={14} strokeWidth={4} />
            EN LA CANASTA
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ProductCard;