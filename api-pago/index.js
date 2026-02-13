const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 1. RUTA PARA CREAR PREFERENCIA
app.post('/create_preference', async (req, res) => {
  try {
    const { items, userData, shippingCost = 40 } = req.body;
    // El userData.id que enviamos aquí es el que Mercado Pago nos devolverá en el Webhook
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
          user_id: userData?.id, // ID original del cliente
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

// 2. WEBHOOK: GUARDA PEDIDO Y SUMA PUNTOS EN PROFILES
app.post('/webhook', async (req, res) => {
  const { query, body } = req;
  const action = query.topic || query.type || body.action || body.type;
  const paymentId = query.id || query['data.id'] || (body.data ? body.data.id : null);

  console.log(`🔔 Webhook: ${action} | ID: ${paymentId}`);

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
        const userId = meta.user_id; // Este es el ID del cliente
        const refFinal = meta.referencia_propia || data.external_reference;

        console.log(`💰 Pago aprobado. ID Cliente: ${userId} | Puntos: ${puntosNuevos}`);

        // PASO A: Guardar en pedidos_v2 (Usando customer_id)
        await supabase.from('pedidos_v2').insert([{
          referencia_externa: refFinal,
          customer_id: userId, // ✅ Aquí guardamos el ID del cliente
          cliente_nombre: meta.cliente_nombre,
          cliente_telefono: meta.cliente_telefono,
          direccion_entrega: meta.direccion,
          productos: JSON.parse(meta.carrito), 
          total: totalPago,      
          metodo_pago: "Tarjeta",
          estado: "pagado",
          puntos_generados: puntosNuevos
        }]);

        // PASO B: Actualizar puntos en la tabla PROFILES
        if (userId) {
          // Buscamos en 'profiles' donde la columna 'id' sea igual al userId del pago
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('points')
            .eq('id', userId) // ✅ En profiles se llama 'id'
            .single();

          if (profileError) {
            console.error("❌ Error al buscar perfil en profiles:", profileError.message);
          } else {
            const saldoActual = profileData.points || 0;
            const nuevoSaldo = saldoActual + puntosNuevos;

            const { error: updateError } = await supabase
              .from('profiles')
              .update({ points: nuevoSaldo })
              .eq('id', userId); // ✅ Actualizamos por 'id'

            if (updateError) {
              console.error("❌ Error al actualizar saldo en profiles:", updateError.message);
            } else {
              console.log(`✅ ¡Puntos sumados! Nuevo saldo de ${userId}: ${nuevoSaldo}`);
            }
          }
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error Crítico:", err.message);
    res.sendStatus(200); 
  }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 API Wingool Online`));
}
module.exports = app;