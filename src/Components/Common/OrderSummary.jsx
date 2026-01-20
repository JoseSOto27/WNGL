import React, { useState, useEffect, useMemo } from "react";
import AddressModal from "./AddressModal";
import { 
  ShoppingBag, CheckCircle, Loader2, 
  Coins, User, Phone, Zap, Flame, CreditCard, Wallet, Trophy, Star
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../services/supabase";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";

const OrderSummary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
    const [userPoints, setUserPoints] = useState(0);
    const [usePoints, setUsePoints] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [metodoPago, setMetodoPago] = useState("efectivo"); 
    
    const cartItems = useSelector((state) => state?.cart?.cartItems) || [];
    const currency = "$";

    useEffect(() => {
        const loadInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
                setContactInfo(prev => ({ 
                    ...prev, 
                    email: user.email, 
                    name: user.user_metadata?.full_name || "" 
                }));
                const { data: addr } = await supabase.from('direcciones').select('*').eq('user_id', user.id);
                if (addr) setSavedAddresses(addr);
                const { data: prof } = await supabase.from('profiles').select('points').eq('id', user.id).single();
                if (prof) setUserPoints(prof.points || 0);
            }
        };
        loadInitialData();
    }, []);

    const { subtotal, envio, totalOriginal, productosDetallados, descuentoPuntos, totalFinal, puntosAGanar } = useMemo(() => {
        let sub = 0;
        let detallados = [];
        cartItems.forEach((item) => {
            const pFinal = Number(item.precio) || 0;
            const quantity = Number(item.quantity) || 0;
            const itemTotal = pFinal * quantity;
            sub += itemTotal;
            detallados.push({
                id: item.id,
                nombre: item.nombre || item.name, 
                precio_unitario: pFinal,
                cantidad: quantity,
                total: itemTotal,
                imagen: item.imagen_url || item.image || "/default-image.png",
                extras: item.extras || []
            });
        });
        const costEnvio = 40;
        const totalBase = sub + costEnvio;
        const valorPuntosEnPesos = userPoints / 10;
        const descuento = usePoints ? Math.min(valorPuntosEnPesos, totalBase) : 0;
        const final = totalBase - descuento;
        const puntosNuevos = Math.floor(final * 0.05);
        return { 
            subtotal: sub, envio: costEnvio, totalOriginal: totalBase,
            productosDetallados: detallados, descuentoPuntos: descuento,
            totalFinal: final, puntosAGanar: puntosNuevos
        };
    }, [cartItems, userPoints, usePoints]);

    const handlePlaceOrder = async () => {
        if (!currentUser) { navigate("/admin"); return; }
        if (!selectedAddress || !contactInfo.phone || !contactInfo.name) {
            toast.error("Completa los datos de envío.");
            return;
        }
        setIsLoading(true);
        try {
            const pedidoData = {
                customer_id: currentUser.id,
                cliente_nombre: contactInfo.name,
                cliente_email: contactInfo.email,
                cliente_telefono: contactInfo.phone,
                direccion_entrega: `${selectedAddress.label}: ${selectedAddress.address}`,
                productos: productosDetallados,
                subtotal, envio, total: totalFinal,
                puntos_usados: usePoints ? Math.floor(descuentoPuntos * 10) : 0,
                puntos_generados: puntosAGanar,
                metodo_pago: totalFinal === 0 ? "Pagado con Puntos" : metodoPago,
                estado: "pendiente"
            };
            const { error: pedidoErr } = await supabase.from('pedidos_v2').insert([pedidoData]);
            if (pedidoErr) throw pedidoErr;
            const puntosRestantes = usePoints ? (userPoints - Math.floor(descuentoPuntos * 10)) : userPoints;
            const puntosFinales = Math.floor(puntosRestantes + puntosAGanar);
            await supabase.from('profiles').update({ points: puntosFinales }).eq('id', currentUser.id);
            dispatch(clearCart());
            setOrderConfirmed(true);
        } catch (error) { toast.error(error.message); } finally { setIsLoading(false); }
    };

    if (orderConfirmed) {
        return (
            <div className="w-full max-w-md mx-auto bg-white p-12 rounded-[4rem] shadow-2xl text-center border-4 border-emerald-500 animate-in zoom-in">
                <CheckCircle className="text-emerald-500 mx-auto mb-6" size={70} />
                <h2 className="text-3xl font-[1000] uppercase italic tracking-tighter text-[#1a2e05]">¡EN LA CANCHA!</h2>
                <div className="bg-[#1a2e05] p-6 rounded-[2.5rem] my-8 text-white relative overflow-hidden">
                    <p className="text-4xl font-[1000] italic">+{puntosAGanar} PTS</p>
                </div>
                <button onClick={() => navigate('/mi-cuenta')} className="w-full bg-[#1a2e05] text-white py-5 rounded-[2rem] font-[1000] uppercase italic text-xs tracking-widest">MIS PEDIDOS</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white p-7 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-6 font-sans">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-[1000] text-[#1a2e05] uppercase italic flex items-center gap-3 tracking-tighter">
                    <ShoppingBag className="text-emerald-600" size={28} /> RESUMEN
                </h2>
                <Zap className="text-emerald-500" fill="currentColor" size={20} />
            </div>

            {/* PRODUCTOS */}
            <div className="bg-slate-50 rounded-[2.2rem] p-5 border border-slate-100 shadow-inner">
                <div className="max-h-44 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {productosDetallados.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <img src={item.imagen} className="h-10 w-10 object-contain drop-shadow-sm" alt="" />
                                <div>
                                    <p className="text-[12px] font-[1000] text-[#1a2e05] uppercase italic leading-none">{item.cantidad}x {item.nombre}</p>
                                    {item.extras.length > 0 && <p className="text-[9px] text-emerald-600 font-black uppercase mt-1 tracking-widest">+{item.extras.length} EXTRAS</p>}
                                </div>
                            </div>
                            <span className="text-md font-[1000] text-[#1a2e05] italic tracking-tight">${item.total.toFixed(0)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* PAGO */}
            <div className="space-y-2 px-2">
                <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-[0.2em]">FORMA DE PAGO</p>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setMetodoPago("efectivo")} className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-4 transition-all ${metodoPago === "efectivo" ? "border-emerald-500 bg-emerald-50 text-[#1a2e05] shadow-md scale-105" : "border-slate-50 bg-slate-50 text-slate-300"}`}>
                        <Wallet size={20} /><span className="text-[11px] font-[1000] uppercase italic">Efectivo</span>
                    </button>
                    <button onClick={() => setMetodoPago("tarjeta")} className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-4 transition-all ${metodoPago === "tarjeta" ? "border-emerald-500 bg-emerald-50 text-[#1a2e05] shadow-md scale-105" : "border-slate-50 bg-slate-50 text-slate-300"}`}>
                        <CreditCard size={20} /><span className="text-[11px] font-[1000] uppercase italic">Tarjeta</span>
                    </button>
                </div>
            </div>

            {/* WALLET */}
            {userPoints > 0 && (
                <div className={`p-4 rounded-[2.2rem] border-4 transition-all flex justify-between items-center shadow-md ${usePoints ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-white'}`}>
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500 p-3 rounded-2xl text-white">
                            <Coins size={18} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase leading-none italic tracking-widest">Wingool Wallet</p>
                            <p className="font-[1000] text-[#1a2e05] text-[13px] uppercase italic">{userPoints} pts <span className="text-emerald-600">(${ (userPoints/10).toFixed(0) })</span></p>
                        </div>
                    </div>
                    <button onClick={() => setUsePoints(!usePoints)} className={`px-4 py-2 rounded-xl text-[10px] font-[1000] uppercase italic ${usePoints ? 'bg-[#1a2e05] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {usePoints ? 'QUITAR' : 'USAR'}
                    </button>
                </div>
            )}

            {/* CONTACTO */}
            <div className="grid grid-cols-2 gap-3">
                <input className="w-full bg-slate-50 rounded-2xl p-4 text-[11px] font-[1000] text-[#1a2e05] uppercase italic outline-none border-2 border-transparent focus:border-emerald-500 shadow-inner" placeholder="NOMBRE" value={contactInfo.name} onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})} />
                <input className="w-full bg-slate-50 rounded-2xl p-4 text-[11px] font-[1000] text-[#1a2e05] outline-none border-2 border-transparent focus:border-emerald-500 shadow-inner" placeholder="TELÉFONO" value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} />
            </div>

            {/* DIRECCIONES */}
            <div className="space-y-2">
                <div className="flex justify-between px-3">
                    <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-widest">CAMPO DE ENTREGA</p>
                    <button onClick={() => setShowAddressModal(true)} className="text-emerald-600 font-black text-[10px] uppercase underline">+ Nueva</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar px-1">
                    {savedAddresses.map((addr) => (
                        <button key={addr.id} onClick={() => setSelectedAddress(addr)} className={`shrink-0 p-4 rounded-[1.8rem] border-4 w-36 text-left transition-all ${selectedAddress?.id === addr.id ? 'border-emerald-500 bg-emerald-50 shadow-lg scale-105' : 'border-slate-50 bg-slate-50'}`}>
                            <p className="font-[1000] text-[10px] uppercase text-[#1a2e05] truncate leading-none mb-1">{addr.label}</p>
                            <p className="text-[8px] text-slate-400 truncate italic font-bold">{addr.address}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* TOTALES CON ENVÍO DESGLOSADO */}
            <div className="pt-4 border-t-4 border-slate-100 space-y-2 px-2">
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase italic tracking-widest">
                    <span>SUBTOTAL</span>
                    <span>${subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase italic tracking-widest">
                    <span>ENVÍO (TARIFA FIJA)</span>
                    <span>$40</span>
                </div>
                {usePoints && (
                    <div className="flex justify-between text-[11px] font-black text-emerald-600 uppercase italic tracking-widest">
                        <span>✨ DESCUENTO WALLET</span>
                        <span>-${descuentoPuntos.toFixed(0)}</span>
                    </div>
                )}
                
                <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[2rem] border border-slate-100 my-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 italic flex items-center gap-1">
                        <Flame size={14} className="text-emerald-500" fill="currentColor"/> GANAS:
                    </span>
                    <span className="text-lg font-[1000] text-[#1a2e05] italic">+{puntosAGanar} PTS</span>
                </div>
                
                <div className="flex justify-between items-end text-5xl font-[1000] text-[#1a2e05] italic tracking-tighter leading-none pt-2">
                    <span className="text-lg mb-1 tracking-widest">TOTAL</span>
                    <span>${totalFinal.toFixed(0)}</span>
                </div>
            </div>

            {/* BOTÓN FINAL SUTIL */}
            <div className="px-2">
                <button onClick={handlePlaceOrder} disabled={isLoading || !selectedAddress || productosDetallados.length === 0} className="w-full bg-[#1a2e05] text-white py-4 rounded-[1.5rem] font-[1000] uppercase text-sm tracking-[0.15em] italic hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-3 active:scale-95 group">
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <><Zap size={18} fill="currentColor" className="text-emerald-400 group-hover:text-white transition-colors" /><span>ENVIAR JUGADA</span></>}
                </button>
            </div>
        </div>
    );
};

export default OrderSummary;