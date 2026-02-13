const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// ✅ Configuración de CORS y JSON
app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DE CLIENTES
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 2. RUTA PARA CREAR PREFERENCIA (Frontend llama aquí)
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
        payment_methods: {
          excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }, { id: "atm" }],
          installments: 12 
        },
        back_urls: {
          success: "https://wngl.vercel.app/mi-cuenta",
          failure: "https://wngl.vercel.app/cart"
        },
        auto_return: "approved",
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

    res.json({ id: result.id });
  } catch (error) {
    console.error("❌ ERROR AL CREAR PREFERENCIA:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. WEBHOOK CORREGIDO (Aquí se suman los puntos)
app.post('/webhook', async (req, res) => {
  const { query, body } = req;
  
  // ✅ Detectamos el tipo de evento y el ID del pago sin importar el formato de Mercado Pago
  const action = query.topic || query.type || body.action || body.type;
  const paymentId = query.id || query['data.id'] || (body.data ? body.data.id : null);

  console.log(`🔔 Evento recibido: ${action} | ID: ${paymentId}`);

  try {
    // Validamos que sea un evento de pago
    if (action === "payment" || action === "payment.created" || action === "payment.updated") {
      
      if (!paymentId) return res.sendStatus(200);

      // Consultamos los detalles reales del pago a Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      
      const data = await response.json();

      // ✅ Solo si el pago está aprobado sumamos puntos y guardamos
      if (data.status === "approved") {
        const meta = data.metadata;
        const totalPago = data.transaction_amount;
        const refFinal = meta.referencia_propia || data.external_reference;

        console.log(`💰 Pago aprobado por $${totalPago}. Generando puntos...`);

        // INSERTAR EN SUPABASE
        const { error: dbError } = await supabase.from('pedidos_v2').insert([{
          referencia_externa: refFinal,
          customer_id: meta.user_id,
          cliente_nombre: meta.cliente_nombre,
          cliente_telefono: meta.cliente_telefono,
          direccion_entrega: meta.direccion,
          productos: JSON.parse(meta.carrito), 
          total: totalPago,      
          metodo_pago: "Tarjeta (Mercado Pago)",
          estado: "pagado",
          puntos_generados: Math.floor(totalPago * 0.05) // 5% en puntos
        }]);

        if (dbError) {
          if (dbError.code === '23505') {
            console.log("🚫 El pedido ya estaba registrado (Duplicado evitado).");
          } else {
            console.error("❌ ERROR DE SUPABASE:", dbError.message);
          }
        } else {
          console.log("✅ PUNTOS SUMADOS Y PEDIDO GUARDADO");
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ ERROR CRÍTICO WEBHOOK:", err.message);
    res.sendStatus(200); 
  }
});

// 4. CONFIGURACIÓN DE PUERTO PARA VERCEL
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Wingool API listo en puerto ${PORT}`);
  });
}

module.exports = app;