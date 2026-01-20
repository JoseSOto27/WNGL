import React, { useEffect, useState } from "react";
import Loading from "../Components/Common/Loading";
import { supabase } from "../services/supabase"; 
import { 
  CheckCircle, Clock, Package, Truck, 
  Phone, MapPin, User, Star, X, ChevronRight, Zap, Trophy, Receipt,
  Hash, Calendar, CreditCard, Printer
} from "lucide-react";
import toast from "react-hot-toast";

export default function PedidosTienda() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total: 0, pendientes: 0, procesando: 0, enviados: 0, entregados: 0
  });
  const [filtroEstado, setFiltroEstado] = useState("todos");
  
  const currency = "$";

  const obtenerPedidos = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos_v2')
        .select('*')
        .order('fecha_pedido', { ascending: false });

      if (error) throw error;
      calcularEstadisticas(data || []);
      setPedidos(data || []);
    } catch (error) {
      toast.error("Error al conectar con la base de datos");
    } finally {
      setCargando(false);
    }
  };

  const actualizarEstadoPedido = async (pedidoId, nuevoEstado) => {
    try {
      const { error } = await supabase
        .from('pedidos_v2')
        .update({ estado: nuevoEstado })
        .eq('id', pedidoId);

      if (error) throw error;
      setPedidos((prev) =>
        prev.map((p) => p.id === pedidoId ? { ...p, estado: nuevoEstado } : p)
      );
      toast.success(`JUGADA ACTUALIZADA: ${nuevoEstado.toUpperCase()}`);
    } catch (error) {
      toast.error("Error al cambiar estado");
    }
  };

  const calcularEstadisticas = (data) => {
    setEstadisticas({
      total: data.length,
      pendientes: data.filter(p => p.estado === 'pendiente').length,
      procesando: data.filter(p => p.estado === 'procesando').length,
      enviados: data.filter(p => p.estado === 'enviado').length,
      entregados: data.filter(p => p.estado === 'entregado').length
    });
  };

  const abrirModal = (pedido) => {
    if (!pedido) return;
    let productosValidados = [];
    try {
      productosValidados = typeof pedido.productos === 'string' 
        ? JSON.parse(pedido.productos) 
        : (pedido.productos || []);
    } catch (e) {
      productosValidados = [];
    }
    setPedidoSeleccionado({
      ...pedido,
      productos: Array.isArray(productosValidados) ? productosValidados : []
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPedidoSeleccionado(null);
  };

  useEffect(() => {
    obtenerPedidos();
    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos_v2' }, () => obtenerPedidos())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  if (cargando) return <Loading />;

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER MVP SUTIL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em] mb-1 italic">
             <Zap size={12} fill="currentColor" /> Centro de Operaciones
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
            CENTRAL DE <span className="text-emerald-500">PEDIDOS</span>
          </h1>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
           {['todos', 'pendiente', 'entregado'].map((f) => (
             <button 
              key={f}
              onClick={() => setFiltroEstado(f)}
              className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase italic tracking-widest transition-all ${filtroEstado === f ? 'bg-[#1a2e05] text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* STATS REFINADAS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <StatCard label="Total" val={estadisticas.total} color="slate" icon={<Receipt size={18}/>}/>
        <StatCard label="Pendientes" val={estadisticas.pendientes} color="yellow" icon={<Clock size={18}/>}/>
        <StatCard label="Cocina" val={estadisticas.procesando} color="blue" icon={<Zap size={18}/>}/>
        <StatCard label="Reparto" val={estadisticas.enviados} color="purple" icon={<Truck size={18}/>}/>
        <StatCard label="Éxito" val={estadisticas.entregados} color="green" icon={<Trophy size={18}/>}/>
      </div>

      {/* TABLA DE PEDIDOS SUTIL */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 italic">Ticket</th>
                <th className="px-8 py-5 italic">Jugador / Cliente</th>
                <th className="px-8 py-5 text-center italic">Importe</th>
                <th className="px-8 py-5 text-center italic">Estado de Jugada</th>
                <th className="px-8 py-5 text-right italic">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pedidos.filter(p => filtroEstado === 'todos' || p.estado === filtroEstado).map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => abrirModal(p)}>
                  <td className="px-8 py-5">
                    <span className="font-black italic text-[#1a2e05] text-xs bg-slate-100 px-3 py-1 rounded-lg">
                      #{p.id?.slice(-6).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-black text-[#1a2e05] uppercase italic text-xs tracking-tight">{p.cliente_nombre}</p>
                    <p className="text-slate-400 text-[8px] font-bold mt-0.5 tracking-wider">{p.cliente_telefono}</p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-[1000] text-xl text-[#1a2e05] italic tracking-tighter">
                      {currency}{Number(p.total || 0).toFixed(0)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={p.estado} 
                      onChange={(e) => actualizarEstadoPedido(p.id, e.target.value)}
                      className={`text-[8px] font-black uppercase italic tracking-widest rounded-full border border-transparent px-4 py-2 cursor-pointer outline-none transition-all shadow-sm ${getStatusColor(p.estado)}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="procesando">En Cocina</option>
                      <option value="enviado">En Camino</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="inline-flex bg-slate-50 text-slate-300 group-hover:bg-[#1a2e05] group-hover:text-emerald-400 size-9 rounded-xl items-center justify-center transition-all">
                      <ChevronRight size={18} strokeWidth={3} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLES - TICKET CLEAN */}
      {modalAbierto && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-[#1a2e05]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in duration-200">
            
            <div className="p-6 border-b border-dashed border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="bg-[#1a2e05] p-2 rounded-xl text-emerald-500 shadow-lg shadow-emerald-900/20">
                    <Receipt size={20} />
                 </div>
                 <div>
                    <h2 className="text-lg font-[1000] italic uppercase tracking-tighter text-[#1a2e05]">
                      TICKET <span className="text-emerald-600">#{(pedidoSeleccionado?.id || "").toString().slice(-6).toUpperCase()}</span>
                    </h2>
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                      {new Date(pedidoSeleccionado?.fecha_pedido).toLocaleTimeString()}
                    </p>
                 </div>
              </div>
              <button onClick={cerrarModal} className="bg-slate-50 text-slate-400 p-2 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all">
                <X size={18} strokeWidth={3}/>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              
              <div className="grid grid-cols-1 gap-3 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
                 <DetailRow icon={<User size={12}/>} label="Cliente" val={pedidoSeleccionado?.cliente_nombre}/>
                 <DetailRow icon={<Phone size={12}/>} label="WhatsApp" val={pedidoSeleccionado?.cliente_telefono}/>
                 <DetailRow icon={<MapPin size={12}/>} label="Ubicación" val={pedidoSeleccionado?.direccion_entrega}/>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black text-[#1a2e05] uppercase tracking-widest italic flex items-center gap-2 px-1">
                   <Zap size={12} fill="currentColor" className="text-emerald-500"/> Comanda Técnica
                </p>
                
                <div className="space-y-2">
                  {pedidoSeleccionado?.productos?.map((item, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="bg-[#1a2e05] text-emerald-400 size-7 flex items-center justify-center rounded-lg text-[10px] font-black italic">
                            {item?.cantidad}
                          </span>
                          <div>
                            <p className="font-black text-[11px] text-[#1a2e05] uppercase italic leading-none">{item?.nombre}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item?.extras?.length > 0 ? item.extras.map((ex, idx) => (
                                <span key={idx} className="text-[7px] text-emerald-600 font-bold uppercase italic">+ {ex?.nombre}</span>
                              )) : <span className="text-[7px] text-slate-300 font-bold uppercase italic">Clásico</span>}
                            </div>
                          </div>
                        </div>
                        <span className="font-black text-xs text-[#1a2e05] italic">${Number(item?.total).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-5 space-y-2 px-2">
                 <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase italic">
                    <span>Subtotal + Envío</span>
                    <span>{currency}{(Number(pedidoSeleccionado?.total || 0) + (pedidoSeleccionado?.puntos_usados ? pedidoSeleccionado.puntos_usados / 10 : 0)).toFixed(0)}</span>
                 </div>
                 {pedidoSeleccionado?.puntos_usados > 0 && (
                   <div className="flex justify-between text-[10px] font-black text-amber-500 uppercase italic">
                      <span>✨ Wallet Puntos</span>
                      <span>-{currency}{(pedidoSeleccionado.puntos_usados / 10).toFixed(0)}</span>
                   </div>
                 )}
                 <div className="flex justify-between items-end pt-2">
                    <span className="text-xs font-black text-[#1a2e05] uppercase italic tracking-widest">TOTAL</span>
                    <span className="text-4xl font-[1000] text-emerald-600 italic tracking-tighter leading-none">
                      {currency}{Number(pedidoSeleccionado?.total || 0).toFixed(0)}
                    </span>
                 </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                <div className="flex-1 bg-[#1a2e05] p-4 rounded-2xl text-white flex flex-col justify-center relative overflow-hidden group">
                   <Trophy size={40} className="absolute -right-2 -bottom-2 text-white/5 rotate-12" />
                   <span className="text-[7px] font-black uppercase text-emerald-400 tracking-widest mb-1 italic">Recompensa MVP</span>
                   <span className="text-xl font-[1000] italic leading-none">+{pedidoSeleccionado?.puntos_generados || 0} <span className="text-[10px]">PTS</span></span>
                </div>
                <div className="flex-1 bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-center">
                   <span className="text-[7px] font-black uppercase text-slate-300 tracking-widest mb-1 italic">Método Pago</span>
                   <span className="text-xs font-black uppercase italic text-[#1a2e05]">{pedidoSeleccionado?.metodo_pago || "Efectivo"}</span>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, val, color, icon }) {
  const themes = {
    slate: "bg-white text-slate-300 border-slate-100 shadow-sm",
    yellow: "bg-amber-50 text-amber-500 border-amber-100",
    blue: "bg-blue-50 text-blue-500 border-blue-100",
    purple: "bg-purple-50 text-purple-500 border-purple-100",
    green: "bg-emerald-50 text-emerald-500 border-emerald-100"
  };
  return (
    <div className={`p-6 rounded-[2rem] border transition-all hover:shadow-lg hover:-translate-y-0.5 ${themes[color]}`}>
      <div className="flex justify-between items-start mb-3">
        <p className="text-[8px] font-black uppercase tracking-widest italic opacity-60">{label}</p>
        <div className="opacity-40">{icon}</div>
      </div>
      <p className="text-3xl font-[1000] text-[#1a2e05] italic tracking-tighter leading-none">{val}</p>
    </div>
  );
}

function DetailRow({ icon, label, val }) {
  return (
    <div className="flex gap-3 items-center">
      <div className="text-emerald-500 flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-[9px] font-black text-[#1a2e05] uppercase italic leading-tight truncate">{val || '---'}</p>
      </div>
    </div>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pendiente': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'procesando': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'enviado': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'entregado': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    default: return 'bg-slate-50 text-slate-400 border-slate-100';
  }
};