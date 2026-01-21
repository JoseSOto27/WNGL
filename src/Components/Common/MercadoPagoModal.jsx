import React, { useState } from 'react';
import { Payment, initMercadoPago } from '@mercadopago/sdk-react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';

initMercadoPago('APP_USR-b7abe48e-dcf5-47b4-be82-80c541a78e4a', { locale: 'es-MX' });

const MercadoPagoModal = ({ total, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(true);

  const initialization = {
    amount: total,
    preferenceId: null,
  };

  const customization = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
    visual: {
      style: {
        theme: 'default', // Mantenemos default pero personalizamos el contenedor
        customVariables: {
          borderRadiusMedium: "20px", // Suaviza los inputs de MP
          colorPrimary: "#10b981",    // Verde esmeralda de Wingool
        }
      }
    }
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (onSuccess) {
          await onSuccess(); 
        }
        resolve();
      } catch (error) {
        console.error("Error al finalizar el pago:", error);
        reject();
      }
    });
  };

  const onError = (error) => {
    console.error("Error en el Brick de Mercado Pago:", error);
  };

  const onReady = () => {
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#1a2e05]/95 backdrop-blur-md p-2">
      <div className="bg-white w-full max-w-[440px] rounded-[3rem] shadow-2xl relative border-b-[12px] border-emerald-500 max-h-[95vh] flex flex-col animate-in zoom-in duration-300">
        
        {/* Botón Cerrar - Posición Ajustada */}
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-300 hover:text-red-500 z-[10001] transition-colors p-2"
        >
          <X size={24} />
        </button>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Encabezado Estilizado */}
          <div className="text-center mb-4">
            <div className="bg-emerald-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShieldCheck size={28} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-[1000] text-[#1a2e05] uppercase italic leading-none">Checkout Seguro</h2>
            <div className="mt-3 py-2 px-6 bg-slate-50 rounded-2xl inline-flex items-center gap-2 border-2 border-dashed border-slate-200">
              <span className="text-xs font-black text-slate-400 uppercase italic">Total:</span>
              <span className="text-xl font-[1000] text-emerald-600 italic">${total} MXN</span>
            </div>
          </div>

          {/* Loader */}
          {loading && (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Conectando con el estadio de pago...</p>
            </div>
          )}

          {/* El Brick de Mercado Pago ahora respeta el ancho del contenedor de Wingool */}
          <div className={`${loading ? 'hidden' : 'block'} min-h-[400px]`}>
            <Payment
              initialization={initialization}
              customization={customization}
              onSubmit={onSubmit}
              onReady={onReady}
              onError={onError}
            />
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.2em]">
              Wingool Company © 2026 <br/> 
              Tecnología de Mercado Pago México
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoModal;