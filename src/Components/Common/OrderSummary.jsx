import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, CheckCircle, Loader2, Zap, CreditCard, Wallet, MapPin, Ticket, ReceiptText, User, Info } from "lucide-react";
import { supabase } from "../../services/supabase";
import { clearCart } from "../../features/cart/cartSlice";
import toast from "react-hot-toast";

import MercadoPagoModal from "./MercadoPagoModal"; 
import AddressModal from "./AddressModal";

const OrderSummary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [mostrarPasarela, setMostrarPasarela] = useState(false); 
    const [isLoading, setIsLoading] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [contactInfo, setContactInfo] = useState({ name: "", phone: "" });
    const [currentUser, setCurrentUser] = useState(null);
    const [userPoints, setUserPoints] = useState(0); 
    const [usePoints, setUsePoints] = useState(false); 
    const [metodoPago, setMetodoPago] = useState("efectivo"); 
    
    const cartItems = useSelector((state) => state?.cart?.cartItems) || [];

    const MINIMUN_POINTS_TO_REDEEM = 50; 

    useEffect(() => {
        const loadUserContext = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
                setContactInfo(prev => ({ ...prev, name: user.user_metadata?.full_name || "" }));
                const { data: profile } = await supabase.from('profiles').select('points').eq('id', user.id).single();
                if (profile) setUserPoints(profile.points || 0);
                const { data: addr } = await supabase.from('direcciones').select('*').eq('user_id', user.id);
                if (addr) setSavedAddresses(addr);
            }
        };
        loadUserContext();
    }, []);

    const { subtotal, envio, descuentoPuntos, totalFinal, puntosAGanar } = useMemo(() => {
        const sub = cartItems.reduce((acc, item) => acc + (Number(item.precio) * Number(item.quantity)), 0);
        const env = sub > 0 ? 40 : 0;
        const canUsePoints = usePoints && userPoints >= MINIMUN_POINTS_TO_REDEEM;
        const desc = canUsePoints ? Math.min(sub, userPoints) : 0; 
        const total = (sub + env) - desc;
        const ganancia = Math.floor(sub * 0.05); 

        return { subtotal: sub, envio: env, descuentoPuntos: desc, totalFinal: total, puntosAGanar: ganancia };
    }, [cartItems, usePoints, userPoints]);

    const actualizarPuntosUsuario = async () => {
        const nuevosPuntos = (userPoints - descuentoPuntos) + puntosAGanar;
        await supabase.from('profiles').update({ points: nuevosPuntos }).eq('id', currentUser.id);
    };

    const handlePagoExitoso = async () => {
        try {
            const { error } = await supabase.from('pedidos_v2').insert([{
                customer_id: currentUser?.id,
                cliente_nombre: contactInfo.name,
                cliente_telefono: contactInfo.phone,
                direccion_entrega: `${selectedAddress.label}: ${selectedAddress.address}`,
                productos: cartItems.map(i => ({ nombre: i.nombre, cantidad: i.quantity })),
                total: totalFinal,
                metodo_pago: "Tarjeta (Mercado Pago)",
                estado: "pagado",
                puntos_usados: descuentoPuntos,
                puntos_generados: puntosAGanar
            }]);
            if (error) throw error;
            await actualizarPuntosUsuario();
            dispatch(clearCart());
            setMostrarPasarela(false);
            setOrderConfirmed(true);
            toast.success("¡Pago aprobado!");
        } catch (e) {
            toast.error("Error al registrar pedido: " + e.message);
        }
    };

    const handlePedidoEfectivo = async () => {
        if (!selectedAddress) return toast.error("Selecciona una dirección.");
        if (!contactInfo.phone) return toast.error("Ingresa un teléfono.");
        setIsLoading(true);
        try {
            const { error } = await supabase.from('pedidos_v2').insert([{
                customer_id: currentUser?.id,
                cliente_nombre: contactInfo.name,
                cliente_telefono: contactInfo.phone,
                direccion_entrega: `${selectedAddress.label}: ${selectedAddress.address}`,
                productos: cartItems.map(i => ({ nombre: i.nombre, cantidad: i.quantity })),
                total: totalFinal,
                metodo_pago: "Efectivo",
                estado: "pendiente",
                puntos_usados: descuentoPuntos,
                puntos_generados: puntosAGanar
            }]);
            if (error) throw error;
            await actualizarPuntosUsuario();
            dispatch(clearCart());
            setOrderConfirmed(true);
        } catch (e) {
            toast.error("Error: " + e.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (orderConfirmed) return (
        <div className="w-full max-w-md mx-auto bg-white p-12 rounded-[4rem] shadow-2xl text-center border-4 border-emerald-500 animate-in zoom-in duration-500">
            <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-emerald-600" size={60} />
            </div>
            <h2 className="text-4xl font-[1000] uppercase italic text-[#1a2e05] leading-none mb-2">¡RECIBIDO!</h2>
            <p className="text-slate-400 font-bold uppercase text-xs italic mb-8">Tu pedido Wingool está en la cocina</p>
            <div className="bg-[#1a2e05] p-6 rounded-[2.5rem] mb-8 transform -rotate-2 text-center">
                <p className="text-emerald-400 font-[1000] italic uppercase text-lg leading-none">+{puntosAGanar} POINTS</p>
                <p className="text-white text-[8px] font-bold uppercase tracking-widest mt-1">Sumados a tu cuenta</p>
            </div>
            <button onClick={() => navigate('/mi-cuenta')} className="w-full bg-[#1a2e05] text-white py-6 rounded-[2rem] font-[1000] uppercase italic hover:bg-emerald-600 transition-all shadow-xl active:scale-95">REVISAR STATUS</button>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto bg-white p-8 rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 space-y-6 relative">
            {mostrarPasarela && ( <MercadoPagoModal total={totalFinal} onClose={() => setMostrarPasarela(false)} onSuccess={handlePagoExitoso} /> )}

            {/* HEADER */}
            <div className="flex items-center justify-between px-2">
                <div>
                    <h2 className="text-3xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter">CHECKOUT</h2>
                    <div className="h-1.5 w-12 bg-emerald-500 rounded-full mt-1" />
                </div>
                <div className="bg-slate-50 p-3 rounded-3xl border border-slate-100 flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-[7px] font-black text-slate-400 uppercase italic leading-none">Tu Balance</p>
                        <p className="text-sm font-[1000] text-[#1a2e05] italic">{userPoints} PTS</p>
                    </div>
                    <div className="bg-emerald-500 p-2 rounded-2xl text-white">
                        <Ticket size={18} />
                    </div>
                </div>
            </div>

            {/* 1. COMANDA */}
            <div className="bg-slate-50 rounded-[2.5rem] p-6 space-y-3 shadow-inner border border-slate-100/50">
                <div className="flex items-center gap-2 mb-2">
                    <ReceiptText size={18} className="text-emerald-500" />
                    <p className="text-[10px] font-black uppercase italic tracking-widest text-[#1a2e05]">Detalle de Comanda</p>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {cartItems.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] font-[1000] uppercase italic text-[#1a2e05]">
                            <span className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm">{item.quantity}x {item.nombre}</span>
                            <span className="text-slate-400 font-bold">${item.precio * item.quantity}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 2. ENTREGA */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <MapPin size={16} className="text-emerald-500" />
                    <p className="text-[10px] font-black uppercase italic text-slate-400">Datos de Entrega</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <User size={12} className="absolute left-4 top-4 text-slate-300" />
                        <input className="w-full bg-slate-50 rounded-2xl p-4 pl-10 text-[10px] font-[1000] outline-none border-2 border-transparent focus:border-emerald-500 transition-all uppercase" placeholder="NOMBRE" value={contactInfo.name} onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})} />
                    </div>
                    <div className="relative">
                        <Zap size={12} className="absolute left-4 top-4 text-slate-300" />
                        <input className="w-full bg-slate-50 rounded-2xl p-4 pl-10 text-[10px] font-[1000] outline-none border-2 border-transparent focus:border-emerald-500 transition-all" placeholder="WHATSAPP" value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} />
                    </div>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 px-1 custom-scrollbar">
                    {savedAddresses.map((addr) => (
                        <button key={addr.id} onClick={() => setSelectedAddress(addr)} className={`shrink-0 p-4 rounded-[2rem] border-4 w-36 text-left transition-all ${selectedAddress?.id === addr.id ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105' : 'border-slate-50 bg-slate-50 opacity-60 hover:opacity-100'}`}>
                            <p className="font-[1000] text-[10px] uppercase text-[#1a2e05] truncate">{addr.label}</p>
                            <p className="text-[8px] text-slate-400 truncate italic font-bold uppercase leading-tight">{addr.address}</p>
                        </button>
                    ))}
                    <button onClick={() => setShowAddressModal(true)} className="shrink-0 w-12 h-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-all">+</button>
                </div>
            </div>

            {/* 3. PUNTOS */}
            <button 
                onClick={() => userPoints >= MINIMUN_POINTS_TO_REDEEM && setUsePoints(!usePoints)}
                className={`w-full p-4 rounded-[2.5rem] border-2 border-dashed flex items-center justify-between transition-all duration-300 ${usePoints ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 opacity-80'}`}
            >
                <div className="flex items-center gap-3 text-left">
                    <div className={`p-2 rounded-xl transition-all ${usePoints ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                        <Ticket size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-[1000] uppercase text-[#1a2e05] italic leading-none">Usar Wingool Points</p>
                        <p className={`text-[8px] font-bold uppercase mt-1 ${userPoints < MINIMUN_POINTS_TO_REDEEM ? 'text-amber-500' : 'text-slate-400'}`}>
                            {userPoints < MINIMUN_POINTS_TO_REDEEM ? `Mínimo ${MINIMUN_POINTS_TO_REDEEM} pts` : `Disponibles: ${userPoints} pts`}
                        </p>
                    </div>
                </div>
                <div className={`w-10 h-5 rounded-full p-1 transition-all ${usePoints ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-all transform ${usePoints ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
            </button>

            {/* 4. TOTAL BOX (CORREGIDO SEGÚN IMAGEN) */}
            <div className="mx-1 bg-[#1a2e05] rounded-[3.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                {/* Círculo decorativo de la imagen */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                
                <div className="space-y-4 relative z-10">
                    <div className="space-y-2 border-b border-white/10 pb-4">
                        <div className="flex justify-between items-center text-[10px] font-[1000] text-white/40 uppercase italic tracking-widest">
                            <span>SUBTOTAL COMANDA</span>
                            <span className="text-white/80">${subtotal}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-[1000] text-white/40 uppercase italic tracking-widest">
                            <span>ENVÍO WINGOOL</span>
                            <span className="text-white/80">${envio}</span>
                        </div>
                        {usePoints && (
                            <div className="flex justify-between items-center text-[10px] font-[1000] text-emerald-400 uppercase italic tracking-widest animate-pulse">
                                <span className="flex items-center gap-1"><Ticket size={10}/> DESCUENTO PUNTOS</span>
                                <span>-${descuentoPuntos}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <div className="flex flex-col">
                            <span className="text-emerald-400 font-[1000] italic uppercase text-xs leading-none">TOTAL FINAL</span>
                            <span className="text-[10px] font-black text-white/30 uppercase mt-1">IVA INCLUIDO</span>
                        </div>
                        <span className="text-5xl font-[1000] italic tracking-tighter leading-none">${totalFinal}</span>
                    </div>
                </div>
            </div>

            {/* 5. MÉTODOS Y ACCIÓN */}
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setMetodoPago("efectivo")} className={`p-4 rounded-[2rem] border-4 flex flex-col items-center gap-1 transition-all active:scale-95 ${metodoPago === "efectivo" ? "border-emerald-500 bg-emerald-50" : "border-slate-50 opacity-40"}`}>
                        <Wallet size={24} className={metodoPago === "efectivo" ? "text-emerald-500" : "text-slate-400"} />
                        <span className="text-[9px] font-[1000] uppercase italic text-[#1a2e05]">Efectivo</span>
                    </button>
                    <button onClick={() => setMetodoPago("tarjeta")} className={`p-4 rounded-[2rem] border-4 flex flex-col items-center gap-1 transition-all active:scale-95 ${metodoPago === "tarjeta" ? "border-emerald-500 bg-emerald-50" : "border-slate-50 opacity-40"}`}>
                        <CreditCard size={24} className={metodoPago === "tarjeta" ? "text-emerald-500" : "text-slate-400"} />
                        <span className="text-[9px] font-[1000] uppercase italic text-[#1a2e05]">Tarjeta</span>
                    </button>
                </div>

                <button 
                    onClick={() => {
                        if (!selectedAddress) return toast.error("Selecciona una dirección");
                        metodoPago === "tarjeta" ? setMostrarPasarela(true) : handlePedidoEfectivo();
                    }} 
                    disabled={isLoading || cartItems.length === 0} 
                    className="w-full bg-[#1a2e05] text-white py-6 rounded-[2.5rem] font-[1000] uppercase italic flex items-center justify-center gap-4 transition-all hover:bg-emerald-600 shadow-xl active:scale-95 disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                        <>
                            <Zap size={20} fill="currentColor" className="text-emerald-400" />
                            <span>{metodoPago === "tarjeta" ? "PAGAR JUGADA" : "CONFIRMAR PEDIDO"}</span>
                        </>
                    )}
                </button>
            </div>

            {showAddressModal && (
                <AddressModal onClose={() => setShowAddressModal(false)} onAddressAdded={(newAddr) => { setSavedAddresses(prev => [...prev, newAddr]); setSelectedAddress(newAddr); }} userId={currentUser?.id} />
            )}
        </div>
    );
};

export default OrderSummary;