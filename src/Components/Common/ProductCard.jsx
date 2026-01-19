import React from "react";
import { StarIcon, ShoppingCart, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../features/cart/cartSlice";
import Counter from "./Counter";
import { useNotify } from "../../hook/useNotify";

const ProductCard = ({ product }) => {
  const currency = "$";
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cartItems);
  const notify = useNotify();

  const productId = product.id;

  const rating = product.rating?.length
    ? Math.round(
        product.rating.reduce((acc, curr) => acc + curr.rating, 0) /
          product.rating.length
      )
    : 0;

  const precioOriginal = Number(product.precio_original) || 0;
  const precioOferta = Number(product.precio_oferta) || 0;
  const hasOffer = precioOferta > 0 && precioOferta < precioOriginal;
  const precioActual = hasOffer ? precioOferta : precioOriginal;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (cart[productId]) {
      notify.warning("Ya está en tu alineación (carrito)");
      return;
    }

    dispatch(addToCart({ productId }));
    notify.success("¡Directo al carrito!");
  };

  return (
    // Reduje el redondeo en móvil (rounded-3xl) para ganar espacio visual
    <div className="bg-white rounded-[1.8rem] sm:rounded-[2.5rem] p-3 sm:p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group relative flex flex-col h-full">
      <Link to={`/product/${product.id}`} className="no-underline flex-grow">
        
        {/* BADGE DE OFERTA - Más pequeño en móvil */}
        {hasOffer && (
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10 bg-red-500 text-white text-[8px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
            <Flame size={10} fill="currentColor" /> OFERTA
          </div>
        )}

        {/* CONTENEDOR DE IMAGEN - Altura ajustable */}
        <div className="bg-slate-50 rounded-[1.5rem] sm:rounded-[2rem] h-36 sm:h-48 flex items-center justify-center overflow-hidden relative group-hover:bg-emerald-50 transition-colors">
          <img
            src={product.images?.[0] || "/default-image.png"}
            alt={product.name}
            className="h-24 sm:h-32 w-auto object-contain drop-shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
          />
        </div>

        {/* INFO DEL PRODUCTO */}
        <div className="mt-3 sm:mt-4 px-1 sm:px-2 space-y-2">
          {/* Ajuste de dirección: en móviles muy pequeños el precio baja si el nombre es largo */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-0">
            <h3 className="text-xs sm:text-sm font-black text-[#1a2e05] uppercase italic leading-tight tracking-tighter w-full sm:max-w-[70%]">
              {product.name}
            </h3>
            <div className="text-left sm:text-right">
              {hasOffer && (
                <p className="text-[9px] sm:text-[10px] text-slate-400 line-through font-bold leading-none">
                  {currency}{precioOriginal.toFixed(0)}
                </p>
              )}
              <p className="text-base sm:text-lg font-black text-[#1a2e05] leading-none italic">
                {currency}{precioActual.toFixed(0)}
              </p>
            </div>
          </div>

          {/* RATING Y CATEGORÍA */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-0.5">
              {Array(5).fill("").map((_, index) => (
                <StarIcon
                  key={index}
                  size={10}
                  className="transition-colors"
                  fill={rating >= index + 1 ? "#10b981" : "#E2E8F0"}
                  stroke="none"
                />
              ))}
            </div>
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded-md">
              Top Semanal
            </span>
          </div>
        </div>
      </Link>

      {/* BOTÓN DE ACCIÓN - Padding ajustado para dedos en móvil */}
      <div className="mt-3 sm:mt-4 px-1 sm:px-2 pb-1 sm:pb-2">
        {!cart[productId] ? (
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#1a2e05] text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black uppercase text-[9px] sm:text-[10px] tracking-[0.1em] sm:tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg"
          >
            <ShoppingCart size={13} strokeWidth={3} />
            Agregar
          </button>
        ) : (
          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-1 border border-slate-100">
             <Counter productId={productId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;