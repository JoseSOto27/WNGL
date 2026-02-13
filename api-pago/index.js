const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// ✅ Configuración de CORS para permitir peticiones desde tu Frontend en Vercel
app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DE CLIENTES (Variables desde el panel de Vercel)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 2. RUTA PARA CREAR PREFERENCIA
app.post('/create_preference', async (req, res) => {
  try {
    const { items, userData, shippingCost = 40 } = req.body;
    
    const miReferenciaPropia = `ORDER-${Date.now()}-${userData?.id || 'anon'}`;

    const mpItems = items.map(item => ({
      title: item.nombre || "Producto Wingool",
      unit_price: Number(item.precio),
      quantity: parseInt(item.quantity || 1),
      currency_id: 'MXN'
    }));

    // Cargo de envío
    mpItems.push({
      title: "Costo de Envío",
      unit_price: Number(shippingCost),
      quantity: 1,
      currency_id: 'MXN'
    });

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: mpItems,
        external_reference: miReferenciaPropia,
        
        // 💳 BLOQUEO ESTRICTO: SOLO TARJETAS
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" },        
            { id: "bank_transfer" }, 
            { id: "atm" }            
          ],
          excluded_payment_methods: [
             { id: "bancomer" },     
             { id: "serfin" },       
             { id: "banamex" },      
             { id: "bancomer_ticket" },
             { id: "serfin_ticket" }
          ],
          installments: 12 
        },

        // ✅ REEMPLAZA "tu-frontend-wngl.vercel.app" con la URL real de tu página web
        back_urls: {
          success: "https://wngl.vercel.app/mi-cuenta",
          failure: "https://wngl.vercel.app/cart"
        },
        auto_return: "approved",

        // ✅ URL de tu API en Vercel (Donde vive este código)
        notification_url: "https://wngl-5fb1.vercel.app/webhook",

        metadata: {
          user_id: userData?.id,
          cliente_nombre: userData?.name || "Cliente Wingool",
          cliente_telefono: userData?.phone || "Sin teléfono",
          direccion: userData?.address || "Dirección no especificada",
          carrito: JSON.stringify(items), 
          referencia_propia: miReferenciaPropia
        }
      }
    });

    console.log(`✅ Preferencia Creada: ${result.id}`);
    res.json({ id: result.id });
  } catch (error) {
    console.error("❌ ERROR AL CREAR PREFERENCIA:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. WEBHOOK (PROCESAMIENTO DE PAGO REAL)
app.post('/webhook', async (req, res) => {
  const { query } = req;
  const topic = query.topic || query.type;

  try {
    if (topic === "payment") {
      const paymentId = query.id || query['data.id'];
      
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const data = await response.json();

      if (data.status === "approved") {
        const meta = data.metadata;
        const refFinal = meta.referencia_propia || data.external_reference;

        // INSERTAR EN SUPABASE
        const { error: dbError } = await supabase.from('pedidos_v2').insert([{
          referencia_externa: refFinal,
          customer_id: meta.user_id,
          cliente_nombre: meta.cliente_nombre,
          cliente_telefono: meta.cliente_telefono,
          direccion_entrega: meta.direccion,
          productos: JSON.parse(meta.carrito), 
          total: data.transaction_amount,      
          metodo_pago: "Tarjeta (Mercado Pago)",
          estado: "pagado",
          puntos_generados: Math.floor(data.transaction_amount * 0.05)
        }]);

        if (dbError) {
          console.error("❌ ERROR DE SUPABASE:", dbError.message);
        } else {
          console.log("✅ PEDIDO GUARDADO EXITOSAMENTE");
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ ERROR CRÍTICO WEBHOOK:", err.message);
    res.sendStatus(200); 
  }
});

// ✅ EXPORTAR PARA VERCEL (No usar app.listen solo para producción)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local corriendo en puerto ${PORT}`);
  });
}

module.exports = app;