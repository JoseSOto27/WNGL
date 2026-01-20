import React, { useState, useEffect, useMemo } from "react";
import AddressModal from "./AddressModal";
import MercadoPagoModal from "./MercadoPagoModal";
import { ShoppingBag, CheckCircle, Loader2, Zap, CreditCard, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../services/supabase";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";
import { initMercadoPago } from '@mercadopago/sdk-react';

// INICIALIZACIÓN FUERA DEL COMPONENTE (Evita bloqueos de página)
initMercadoPago('TEST-5bbf1105-37f9-4dcd-a4f5-2bcd9985c7ea', { locale: 'es-MX' });

const OrderSummary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // Estados de UI
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [mostrarPasarela, setMostrarPasarela] = useState(false); 
    const [isLoading, setIsLoading] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    
    // Estados de Datos
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
    const [userPoints, setUserPoints] = useState(0);
    const [usePoints, setUsePoints] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [metodoPago, setMetodoPago] = useState("efectivo"); 
    
    const cartItems = useSelector((state) => state?.cart?.cartItems) || [];

    // Carga de datos inicial
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

    // Cálculos de la jugada (Memoizado)
    const { subtotal, envio, productosDetallados, descuentoPuntos, totalFinal, puntosAGanar } = useMemo(() => {
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
        const totalBase = sub + 40;
        const descuento = usePoints ? Math.min(userPoints / 10, totalBase) : 0;
        const final = Math.max(0, totalBase - descuento);
        return { 
            subtotal: sub, 
            envio: 40, 
            productosDetallados: detallados, 
            descuentoPuntos: descuento, 
            totalFinal: Number(final.toFixed(2)), 
            puntosAGanar: Math.floor(final * 0.05) 
        };
    }, [cartItems, userPoints, usePoints]);

    // Función para registrar el pedido en Supabase
    const handleFinalizarPedido = async () => {
        if (!selectedAddress) {
            toast.error("Selecciona una dirección de entrega.");
            return;
        }
        if (!contactInfo.phone || contactInfo.phone.length < 10) {
            toast.error("Ingresa un teléfono de contacto válido.");
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.from('pedidos_v2').insert([{
                customer_id: currentUser.id,
                cliente_nombre: contactInfo.name,
                cliente_email: contactInfo.email,
                cliente_telefono: contactInfo.phone,
                direccion_entrega: `${selectedAddress.label}: ${selectedAddress.address}`,
                productos: productosDetallados,
                subtotal, 
                envio, 
                total: totalFinal,
                puntos_usados: usePoints ? Math.floor(descuentoPuntos * 10) : 0,
                puntos_generados: puntosAGanar,
                metodo_pago: totalFinal === 0 ? "Puntos Wallet" : (metodoPago === "tarjeta" ? "Mercado Pago" : "Efectivo"),
                estado: "pendiente"
            }]);

            if (error) throw error;

            // Actualizar Puntos
            const nuevosPuntos = (usePoints ? userPoints - Math.floor(descuentoPuntos * 10) : userPoints) + puntosAGanar;
            await supabase.from('profiles').update({ points: nuevosPuntos }).eq('id', currentUser.id);
            
            dispatch(clearCart());
            setOrderConfirmed(true);
        } catch (e) { 
            toast.error("Error en la jugada: " + e.message); 
        } finally { 
            setIsLoading(false); 
            setMostrarPasarela(false); 
        }
    };

    if (orderConfirmed) return (
        <div className="w-full max-w-md mx-auto bg-white p-12 rounded-[4rem] shadow-2xl text-center border-4 border-emerald-500 animate-in zoom-in">
            <CheckCircle className="text-emerald-500 mx-auto mb-6" size={70} />
            <h2 className="text-3xl font-[1000] uppercase italic text-[#1a2e05] tracking-tighter leading-none">¡PEDIDO <br/><span className="text-emerald-500">CONFIRMADO!</span></h2>
            <div className="bg-[#1a2e05] p-6 rounded-[2.5rem] my-8 text-white relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2">Recompensa Wingool</p>
                <p className="text-4xl font-[1000] italic">+{puntosAGanar} PTS</p>
            </div>
            <button onClick={() => navigate('/mi-cuenta')} className="w-full bg-[#1a2e05] text-white py-5 rounded-[2rem] font-[1000] uppercase italic text-xs tracking-widest hover:bg-emerald-600 transition-colors">VER MIS PEDIDOS</button>
        </div>
    );

    return (
        <div className="w-full max-w-md mx-auto bg-white p-7 rounded-[3.5rem] shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden">
            
            {/* PASARELA AISLADA */}
            {mostrarPasarela && (
                <MercadoPagoModal 
                    total={totalFinal} 
                    onClose={() => setMostrarPasarela(false)} 
                    onSuccess={handleFinalizarPedido} 
                />
            )}

            <div className="flex items-center justify-between px-2">
                <h2 className="text-2xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter">RESUMEN</h2>
                <ShoppingBag size={24} className="text-emerald-500" />
            </div>

            {/* LISTA PRODUCTOS */}
            <div className="bg-slate-50 rounded-[2.2rem] p-5 max-h-40 overflow-y-auto space-y-3 shadow-inner">
                {productosDetallados.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[11px] font-[1000] text-[#1a2e05] uppercase italic">{item.cantidad}x {item.nombre}</p>
                        <span className="text-md font-[1000] text-[#1a2e05] italic">${item.total.toFixed(0)}</span>
                    </div>
                ))}
            </div>

            {/* SELECTOR DE PAGO */}
            <div className="grid grid-cols-2 gap-3 px-2">
                <button onClick={() => setMetodoPago("efectivo")} className={`p-5 rounded-[2rem] border-4 flex flex-col items-center gap-2 transition-all ${metodoPago === "efectivo" ? "border-emerald-500 bg-emerald-50 shadow-lg scale-105 text-[#1a2e05]" : "border-slate-50 bg-slate-50 text-slate-300 opacity-60"}`}>
                    <Wallet size={24} /><span className="text-[10px] font-[1000] uppercase italic">Efectivo</span>
                </button>
                <button onClick={() => setMetodoPago("tarjeta")} className={`p-5 rounded-[2rem] border-4 flex flex-col items-center gap-2 transition-all ${metodoPago === "tarjeta" ? "border-emerald-500 bg-emerald-50 shadow-lg scale-105 text-[#1a2e05]" : "border-slate-50 bg-slate-50 text-slate-300 opacity-60"}`}>
                    <CreditCard size={24} /><span className="text-[10px] font-[1000] uppercase italic">Tarjeta</span>
                </button>
            </div>

            {/* INPUTS CONTACTO */}
            <div className="grid grid-cols-2 gap-3 px-2">
                <input className="bg-slate-50 rounded-2xl p-4 text-[11px] font-[1000] text-[#1a2e05] outline-none border-2 border-transparent focus:border-emerald-500" placeholder="WHATSAPP" value={contactInfo.phone} onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} />
                <input className="bg-slate-50 rounded-2xl p-4 text-[11px] font-[1000] text-[#1a2e05] outline-none border-2 border-transparent focus:border-emerald-500" placeholder="NOMBRE" value={contactInfo.name} onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})} />
            </div>

            {/* DIRECCIONES */}
            <div className="space-y-2 px-2">
                <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black uppercase text-slate-400 italic tracking-widest">CAMPO DE ENTREGA</p>
                    <button onClick={() => setShowAddressModal(true)} className="text-emerald-600 font-black text-[10px] uppercase underline hover:text-[#1a2e05] transition-colors">+ Nueva</button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                    {savedAddresses.map((addr) => (
                        <button key={addr.id} onClick={() => setSelectedAddress(addr)} className={`shrink-0 p-4 rounded-[1.8rem] border-4 w-36 text-left transition-all ${selectedAddress?.id === addr.id ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-50 bg-slate-50 opacity-70'}`}>
                            <p className="font-[1000] text-[10px] uppercase text-[#1a2e05] truncate leading-none mb-1">{addr.label}</p>
                            <p className="text-[8px] text-slate-400 truncate italic font-bold uppercase">{addr.address}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* TOTAL */}
            <div className="pt-4 border-t-4 border-slate-100 flex justify-between items-end text-5xl font-[1000] text-[#1a2e05] italic tracking-tighter leading-none px-2 pb-2">
                <span className="text-lg mb-1 tracking-widest uppercase">TOTAL</span>
                <span>${totalFinal.toFixed(0)}</span>
            </div>

            {/* BOTÓN FINAL */}
            <button 
                onClick={() => metodoPago === "tarjeta" ? setMostrarPasarela(true) : handleFinalizarPedido()} 
                disabled={isLoading || !selectedAddress || cartItems.length === 0} 
                className="w-full bg-[#1a2e05] text-white py-5 rounded-[2rem] font-[1000] uppercase italic flex items-center justify-center gap-4 transition-all hover:bg-emerald-600 shadow-xl disabled:opacity-50 active:scale-95 group"
            >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                        <Zap size={20} fill="currentColor" className="text-emerald-400 group-hover:text-white transition-colors" />
                        <span>{metodoPago === "tarjeta" ? "PAGAR JUGADA" : "CONFIRMAR JUGADA"}</span>
                    </>
                )}
            </button>

            {/* MODAL DE DIRECCIONES CORREGIDO (Doble prop para evitar errores) */}
            {showAddressModal && (
                <AddressModal 
                    onClose={() => setShowAddressModal(false)} 
                    onSaveAddress={(newAddr) => {
                        setSavedAddresses(prev => [...prev, newAddr]);
                        setSelectedAddress(newAddr);
                        setShowAddressModal(false);
                    }}
                    onAddressAdded={(newAddr) => {
                        setSavedAddresses(prev => [...prev, newAddr]);
                        setSelectedAddress(newAddr);
                        setShowAddressModal(false);
                    }}
                    userId={currentUser?.id} 
                />
            )}
        </div>
    );
};

export default OrderSummary;