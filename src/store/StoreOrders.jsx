import React, { useEffect, useState } from "react";
import Loading from "../Components/Common/Loading";
import { supabase } from "../services/supabase"; 
import { 
  CheckCircle, XCircle, Clock, Package, Truck, 
  Mail, Phone, MapPin, User, Star, Coins, Receipt, X 
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

  // 1. Obtener pedidos de la tabla pedidos_v2
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
      console.error("Error al obtener pedidos:", error);
      toast.error("Error al conectar con la base de datos");
    } finally {
      setCargando(false);
    }
  };

  // 2. Actualizar estado
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
      toast.success(`Estado actualizado: ${nuevoEstado}`);
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

  // 3. Función CRÍTICA: Abrir Modal con limpieza de datos JSON
  const abrirModal = (pedido) => {
    let productosValidados = [];
    try {
      // Si productos es un string (JSON de texto), lo parseamos. Si ya es objeto, lo usamos.
      if (typeof pedido.productos === 'string') {
        productosValidados = JSON.parse(pedido.productos);
      } else {
        productosValidados = pedido.productos || [];
      }
    } catch (e) {
      console.error("Error al parsear productos:", e);
      productosValidados = [];
    }

    setPedidoSeleccionado({
      ...pedido,
      productos: Array.isArray(productosValidados) ? productosValidados : []
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setPedidoSeleccionado(null);
    setModalAbierto(false);
  };

  useEffect(() => {
    obtenerPedidos();
    const channel = supabase
      .channel('admin-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pedidos_v2' }, () => obtenerPedidos())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const pedidosFiltrados = filtroEstado === "todos" 
    ? pedidos 
    : pedidos.filter(p => p.estado === filtroEstado);

  if (cargando) return <Loading />;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#1a2e05] uppercase italic">Central de <span className="text-emerald-600">Pedidos</span></h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Dashboard Administrativo V2</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="Total" val={estadisticas.total} color="slate" icon={<Package/>}/>
        <StatCard label="Pendientes" val={estadisticas.pendientes} color="yellow" icon={<Clock/>}/>
        <StatCard label="En Cocina" val={estadisticas.procesando} color="blue" icon={<Package/>}/>
        <StatCard label="En Camino" val={estadisticas.enviados} color="purple" icon={<Truck/>}/>
        <StatCard label="Entregados" val={estadisticas.entregados} color="green" icon={<CheckCircle/>}/>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400">
              <tr>
                <th className="p-6">Orden</th>
                <th className="p-6">Cliente</th>
                <th className="p-6">Pago Final</th>
                <th className="p-6">Estado</th>
                <th className="p-6 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium">
              {pedidosFiltrados.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => abrirModal(p)}>
                  <td className="p-6 font-black italic text-slate-800">#{p.id.slice(-6).toUpperCase()}</td>
                  <td className="p-6">
                    <p className="font-black text-slate-800 uppercase">{p.cliente_nombre}</p>
                    <p className="text-[10px] text-slate-400">{p.cliente_telefono}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-[#1a2e05]">{currency}{parseFloat(p.total).toFixed(2)}</p>
                    {p.puntos_usados > 0 && <span className="text-[9px] text-amber-600 font-black">CANJEÓ PUNTOS</span>}
                  </td>
                  <td className="p-6" onClick={(e) => e.stopPropagation()}>
                    <select 
                      value={p.estado} 
                      onChange={(e) => actualizarEstadoPedido(p.id, e.target.value)}
                      className={`text-[9px] font-black uppercase rounded-xl border-none px-3 py-2 focus:ring-0 ${getStatusColor(p.estado)}`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="procesando">En Cocina</option>
                      <option value="enviado">En Camino</option>
                      <option value="entregado">Entregado</option>
                    </select>
                  </td>
                  <td className="p-6 text-right">
                    <button className="bg-[#1a2e05] text-white p-2 rounded-xl"><ChevronRight size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLES (PROTEGIDO) */}
      {modalAbierto && pedidoSeleccionado && (
        <div className="fixed inset-0 bg-[#1a2e05]/50 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
            
            {/* Cabecera */}
            <div className="bg-[#1a2e05] p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Orden #{pedidoSeleccionado?.id?.toString().slice(-8).toUpperCase()}</h2>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{new Date(pedidoSeleccionado?.fecha_pedido).toLocaleString()}</p>
              </div>
              <button onClick={cerrarModal} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all"><X size={20}/></button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              
              {/* Info Cliente y Financiera */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4 border border-slate-100 text-slate-800">
                  <DetailRow icon={<User size={14}/>} label="Cliente" val={pedidoSeleccionado?.cliente_nombre}/>
                  <DetailRow icon={<Phone size={14}/>} label="Teléfono" val={pedidoSeleccionado?.cliente_telefono}/>
                  <DetailRow icon={<MapPin size={14}/>} label="Dirección de entrega" val={pedidoSeleccionado?.direccion_entrega}/>
                </div>

                <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-2 shadow-lg">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Resumen de Cuenta</p>
                  <div className="flex justify-between text-xs opacity-60">
                    <span>Subtotal + Envío:</span>
                    <span>{currency}{(Number(pedidoSeleccionado?.total || 0) + Number((pedidoSeleccionado?.puntos_usados || 0) / 10)).toFixed(2)}</span>
                  </div>
                  {pedidoSeleccionado?.puntos_usados > 0 && (
                    <div className="flex justify-between text-xs text-amber-400 font-black italic">
                      <span>Descuento Wallet:</span>
                      <span>-${(pedidoSeleccionado.puntos_usados / 10).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-black border-t border-white/10 pt-2 mt-2 text-emerald-400">
                    <span>TOTAL:</span>
                    <span>{currency}{Number(pedidoSeleccionado?.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Lista de Comanda */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-2"><Package size={14}/> Comanda de Cocina</p>
                <div className="space-y-2">
                  {pedidoSeleccionado?.productos?.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className="bg-[#1a2e05] text-white w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black shadow-md">{item?.cantidad}</span>
                        <span className="font-black text-xs text-slate-800 uppercase">{item?.nombre}</span>
                      </div>
                      <span className="font-black text-xs text-slate-600">{currency}{Number(item?.total || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Puntos */}
              <div className="bg-emerald-50 p-4 rounded-3xl flex items-center justify-between border border-emerald-100">
                <div className="flex items-center gap-2">
                  <Star fill="#059669" className="text-emerald-600" size={16}/>
                  <span className="text-[10px] font-black text-emerald-800 uppercase">Puntos otorgados:</span>
                </div>
                <span className="text-xl font-black text-emerald-700">+{pedidoSeleccionado?.puntos_generados || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// COMPONENTES AUXILIARES
function StatCard({ label, val, color, icon }) {
  const themes = {
    slate: "bg-slate-100 text-slate-600",
    yellow: "bg-yellow-100 text-yellow-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600"
  };
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800">{val}</p>
      </div>
      <div className={`${themes[color]} p-3 rounded-2xl`}>{icon}</div>
    </div>
  );
}

function DetailRow({ icon, label, val }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="bg-white p-2.5 rounded-2xl shadow-sm text-emerald-600 border border-slate-100">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
        <p className="text-[11px] font-black text-slate-800 uppercase leading-tight">{val || '---'}</p>
      </div>
    </div>
  );
}

function ChevronRight(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-700';
    case 'procesando': return 'bg-blue-100 text-blue-700';
    case 'enviado': return 'bg-purple-100 text-purple-700';
    case 'entregado': return 'bg-green-100 text-green-700';
    default: return 'bg-slate-100 text-slate-500';
  }
};