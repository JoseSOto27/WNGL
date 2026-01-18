import React, { useState, useEffect, useMemo } from "react";
import AddressModal from "./AddressModal";
import { 
  ShoppingBag, MapPin, CheckCircle, Loader2, 
  Star, Coins, User, Phone, Mail
} from "lucide-react";
import toast from "react-hot-toast";
import { supabase } from "../../services/supabase";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";

const OrderSummary = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    // --- ESTADOS ---
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [contactInfo, setContactInfo] = useState({ name: "", email: "", phone: "" });
    
    const [userPoints, setUserPoints] = useState(0);
    const [usePoints, setUsePoints] = useState(false);
    
    const [isLoading, setIsLoading] = useState(false);
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    
    const cartItems = useSelector((state) => state?.cart?.cartItems) || {};
    const products = useSelector((state) => state?.product?.list) || [];
    const currency = "$";

    // 1. Cargar Datos del Usuario y Sesión
    useEffect(() => {
        const loadInitialData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
                // Pre-cargar nombre y email de la sesión
                setContactInfo(prev => ({ 
                    ...prev, 
                    email: user.email, 
                    name: user.user_metadata?.full_name || "" 
                }));
                
                // Cargar direcciones
                const { data: addr } = await supabase.from('direcciones').select('*').eq('user_id', user.id);
                if (addr) setSavedAddresses(addr);

                // Cargar puntos del perfil
                const { data: prof } = await supabase.from('profiles').select('points').eq('id', user.id).single();
                if (prof) setUserPoints(prof.points || 0);
            }
        };
        loadInitialData();
    }, []);

    // 2. Cálculos de la Orden
    const { subtotal, envio, totalOriginal, productosDetallados, descuentoPuntos, totalFinal, puntosAGanar } = useMemo(() => {
        let sub = 0;
        let detallados = [];
        Object.entries(cartItems).forEach(([productId, quantity]) => {
            const product = products.find(p => String(p.id) === String(productId));
            if (product) {
                const pOrig = Number(product.precio_original) || 0;
                const pOfer = Number(product.precio_oferta) || 0;
                const pFinal = (pOfer > 0 && pOfer < pOrig) ? pOfer : pOrig;
                const itemTotal = pFinal * (Number(quantity) || 0);
                sub += itemTotal;
                detallados.push({
                    id: product.id,
                    nombre: product.name,
                    precio_unitario: pFinal,
                    cantidad: quantity,
                    total: itemTotal,
                    imagen: product.images?.[0] || ""
                });
            }
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
    }, [cartItems, products, userPoints, usePoints]);

    // 3. Función para Procesar Pedido
    const handlePlaceOrder = async () => {
        // BLINDAJE: Si no hay usuario (sesión nula), redirigir al login
        if (!currentUser) {
            toast.error("Debes iniciar sesión para pedir.");
            navigate("/admin");
            return;
        }

        if (!selectedAddress) return toast.error("Selecciona una dirección.");
        if (!contactInfo.phone || !contactInfo.name) return toast.error("Completa los datos de entrega.");

        setIsLoading(true);
        try {
            const pedidoData = {
                customer_id: currentUser.id,
                cliente_nombre: contactInfo.name,
                cliente_email: contactInfo.email,
                cliente_telefono: contactInfo.phone,
                direccion_entrega: `${selectedAddress.label}: ${selectedAddress.address}`,
                productos: productosDetallados,
                subtotal, 
                envio, 
                total: totalFinal,
                puntos_usados: usePoints ? (descuentoPuntos * 10) : 0,
                puntos_generados: puntosAGanar,
                metodo_pago: totalFinal === 0 ? "Pagado con Puntos" : "Contra entrega",
                estado: "pendiente"
            };

            const { data: pedidoRes, error: pedidoErr } = await supabase.from('pedidos_v2').insert([pedidoData]).select();
            if (pedidoErr) throw pedidoErr;

            // Actualizar puntos en el perfil del usuario
            const puntosRestantes = usePoints ? (userPoints - (descuentoPuntos * 10)) : userPoints;
            const puntosFinales = Math.floor(puntosRestantes + puntosAGanar);
            await supabase.from('profiles').update({ points: puntosFinales }).eq('id', currentUser.id);

            dispatch(clearCart());
            setOrderConfirmed(true);
            toast.success("¡Pedido confirmado!");
        } catch (error) {
            toast.error("Error al procesar: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (orderConfirmed) {
        return (
            <div className="w-full max-w-md mx-auto bg-white p-10 rounded-[3rem] shadow-2xl text-center border-4 border-emerald-500 animate-in zoom-in duration-300">
                <CheckCircle className="text-emerald-500 mx-auto mb-4" size={60} />
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-[#1a2e05]">¡EN LA CANCHA!</h2>
                <div className="bg-emerald-50 p-4 rounded-2xl my-4 text-[#1a2e05]">
                    <p className="font-black text-[10px] uppercase">Balance de puntos ganado</p>
                    <p className="text-2xl font-black">+{puntosAGanar} pts</p>
                </div>
                <button onClick={() => navigate('/mi-cuenta')} className="w-full bg-[#1a2e05] text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all">Mis Pedidos</button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-5">
            <h2 className="text-2xl font-black text-slate-800 uppercase italic flex items-center gap-2 px-2">
                <ShoppingBag className="text-emerald-600" /> Resumen de Compra
            </h2>

            {/* PRODUCTOS */}
            <div className="bg-slate-50 rounded-[2rem] p-4 border border-slate-100 shadow-inner">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 mb-2 italic">Comanda detallada:</p>
                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                    {productosDetallados.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-50">
                            <div className="flex items-center gap-2">
                                <img src={item.imagen} className="w-8 h-8 object-cover rounded-lg" alt="" />
                                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[120px]">{item.cantidad}x {item.nombre}</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-900">${item.total.toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* DATOS DE ENTREGA (TEXTO NEGRO) */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">¿Quién recibe?</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-slate-400" size={14} />
                            <input 
                                className="w-full bg-slate-50 rounded-xl pl-9 p-3 text-xs font-black text-slate-900 outline-none border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300" 
                                placeholder="Nombre" 
                                value={contactInfo.name} 
                                onChange={(e) => setContactInfo({...contactInfo, name: e.target.value})} 
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500 ml-2 italic">WhatsApp / Cel</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-slate-400" size={14} />
                            <input 
                                className="w-full bg-slate-50 rounded-xl pl-9 p-3 text-xs font-black text-slate-900 outline-none border-2 border-transparent focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-300" 
                                placeholder="775..." 
                                value={contactInfo.phone} 
                                onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})} 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* WINGOOL WALLET */}
            {userPoints > 0 && (
                <div className={`p-4 rounded-[2rem] border-2 transition-all ${usePoints ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 shadow-inner'}`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="bg-amber-100 p-2 rounded-full"><Coins className="text-amber-600" size={16} /></div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Wingool Wallet</p>
                                <p className="font-black text-slate-800 text-xs">{userPoints} pts <span className="text-emerald-600">(${ (userPoints/10).toFixed(2) })</span></p>
                            </div>
                        </div>
                        <button onClick={() => setUsePoints(!usePoints)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${usePoints ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-white text-slate-600 border border-slate-200'}`}>
                            {usePoints ? 'QUITAR' : 'CANJEAR'}
                        </button>
                    </div>
                </div>
            )}

            {/* DIRECCIONES GUARDADAS */}
            <div className="space-y-2">
                <div className="flex justify-between items-center px-2">
                    <p className="text-[10px] font-black uppercase text-slate-500 italic">Lugar de entrega</p>
                    <button onClick={() => setShowAddressModal(true)} className="text-emerald-600 font-black text-[10px] uppercase underline hover:text-[#1a2e05]">+ Nueva</button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {savedAddresses.map((addr) => (
                        <button 
                            key={addr.id} 
                            onClick={() => setSelectedAddress(addr)} 
                            className={`shrink-0 p-3 rounded-2xl border-2 w-32 text-left transition-all ${selectedAddress?.id === addr.id ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                        >
                            <p className="font-black text-[9px] uppercase text-slate-800 truncate">{addr.label}</p>
                            <p className="text-[8px] text-slate-400 truncate line-clamp-1 italic">{addr.address}</p>
                        </button>
                    ))}
                    {savedAddresses.length === 0 && <p className="text-[10px] font-bold text-slate-300 p-2 uppercase italic">Agrega una dirección para pedir</p>}
                </div>
            </div>

            {/* RESUMEN ECONÓMICO */}
            <div className="space-y-2 px-2 pt-2 border-t-2 border-slate-50">
                <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                    <span>Subtotal + Envío ($40)</span>
                    <span>${totalOriginal.toFixed(2)}</span>
                </div>
                {usePoints && (
                    <div className="flex justify-between text-[10px] font-black text-emerald-600 uppercase italic">
                        <span>✨ Descuento Wallet</span>
                        <span>-${descuentoPuntos.toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between items-center bg-[#1a2e05] text-white p-3 rounded-2xl shadow-lg border border-white/5">
                    <span className="text-[9px] font-black uppercase flex items-center gap-1"><Star size={12} fill="#10b981" className="text-emerald-500"/> Ganas:</span>
                    <span className="text-sm font-black italic">+{puntosAGanar} pts</span>
                </div>
                <div className="flex justify-between text-2xl font-black text-[#1a2e05] pt-1 italic">
                    <span>TOTAL</span>
                    <span>${totalFinal.toFixed(2)}</span>
                </div>
            </div>

            {/* BOTÓN DE ACCIÓN */}
            <button
                onClick={handlePlaceOrder}
                disabled={isLoading || !selectedAddress || productosDetallados.length === 0}
                className="w-full bg-[#1a2e05] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest disabled:opacity-20 hover:bg-emerald-700 transition-all shadow-xl active:scale-95 flex items-center justify-center"
            >
                {isLoading ? <Loader2 className="animate-spin" /> : "Confirmar Mi Pedido"}
            </button>

            {showAddressModal && (
                <AddressModal 
                    setShowAddressModal={setShowAddressModal}
                    onSaveAddress={(newAddr) => {
                        setSavedAddresses(prev => [...prev, newAddr]);
                        setSelectedAddress(newAddr);
                    }}
                />
            )}
        </div>
    );
};

export default OrderSummary;