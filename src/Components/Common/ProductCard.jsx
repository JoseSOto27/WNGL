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

  // ⭐ Rating con color esmeralda Wingool
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
    <div className="bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group relative">
      <Link to={`/product/${product.id}`} className="no-underline">
        
        {/* BADGE DE OFERTA */}
        {hasOffer && (
          <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
            <Flame size={12} fill="currentColor" /> OFERTA
          </div>
        )}

        {/* CONTENEDOR DE IMAGEN */}
        <div className="bg-slate-50 rounded-[2rem] h-48 flex items-center justify-center overflow-hidden relative group-hover:bg-emerald-50 transition-colors">
          <img
            src={product.images?.[0] || "/default-image.png"}
            alt={product.name}
            className="h-32 w-auto object-contain drop-shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500"
          />
        </div>

        {/* INFO DEL PRODUCTO */}
        <div className="mt-4 px-2 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-black text-[#1a2e05] uppercase italic leading-none tracking-tighter max-w-[70%]">
              {product.name}
            </h3>
            <div className="text-right">
              {hasOffer && (
                <p className="text-[10px] text-slate-400 line-through font-bold">
                  {currency}{precioOriginal.toFixed(2)}
                </p>
              )}
              <p className="text-lg font-black text-[#1a2e05] leading-none italic">
                {currency}{precioActual.toFixed(2)}
              </p>
            </div>
          </div>

          {/* RATING Y CATEGORÍA (Simulada) */}
          <div className="flex items-center justify-between">
            <div className="flex gap-0.5">
              {Array(5).fill("").map((_, index) => (
                <StarIcon
                  key={index}
                  size={12}
                  className="transition-colors"
                  fill={rating >= index + 1 ? "#10b981" : "#E2E8F0"}
                  stroke="none"
                />
              ))}
            </div>
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
              Best Seller
            </span>
          </div>
        </div>
      </Link>

      {/* BOTÓN DE ACCIÓN */}
      <div className="mt-4 px-2 pb-2">
        {!cart[productId] ? (
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#1a2e05] text-white py-3 rounded-2xl font-black uppercase text-[10px] tracking-[0.15em] flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all active:scale-95 shadow-lg shadow-slate-200"
          >
            <ShoppingCart size={14} strokeWidth={3} />
            Agregar
          </button>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-1 border border-slate-100">
             <Counter productId={productId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;