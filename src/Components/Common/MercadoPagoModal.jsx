import React, { useEffect, useState, useMemo } from 'react';
import { Payment } from '@mercadopago/sdk-react';
import { X, Loader2 } from 'lucide-react';

const MercadoPagoModal = ({ total, onClose, onSuccess }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Retraso para que el modal termine de animarse
    const timer = setTimeout(() => setIsReady(true), 800);
    setIsMounted(true);
    return () => {
      setIsMounted(false);
      clearTimeout(timer);
    };
  }, []);

  // CONGELAMOS LOS DATOS: Esto evita que el error aparezca y desaparezca
  // porque los parámetros de Mercado Pago ya no cambian aunque el padre se actualice.
  const staticInitialization = useMemo(() => ({
    amount: Number(total),
  }), []); // Dependencia vacía = Se congela al abrir

  const staticCustomization = useMemo(() => ({
    visual: {
      style: { theme: 'flat' },
      customVariables: { 
        activeColor: '#10b981', 
        buttonBorderRadius: '1.5rem' 
      }
    }
  }), []);

  if (!isMounted) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#1a2e05]/95 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-[#1a2e05] transition-colors z-[10001]">
          <X size={28} strokeWidth={3} />
        </button>
        
        <div className="mb-4 flex-shrink-0">
          <h3 className="text-2xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter">
            PAGO <span className="text-emerald-500">SEGURO</span>
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 italic">
            No cierres esta ventana
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[450px]">
          <div id="paymentBrick_container">
            <Payment
              initialization={staticInitialization}
              customization={staticCustomization}
              onSubmit={async (param) => {
                console.log("Pago exitoso");
                onSuccess();
              }}
              onReady={() => console.log("Pasarela Estable")}
              onError={(error) => {
                console.error("Error en Brick:", error);
              }}
            />
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 text-center opacity-30 italic text-[9px] font-black uppercase tracking-widest text-[#1a2e05]">
          Powered by Mercado Pago
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoModal;