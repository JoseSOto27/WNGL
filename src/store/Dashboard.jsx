import React, { useEffect, useState } from "react";
import { 
  CircleDollarSign, ShoppingBasket, Trophy, Activity, RefreshCcw, 
  Coins, Zap, User as UserIcon, Star, Search, BarChart3, 
  Calendar, ArrowDownCircle, ArrowUpCircle, ChevronRight 
} from "lucide-react";
import Loading from "../Components/Common/Loading";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [puntosPorDia, setPuntosPorDia] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [data, setData] = useState({
    ventas: 0,
    puntosCalle: 0,
    utilidad: 0,
    productos: 0
  });

  // Función segura para procesar números
  const val = (n) => parseFloat(n) || 0;

  const loadAll = async () => {
    try {
      setLoading(true);
      
      // Consultas en paralelo para velocidad
      const [resProds, resPedidos, resProfiles] = await Promise.all([
        supabase.from('productos').select('id'),
        supabase.from('pedidos_v2').select('total, puntos_generados, puntos_usados, fecha_pedido'),
        supabase.from('profiles').select('id, nombre, email, points').order('points', { ascending: false })
      ]);

      const pedidos = resPedidos.data || [];
      const profiles = resProfiles.data || [];

      // 1. Calcular Totales
      const totalRev = pedidos.reduce((s, p) => s + val(p.total), 0);
      const totalPts = pedidos.reduce((s, p) => s + val(p.puntos_generados), 0);

      setData({
        ventas: totalRev,
        puntosCalle: totalPts,
        utilidad: totalRev * 0.30,
        productos: resProds.data?.length || 0
      });

      setUsuarios(profiles);

      // 2. Lógica de Puntos por Día
      const historial = pedidos.reduce((acc, p) => {
        const d = p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleDateString() : '---';
        if (!acc[d]) acc[d] = { fecha: d, gen: 0, gas: 0 };
        acc[d].gen += val(p.puntos_generados);
        acc[d].gas += val(p.puntos_usados);
        return acc;
      }, {});

      setPuntosPorDia(Object.values(historial).reverse().slice(0, 5));

    } catch (e) {
      console.error("Error crítico:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  if (loading) return <Loading />;

  const filtrados = usuarios.filter(u => 
    (u.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-4 md:p-10 font-sans text-slate-900">
      
      {/* --- CABECERA --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-slate-100 pb-8 gap-4">
        <div>
          <p className="text-emerald-500 font-black text-[10px] tracking-[0.4em] uppercase italic mb-1">Wingool Analytics</p>
          <h1 className="text-3xl md:text-5xl font-[1000] text-[#0f1a04] uppercase italic tracking-tighter">
            ESTADIO <span className="text-emerald-500">DASHBOARD</span>
          </h1>
        </div>
        <button onClick={loadAll} className="bg-[#0f1a04] text-emerald-500 p-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
          <RefreshCcw size={20} />
        </button>
      </div>

      {/* --- TARJETAS TOP (Estilo Wingool Sutil) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { t: "Ventas Totales", v: `$${data.ventas.toLocaleString()}`, i: CircleDollarSign, c: "text-emerald-500", b: "bg-emerald-50" },
          { t: "Puntos Generados", v: data.puntosCalle.toLocaleString(), i: Coins, c: "text-amber-500", b: "bg-amber-50" },
          { t: "Utilidad Est.", v: `$${data.utilidad.toLocaleString()}`, i: Zap, c: "text-blue-500", b: "bg-blue-50" },
          { t: "Fichajes Menú", v: data.productos, i: ShoppingBasket, c: "text-purple-500", b: "bg-purple-50" }
        ].map((card, idx) => (
          <div key={idx} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
            <div className={`size-10 rounded-xl ${card.b} ${card.c} flex items-center justify-center mb-4`}>
              <card.i size={20} strokeWidth={2.5} />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic leading-none mb-1">{card.t}</p>
            <p className="text-2xl font-[1000] text-[#0f1a04] italic tracking-tighter leading-none">{card.v}</p>
          </div>
        ))}
      </div>

      {/* --- PANEL CENTRAL: MARCADOR Y JUGADORES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        
        {/* Marcador Central */}
        <div className="lg:col-span-5 bg-[#0f1a04] rounded-[3rem] p-10 text-white relative overflow-hidden border-b-[12px] border-emerald-500 shadow-2xl min-h-[400px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-10 -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-[1000] uppercase italic tracking-tighter mb-10 text-emerald-500">Marcador General</h3>
            <div className="space-y-10">
              <div>
                <p className="text-[10px] font-black text-white/20 uppercase italic tracking-widest mb-1">Ingresos Globales</p>
                <p className="text-5xl font-[1000] italic tracking-tighter leading-none">${data.ventas.toLocaleString()}</p>
              </div>
              <div className="flex gap-2 items-end h-24">
                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-lg hover:bg-emerald-500 transition-all" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              <p className="text-[9px] font-black text-white/20 uppercase italic text-center tracking-[0.3em]">Rendimiento de Temporada</p>
            </div>
          </div>
        </div>

        {/* Estadio de Jugadores */}
        <div className="lg:col-span-7 bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <h2 className="text-2xl font-[1000] text-[#0f1a04] uppercase italic tracking-tighter">Estadio de <span className="text-emerald-500">Jugadores</span></h2>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
              <input 
                type="text" 
                placeholder="BUSCAR JUGADOR..." 
                className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-9 pr-4 text-[10px] font-black uppercase italic outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[350px] pr-2">
            {filtrados.length > 0 ? filtrados.slice(0, 10).map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-white transition-all group">
                <div className="flex items-center gap-3">
                  <div className="size-10 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-[#0f1a04] group-hover:text-emerald-500 transition-all">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <p className="text-[11px] font-[1000] text-[#0f1a04] uppercase italic truncate max-w-[120px]">{u.nombre || "Jugador"}</p>
                    <p className="text-[10px] font-bold text-emerald-500 italic">{(u.points || 0).toLocaleString()} <span className="text-[8px] text-slate-300">PTS</span></p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-200 group-hover:text-emerald-500" />
              </div>
            )) : <p className="col-span-2 text-center py-20 text-slate-300 text-[10px] font-black uppercase italic">Sin jugadores en cancha</p>}
          </div>
        </div>
      </div>

      {/* --- TABLA DE PUNTOS DIARIOS (EL NUEVO REPORTE) --- */}
      <div className="bg-[#0f1a04] rounded-[3.5rem] p-8 border-b-[16px] border-emerald-500 shadow-2xl text-white">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-emerald-500 p-3 rounded-2xl text-[#0f1a04]">
            <Activity size={24} strokeWidth={3} />
          </div>
          <div>
            <h2 className="text-2xl font-[1000] uppercase italic tracking-tighter leading-none">Flujo de <span className="text-emerald-500">Puntos</span></h2>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-1">Historial táctico de recompensas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-white/10 uppercase italic border-b border-white/5">
                <th className="px-6 py-4">CALENDARIO</th>
                <th className="px-6 py-4 text-center">GENERADOS (+)</th>
                <th className="px-6 py-4 text-center">GASTADOS (-)</th>
                <th className="px-6 py-4 text-right">BALANCE DIA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {puntosPorDia.length > 0 ? puntosPorDia.map((dia, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-6 font-[1000] text-white italic text-xs uppercase tracking-tighter">{dia.fecha}</td>
                  <td className="px-6 py-6 text-center">
                    <span className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-xl font-[1000] text-xs italic border border-emerald-500/20">+{dia.gen.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="bg-red-500/10 text-red-400 px-4 py-1.5 rounded-xl font-[1000] text-xs italic border border-red-500/20">-{dia.gas.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-6 text-right font-[1000] text-xl italic text-white group-hover:text-emerald-400">{(dia.gen - dia.gas).toLocaleString()}</td>
                </tr>
              )) : <tr><td colSpan="4" className="text-center py-10 opacity-20 italic">Sin movimientos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}