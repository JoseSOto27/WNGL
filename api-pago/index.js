const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// 1. CONFIGURACIÓN DE CLIENTES
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 2. RUTA PARA CREAR PREFERENCIA
app.post('/create_preference', async (req, res) => {
  try {
    const { items, userData, shippingCost = 40 } = req.body;
    
    // Generamos referencia única (ID de rastreo propio)
    const miReferenciaPropia = `ORDER-${Date.now()}-${userData?.id || 'anon'}`;

    // Preparamos los productos del carrito
    const mpItems = items.map(item => ({
      title: item.nombre || "Producto Wingool",
      unit_price: Number(item.precio),
      quantity: parseInt(item.quantity || 1),
      currency_id: 'MXN'
    }));

    // 🚚 Agregamos el cargo de envío
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
        
        // 💳 BLOQUEO ESTRICTO: SOLO TARJETAS (Elimina OXXO, SPEI y BBVA Transferencia)
        payment_methods: {
          excluded_payment_types: [
            { id: "ticket" },        // Bloquea Efectivo (OXXO, 7-Eleven)
            { id: "bank_transfer" }, // Bloquea Transferencias (SPEI, BBVA)
            { id: "atm" }            // Bloquea Red de cajeros
          ],
          excluded_payment_methods: [
             { id: "bancomer" },     // Bloquea específicamente la opción de BBVA
             { id: "serfin" },       // Santander
             { id: "banamex" },      // Citibanamex
             { id: "bancomer_ticket" },
             { id: "serfin_ticket" }
          ],
          installments: 12 
        },

        back_urls: {
          success: "http://localhost:5173/mi-cuenta",
          failure: "http://localhost:5173/cart"
        },
        notification_url: "https://maxine-unskilled-lavinia.ngrok-free.dev/webhook",
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

    console.log(`✅ Preferencia Creada. ID: ${result.id} | Ref: ${miReferenciaPropia}`);
    res.json({ id: result.id });
  } catch (error) {
    console.error("❌ ERROR AL CREAR PREFERENCIA:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// 3. WEBHOOK (GUARDADO AUTOMÁTICO EN SUPABASE)
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

        console.log(`💰 Pago de $${data.transaction_amount} aprobado. Ref: ${refFinal}`);

        // INSERTAMOS EN SUPABASE
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
          if (dbError.code === '23505') {
            console.log("🚫 Duplicado bloqueado por Referencia Única.");
            return res.sendStatus(200);
          }
          console.error("❌ ERROR DE SUPABASE:", dbError.message);
        } else {
          console.log("✅ PEDIDO GUARDADO CON ÉXITO");
        }
      }
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ ERROR CRÍTICO WEBHOOK:", err.message);
    res.sendStatus(200); 
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 SERVIDOR WINGOOL PAY LISTO`);
  console.log(`💳 Configurado: SOLO TARJETAS (BBVA/SPEI/OXXO Bloqueados)`);
});