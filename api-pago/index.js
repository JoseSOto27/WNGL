const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// Configuración de Middlewares
app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DE CLIENTES
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// 2. RUTA PARA CREAR PREFERENCIA
app.post('/create_preference', async (req, res) => {
    try {
        const { items, userData, shippingCost = 40 } = req.body;
        // El ID del cliente se envía en metadata para recuperarlo en el Webhook
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

// 3. WEBHOOK ULTRA-ROBUSTO (Suma de puntos y guardado de pedido)
app.post('/webhook', async (req, res) => {
    const { query, body } = req;
    
    // Captura de datos flexible (soporta múltiples formatos de Mercado Pago)
    const action = query.topic || query.type || body.action || body.type;
    const paymentId = query.id || query['data.id'] || (body.data ? body.data.id : null);

    console.log(`🔔 Webhook recibido: ${action} | ID: ${paymentId}`);

    try {
        if (action === "payment" || action === "payment.created" || action === "payment.updated") {
            if (!paymentId) return res.sendStatus(200);

            // Consultar detalles del pago
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

                console.log(`💰 Procesando: ${puntosNuevos} puntos para el ID de Cliente: ${userId}`);

                // PASO 1: GUARDAR PEDIDO EN pedidos_v2
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

                if (dbError) console.error("❌ Error al insertar pedido:", dbError.message);

                // PASO 2: ACTUALIZAR PUNTOS EN profiles (COLUMNA points)
                if (userId) {
                    // Consultamos el saldo actual (usamos array para evitar error de coercion)
                    const { data: profiles, error: profileError } = await supabase
                        .from('profiles')
                        .select('points')
                        .eq('id', userId);

                    if (profileError) {
                        console.error("❌ Error al consultar perfil:", profileError.message);
                    } else if (!profiles || profiles.length === 0) {
                        console.error(`⚠️ No se encontró perfil para el ID: ${userId}. Revisa el RLS en Supabase.`);
                    } else {
                        const saldoActual = profiles[0].points || 0;
                        const nuevoSaldo = saldoActual + puntosNuevos;

                        const { error: updateError } = await supabase
                            .from('profiles')
                            .update({ points: nuevoSaldo })
                            .eq('id', userId);

                        if (updateError) {
                            console.error("❌ Error al actualizar la columna points:", updateError.message);
                        } else {
                            console.log(`✅ ¡PUNTOS SUMADOS! Saldo anterior: ${saldoActual} -> Nuevo saldo: ${nuevoSaldo}`);
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

// Configuración para Vercel
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 API Wingool Corriendo en puerto ${PORT}`));
}

module.exports = app;