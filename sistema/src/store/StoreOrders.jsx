import React, { useEffect, useState } from "react";
import Loading from "../Components/Common/Loading";
import { supabase } from "../services/supabase"; 
import { 
  Clock, Package, Truck, Phone, MapPin, User, Star, X, 
  ChevronRight, Zap, Trophy, Receipt, Ticket, Coins, CreditCard, Banknote, RefreshCcw,
  Droplets // Icono para la salsa
} from "lucide-react";
import toast from "react-hot-toast";

export default function StoreOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [estadisticas, setEstadisticas] = useState({ total: 0, pendientes: 0, procesando: 0, enviados: 0, entregados: 0 });
  const [filtroEstado, setFiltroEstado] = useState("todos");
  
  const parseCurrency = (val) => {
    if (val === undefined || val === null || val === "") return 0;
    if (typeof val === 'number') return val;
    return parseFloat(String(val).replace(/[^0-9.]/g, "")) || 0;
  };

  const obtenerPedidos = async () => {
    try {
      const { data, error } = await supabase.from('pedidos_v2').select('*').order('fecha_pedido', { ascending: false });
      if (error) throw error;
      setPedidos(data || []);
      const d = data || [];
      setEstadisticas({
        total: d.length,
        pendientes: d.filter(p => p.estado === 'pendiente').length,
        procesando: d.filter(p => p.estado === 'procesando').length,
        enviados: d.filter(p => p.estado === 'enviado').length,
        entregados: d.filter(p => p.estado === 'entregado').length
      });
    } catch (error) { toast.error("Error DB"); } finally { setCargando(false); }
  };

  useEffect(() => {
    obtenerPedidos();
    const channel = supabase.channel('admin-updates').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos_v2' }, () => obtenerPedidos()).subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const abrirModal = (pedido) => {
    let prods = [];
    try { prods = typeof pedido.productos === 'string' ? JSON.parse(pedido.productos) : (pedido.productos || []); } catch (e) { prods = []; }
    setPedidoSeleccionado({ ...pedido, productos: prods });
    setModalAbierto(true);
  };

  const actualizarEstado = async (id, nuevo) => {
    await supabase.from('pedidos_v2').update({ estado: nuevo }).eq('id', id);
    obtenerPedidos();
    toast.success(`ESTADO: ${nuevo.toUpperCase()}`);
  };

  if (cargando) return <Loading />;

  return (
    <div className="p-4 md:p-12 bg-white min-h-screen font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
           <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-1 italic">
              <Zap size={14} fill="currentColor" /> CONTROL DE PLANILLA
           </div>
           <h1 className="text-4xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
             ADMINISTRAR <span className="text-emerald-500 font-[1000]">PEDIDOS</span>
           </h1>
        </div>

        <div className="flex items-center gap-4">
            <div className="bg-white border border-slate-100 px-6 py-3 rounded-2xl flex items-center gap-4 shadow-sm">
                <div className="text-right">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">ITEMS TOTALES</p>
                    <p className="text-2xl font-[1000] text-[#1a2e05] leading-none tracking-tighter">{estadisticas.total}</p>
                </div>
                <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                    <Package size={20} />
                </div>
            </div>
            <button onClick={obtenerPedidos} className="size-12 bg-[#1a2e05] rounded-xl flex items-center justify-center text-emerald-500 hover:bg-emerald-500 transition-all shadow-lg active:scale-90">
                <RefreshCcw size={20} />
            </button>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {['todos', 'pendiente', 'procesando', 'enviado', 'entregado'].map((f) => (
            <button key={f} onClick={() => setFiltroEstado(f)} className={`px-6 py-2 rounded-full text-[9px] font-black uppercase italic border ${filtroEstado === f ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-100 text-slate-300'}`}>{f}</button>
          ))}
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden mb-20">
        <table className="w-full text-left">
          <thead className="bg-white text-[9px] font-black uppercase text-slate-300 tracking-[0.2em]">
            <tr>
              <th className="px-10 py-8 italic font-black">PRODUCTO / JUGADOR</th>
              <th className="px-10 py-8 italic font-black text-center">ID TICKET</th>
              <th className="px-10 py-8 text-center italic font-black">MARCADOR FINAL</th>
              <th className="px-10 py-8 text-center italic font-black">ESTADO</th>
              <th className="px-10 py-8 text-right italic font-black">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pedidos.filter(p => filtroEstado === 'todos' || p.estado === filtroEstado).map((p) => (
              <tr key={p.id} onClick={() => abrirModal(p)} className="hover:bg-slate-50/50 transition-all cursor-pointer group">
                <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                        <div className="size-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="font-[1000] text-[#1a2e05] uppercase italic text-sm leading-tight tracking-tight">{p.cliente_nombre}</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase italic mt-1 tracking-widest">{p.metodo_pago}</p>
                        </div>
                    </div>
                </td>
                <td className="px-10 py-8 text-center">
                    <span className="text-slate-300 font-bold text-[11px] tracking-widest">#{p.id?.slice(-6).toUpperCase()}</span>
                </td>
                <td className="px-10 py-8 text-center">
                    <span className="font-[1000] text-3xl text-[#1a2e05] italic tracking-tighter">${parseCurrency(p.total).toFixed(0)}</span>
                </td>
                <td className="px-10 py-8 text-center" onClick={e => e.stopPropagation()}>
                  <select 
                    value={p.estado} 
                    onChange={(e) => actualizarEstado(p.id, e.target.value)} 
                    className={`text-[8px] font-black uppercase italic tracking-[0.2em] rounded-full px-5 py-2.5 border-none outline-none cursor-pointer transition-all shadow-sm ${getStatusColorDesign(p.estado)}`}
                  >
                    <option value="pendiente">PENDIENTE</option>
                    <option value="procesando">EN COCINA</option>
                    <option value="enviado">EN CAMINO</option>
                    <option value="entregado">EN JUEGO</option>
                  </select>
                </td>
                <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <div className="size-10 bg-[#1a2e05] text-emerald-500 rounded-xl flex items-center justify-center">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DETALLES ALTA PRECISIÓN (ANIMADO) */}
      {modalAbierto && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-[#0f1a04]/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border-b-[12px] border-emerald-500 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 my-auto">
            
            <div className="bg-[#0f1a04] p-6 text-white flex justify-between items-center relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-10"></div>
                 <div className="relative z-10 flex items-center gap-4">
                    <div className="bg-emerald-500 p-2 rounded-xl text-[#0f1a04]"><Receipt size={20}/></div>
                    <div>
                        <h2 className="text-xl font-[1000] italic uppercase tracking-tighter leading-none">PEDIDO <span className="text-emerald-500">#{pedidoSeleccionado.id.toString().slice(-6).toUpperCase()}</span></h2>
                        <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Status: {pedidoSeleccionado.estado}</p>
                    </div>
                 </div>
                 <button onClick={() => setModalAbierto(false)} className="relative z-10 bg-white/5 text-white p-2 rounded-xl hover:bg-red-500 transition-all active:scale-90"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar text-slate-900">
              
              {/* CONTACTO & PAGO */}
              <div className="grid grid-cols-2 gap-3">
                 <div className={`p-4 rounded-2xl border-2 flex flex-col gap-1 ${pedidoSeleccionado.metodo_pago?.toLowerCase().includes('efectivo') ? 'bg-amber-50/50 border-amber-100 text-amber-600' : 'bg-blue-50/50 border-blue-100 text-blue-600'}`}>
                    <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Cobro via</span>
                    <p className="text-xs font-[1000] uppercase italic flex items-center gap-2">
                        {pedidoSeleccionado.metodo_pago?.toLowerCase().includes('efectivo') ? <Banknote size={14}/> : <CreditCard size={14}/>}
                        {pedidoSeleccionado.metodo_pago}
                    </p>
                 </div>
                 <div className="p-4 rounded-2xl border-2 bg-slate-50 border-slate-100 text-slate-500 flex flex-col gap-1">
                    <span className="text-[7px] font-black uppercase tracking-widest opacity-60">Hora de inicio</span>
                    <p className="text-xs font-[1000] uppercase italic flex items-center gap-2"><Clock size={14}/> {new Date(pedidoSeleccionado.fecha_pedido).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                 </div>
              </div>

              {/* JUGADOR TITULAR */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                <div className="flex gap-4 items-center">
                    <div className="size-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><User size={20}/></div>
                    <div>
                        <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em] mb-0.5 italic">Jugador Titular</p>
                        <p className="text-sm font-[1000] text-[#0f1a04] uppercase italic leading-none">{pedidoSeleccionado.cliente_nombre}</p>
                    </div>
                </div>
                <a href={`tel:${pedidoSeleccionado.cliente_telefono}`} className="bg-emerald-500 text-[#0f1a04] p-3 rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all"><Phone size={18} fill="currentColor"/></a>
              </div>

              {/* DIRECCION */}
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex gap-4 items-center">
                <div className="size-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><MapPin size={20}/></div>
                <div>
                    <p className="text-[7px] font-black text-slate-300 uppercase tracking-[0.2em] mb-0.5 italic">Coordenadas de Entrega</p>
                    <p className="text-xs font-[1000] text-[#0f1a04] uppercase italic leading-tight">{pedidoSeleccionado.direccion_entrega}</p>
                </div>
              </div>

              {/* COMANDA */}
              <div className="space-y-3">
                <p className="text-[8px] font-black uppercase italic text-[#0f1a04] tracking-[0.2em] px-2 opacity-40">Detalle de Comanda</p>
                {pedidoSeleccionado.productos.map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-colors animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#0f1a04] text-emerald-400 size-8 flex items-center justify-center rounded-lg text-[10px] font-black italic shadow-md">{item.quantity || item.cantidad}x</span>
                          <p className="font-[1000] text-xs text-[#0f1a04] uppercase italic tracking-tight">{item.nombre}</p>
                        </div>
                        <span className="font-bold text-[10px] text-slate-300 italic">${parseCurrency(item.subtotal || (item.precio * (item.quantity || item.cantidad))).toFixed(0)}</span>
                      </div>
                      
                      {/* --- SECCIÓN DE SABOR (SALSA) NUEVA --- */}
                      {item.salsa && (
                        <div className="mt-2 pl-11">
                          <span className="bg-orange-50 text-orange-600 text-[8px] font-black uppercase px-2.5 py-1 rounded-md border border-orange-100 italic flex items-center gap-1 w-fit shadow-sm">
                            <Droplets size={10} fill="currentColor"/> SABOR: {item.salsa}
                          </span>
                        </div>
                      )}

                      {/* EXTRAS / INGREDIENTES */}
                      {item.extras && item.extras.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pl-11">
                          {item.extras.map((ex, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-100 italic">+ {ex.nombre}</span>
                          ))}
                        </div>
                      )}

                      {/* RESPALDO PARA ESTRUCTURA ANTERIOR SI APLICARA */}
                      {item.ingredientes && item.ingredientes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2 pl-11">
                          {item.ingredientes.map((ing, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-100 italic">+ {ing.nombre}</span>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* TICKET FINAL */}
              <div className="bg-[#0f1a04] p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden border-b-4 border-emerald-500 mt-6">
                <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-emerald-500 rounded-full blur-[60px] opacity-10"></div>
                
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-[9px] font-black text-white/30 uppercase italic"><span>Subtotal Jugada</span><span>${parseCurrency(pedidoSeleccionado.subtotal).toFixed(0)}</span></div>
                    
                    {parseCurrency(pedidoSeleccionado.puntos_usados) > 0 && (
                      <div className="flex justify-between items-center text-emerald-400 py-2 border-y border-white/5 my-2">
                        <div className="flex items-center gap-2"><Ticket size={12}/> <span className="text-[8px] font-black uppercase italic">Wallet Wingool</span></div>
                        <span className="text-xs font-[1000]">-${parseCurrency(pedidoSeleccionado.puntos_usados).toFixed(0)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[9px] font-black text-white/30 uppercase italic"><span>Cargo Envío</span><span>$40</span></div>
                    
                    <div className="flex justify-between items-center text-amber-400 pt-2 border-t border-white/5 mt-2">
                        <div className="flex items-center gap-2"><Coins size={12}/> <span className="text-[8px] font-black uppercase italic">Puntos MVP Ganados</span></div>
                        <span className="text-xs font-[1000]">+{parseCurrency(pedidoSeleccionado.puntos_generados).toFixed(0)}</span>
                    </div>
                </div>

                <div className="flex justify-between items-end pt-4 border-t border-white/10">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase italic text-emerald-500 tracking-[0.2em]">Total Neto</span>
                        <span className="text-[7px] font-black text-white/20 uppercase tracking-widest mt-0.5">Ticket Oficial</span>
                    </div>
                    <span className="text-5xl font-[1000] text-white italic tracking-tighter leading-none">${parseCurrency(pedidoSeleccionado.total).toFixed(0)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getStatusColorDesign = (status) => {
  switch (status) { 
    case 'pendiente': return 'bg-amber-100 text-amber-600'; 
    case 'procesando': return 'bg-blue-100 text-blue-600'; 
    case 'enviado': return 'bg-purple-100 text-purple-600'; 
    case 'entregado': return 'bg-emerald-100 text-emerald-600'; 
    default: return 'bg-slate-100 text-slate-400'; 
  }
};