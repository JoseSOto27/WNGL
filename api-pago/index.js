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

// FUNCIÓN DE LIMPIEZA REUTILIZABLE
const limpiarExtras = (carrito) => {
    return carrito.map(producto => {
        if (producto.extras && Array.isArray(producto.extras)) {
            producto.extras = producto.extras.filter((extra, index, self) =>
                index === self.findIndex((e) => e.nombre === extra.nombre)
            );
        }
        return producto;
    });
};

// 1. RUTA PARA CREAR PREFERENCIA (Con soporte para puntos dinámicos)
app.post('/create_preference', async (req, res) => {
    try {
        // Recibimos 'puntosUsados' desde tu Frontend
        const { items, userData, shippingCost = 40, puntosUsados = 0 } = req.body;
        
        const carritoLimpio = limpiarExtras(items);
        const miReferenciaPropia = `ORDER-${Date.now()}-${userData?.id || 'anon'}`;

        const mpItems = carritoLimpio.map(item => ({
            title: item.nombre || "Producto Wingool",
            unit_price: Number(item.precio),
            quantity: parseInt(item.quantity || 1),
            currency_id: 'MXN'
        }));

        // Añadimos el Costo de Envío
        mpItems.push({
            title: "Costo de Envío",
            unit_price: Number(shippingCost),
            quantity: 1,
            currency_id: 'MXN'
        });

        // ✅ LÓGICA DE DESCUENTO: Si el usuario aplicó puntos, los restamos aquí
        if (Number(puntosUsados) > 0) {
            mpItems.push({
                title: "Descuento: Wallet Wingool",
                unit_price: -Number(puntosUsados), // PRECIO NEGATIVO PARA DESCONTAR
                quantity: 1,
                currency_id: 'MXN'
            });
        }

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: mpItems,
                external_reference: miReferenciaPropia,
                notification_url: "https://wngl-5fb1.vercel.app/webhook",
                metadata: {
                    user_id: userData?.id,
                    cliente_nombre: userData?.name || "Cliente Wingool",
                    cliente_telefono: userData?.phone || "Sin teléfono",
                    direccion: userData?.address || "Dirección no especificada",
                    puntos_usados: puntosUsados, // Guardamos cuánto se descontó
                    carrito: JSON.stringify(carritoLimpio),
                    referencia_propia: miReferenciaPropia
                },
                back_urls: {
                    success: "https://wngl.vercel.app/mi-cuenta",
                    failure: "https://wngl.vercel.app/cart"
                },
                auto_return: "approved"
            }
        });

        res.json({ id: result.id });
    } catch (error) {
        console.error("❌ ERROR AL CREAR PREFERENCIA:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 2. WEBHOOK (Procesa el pago y ajusta la Wallet del MVP)
app.post('/webhook', async (req, res) => {
    const { query, body } = req;
    const action = query.topic || query.type || body.action || body.type;
    const paymentId = query.id || query['data.id'] || (body.data ? body.data.id : null);

    try {
        if (action === "payment" || action === "payment.created" || action === "payment.updated") {
            if (!paymentId) return res.sendStatus(200);

            const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
            });
            const data = await response.json();

            if (data.status === "approved") {
                const meta = data.metadata;
                const userId = meta.user_id;
                const puntosDeduct = Number(meta.puntos_usados) || 0;
                
                const carritoFinal = limpiarExtras(JSON.parse(meta.carrito));

                // Guardar pedido en Supabase
                const { error: dbError } = await supabase.from('pedidos_v2').insert([{
                    referencia_externa: meta.referencia_propia || data.external_reference,
                    customer_id: userId,
                    cliente_nombre: meta.cliente_nombre,
                    cliente_telefono: meta.cliente_telefono,
                    direccion_entrega: meta.direccion,
                    productos: carritoFinal,
                    total: data.transaction_amount,
                    estado: "pagado",
                    puntos_generados: Math.floor(data.transaction_amount * 0.05),
                    puntos_usados: puntosDeduct // Guardamos registro del descuento
                }]);

                // Si es duplicado, no volvemos a sumar/restar puntos
                if (dbError && dbError.code === '23505') return res.sendStatus(200);

                // ✅ ACTUALIZACIÓN DE WALLET (Suma nuevos y resta usados)
                if (userId) {
                    const { data: prof } = await supabase.from('profiles').select('points').eq('id', userId).single();
                    if (prof) {
                        const puntosNuevos = Math.floor(data.transaction_amount * 0.05);
                        const saldoActual = prof.points || 0;
                        
                        // Nuevo Saldo = Saldo anterior + Ganados - Descontados
                        const saldoFinal = (saldoActual + puntosNuevos) - puntosDeduct;

                        await supabase
                            .from('profiles')
                            .update({ points: saldoFinal })
                            .eq('id', userId);
                        
                        console.log(`✅ Wallet de ${userId} actualizada. Saldo Final: ${saldoFinal}`);
                    }
                }
            }
        }
        res.sendStatus(200);
    } catch (err) {
        console.error("❌ ERROR WEBHOOK:", err.message);
        res.sendStatus(200);
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`🚀 API Wingool Corriendo`));
}
module.exports = app;