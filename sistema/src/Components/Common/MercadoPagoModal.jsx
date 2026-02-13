import React, { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { X, Loader2, ShieldCheck } from 'lucide-react';

// 🚨 REEMPLAZA CON TU PUBLIC KEY (la que empieza con APP_USR-...)
initMercadoPago('APP_USR-b7abe48e-dcf5-47b4-be82-80c541a78e4a');

const MercadoPagoModal = ({ total, cartItems, userData, onClose }) => {
    const [preferenceId, setPreferenceId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const generatePreference = async () => {
            try {
                // ✅ CORRECCIÓN: Se añadieron las comillas invertidas ` al inicio y final de la URL
                const response = await fetch(`${import.meta.env.VITE_API_URL}/create_preference`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        items: cartItems, 
                        total,
                        userData 
                    })
                });
                
                const data = await response.json();
                if (data.id) {
                    setPreferenceId(data.id);
                }
            } catch (err) {
                console.error("Error al conectar con el servidor de cobro", err);
            } finally {
                setLoading(false);
            }
        };
        generatePreference();
    }, [cartItems, total, userData]);

    return (
        <div className="fixed inset-0 bg-[#1a2e05]/90 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
                <div className="bg-[#1a2e05] p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" size={20} />
                        <h3 className="font-[1000] italic uppercase text-xs tracking-tighter">Pago Seguro Mercado Pago</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all"><X /></button>
                </div>

                <div className="p-10 flex flex-col items-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase italic mb-2">Total de la Orden</p>
                    <h2 className="text-5xl font-[1000] text-[#1a2e05] italic mb-10">${total}</h2>

                    {loading ? (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <Loader2 className="animate-spin text-emerald-500" size={40} />
                            <p className="text-[10px] font-black text-slate-400 uppercase italic">Preparando pasarela...</p>
                        </div>
                    ) : (
                        preferenceId && (
                            <div className="w-full animate-in fade-in slide-in-from-bottom-4">
                                <Wallet 
                                    initialization={{ preferenceId }} 
                                    customization={{ texts: { valueProp: 'smart_option' } }} 
                                />
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MercadoPagoModal;