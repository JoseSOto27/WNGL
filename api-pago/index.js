const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DE CLIENTES
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

// 3. WEBHOOK (GUARDA PEDIDO Y SUMA PUNTOS EN COLUMNA 'POINTS')
app.post('/webhook', async (req, res) => {
  const { query, body } = req;
  const action = query.topic || query.type || body.action || body.type;
  const paymentId = query.id || query['data.id'] || (body.data ? body.data.id : null);

  console.log(`🔔 Webhook recibido: ${action} | ID: ${paymentId}`);

  try {
    if (action === "payment" || action === "payment.created" || action === "payment.updated") {
      if (!paymentId) return res.sendStatus(200);

      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
      });
      const data = await response.json();

      if (data.status === "approved") {
        const meta = data.metadata;
        const totalPago = data.transaction_amount;
        const puntosNuevos = Math.floor(totalPago * 0.05);
        const userId = meta.user_id;
        const refFinal = meta.referencia_propia || data.external_reference;

        console.log(`💰 Pago aprobado. Sumando ${puntosNuevos} a la columna 'points' para el usuario ${userId}`);

        // PASO A: INSERTAR EL PEDIDO EN PEDIDOS_V2
        const { error: dbError } = await supabase.from('pedidos_v2').insert([{
          referencia_externa: refFinal,
          customer_id: userId,
          cliente_nombre: meta.cliente_nombre,
          cliente_telefono: meta.cliente_telefono,
          direccion_entrega: meta.direccion,
          productos: JSON.parse(meta.carrito), 
          total: totalPago,      
          metodo_pago: "Tarjeta (Mercado Pago)",
          estado: "pagado",
          puntos_generados: puntosNuevos
        }]);

        if (dbError) {
          console.error("❌ ERROR AL GUARDAR PEDIDO:", dbError.message);
        } else {
          console.log("✅ PEDIDO GUARDADO");

          // PASO B: ACTUALIZAR COLUMNA 'POINTS' EN TABLA 'PROFILES'
          if (userId) {
            // 1. Obtenemos el saldo actual de la columna 'points'
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('points') // <--- Cambiado a 'points'
              .eq('id', userId)
              .single();

            if (profileError) {
              console.error("❌ ERROR AL BUSCAR PERFIL:", profileError.message);
            } else {
              const saldoAnterior = profile.points || 0;
              const nuevoSaldo = saldoAnterior + puntosNuevos;

              // 2. Actualizamos la columna 'points' con la suma
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ points: nuevoSaldo }) // <--- Cambiado a 'points'
                .eq('id', userId);

              if (updateError) {
                console.error("❌ ERROR AL ACTUALIZAR PUNTOS:", updateError.message);
              } else {
                console.log(`✅ PUNTOS SUMADOS: ${saldoAnterior} + ${puntosNuevos} = ${nuevoSaldo}`);
              }
            }
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ ERROR CRÍTICO WEBHOOK:", err.message);
    res.sendStatus(200); 
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Servidor listo`));
}

module.exports = app;