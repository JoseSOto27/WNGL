import React, { useEffect, useState } from 'react';
import { Payment } from '@mercadopago/sdk-react';
import { X, Loader2 } from 'lucide-react';

const MercadoPagoModal = ({ total, onClose, onSuccess }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Retraso de 1 segundo para asegurar que el modal esté estático
    const timer = setTimeout(() => setIsReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[#1a2e05]/95 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
        
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors z-[10001]">
          <X size={28} strokeWidth={3} />
        </button>
        
        <div className="mb-6 flex-shrink-0">
          <h3 className="text-2xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter">PAGO <span className="text-emerald-500">SEGURO</span></h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Wingool Checkout Official</p>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {!isReady ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estabilizando conexión...</p>
            </div>
          ) : (
            <div id="paymentBrick_container">
              <Payment
                initialization={{ 
                  amount: Number(total.toFixed(2)) 
                }}
                customization={{
                  visual: {
                    style: { theme: 'flat' },
                    customVariables: { 
                      activeColor: '#10b981', 
                      buttonBorderRadius: '1.2rem' 
                    }
                  }
                }}
                onSubmit={async (param) => {
                  // Éxito: Aquí MP nos da el token
                  onSuccess();
                }}
                onError={(error) => {
                  console.error("DETALLE ERROR MP:", error);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MercadoPagoModal;