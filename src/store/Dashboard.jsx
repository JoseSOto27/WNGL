import { useEffect, useState } from "react";
import { 
  CircleDollarSignIcon, 
  ShoppingBasketIcon, 
  TrendingUpIcon,
  Trophy,
  Activity,
  RefreshCcw,
  Clock,
  Coins,
  Zap,
  Target,
  ArrowRight
} from "lucide-react";
import Loading from "../Components/Common/Loading";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const currency = "$";
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalPotentialProfit: 0,
    totalPointsIssued: 0,
    recentOrders: [],
    outOfStock: 0
  });

  const fetchDashboardData = async () => {
    try {
      const { data: productos } = await supabase.from('productos').select('*');
      const { data: pedidos, error: pedidosErr } = await supabase
        .from('pedidos_v2')
        .select('*');

      if (pedidosErr) return;

      const vent = pedidos || [];
      const prods = productos || [];

      const totalRev = vent.reduce((sum, p) => {
        const valor = p.total || p.total_pedido || p.monto || 0;
        return sum + parseFloat(valor);
      }, 0);

      const pointsIssued = vent.reduce((sum, p) => {
        const pts = p.puntos_generados || p.puntos || p.wingool_points || 0;
        return sum + parseInt(pts);
      }, 0);

      setDashboardData({
        totalProducts: prods.length,
        totalRevenue: totalRev,
        totalPotentialProfit: totalRev * 0.30,
        totalPointsIssued: pointsIssued,
        recentOrders: vent.sort((a, b) => new Date(b.created_at || b.fecha) - new Date(a.created_at || a.fecha)).slice(0, 5),
        outOfStock: prods.filter(p => p.disponible === false).length
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen pb-28 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER MVP SUTIL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em] mb-1 italic">
             <Zap size={12} fill="currentColor" /> Análisis de Liga
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
            ESTADIO <span className="text-emerald-500">DASHBOARD</span>
          </h1>
        </div>
        
        <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
           <div className="flex flex-col text-right">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Status</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase italic">Online</span>
           </div>
           <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></div>
        </div>
      </div>

      {/* TARJETAS DE RENDIMIENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard title="Ventas Totales" value={`${currency}${dashboardData.totalRevenue.toLocaleString()}`} icon={CircleDollarSignIcon} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard title="Wallet Puntos" value={dashboardData.totalPointsIssued.toLocaleString()} icon={Coins} color="text-amber-500" bg="bg-amber-50" />
        <StatCard title="Utilidad Est." value={`${currency}${dashboardData.totalPotentialProfit.toLocaleString()}`} icon={TrendingUpIcon} color="text-blue-500" bg="bg-blue-50" />
        <StatCard title="Fichajes Menú" value={dashboardData.totalProducts} icon={ShoppingBasketIcon} color="text-purple-500" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PANEL MARCADOR (DARK MODE MVP) */}
        <div className="lg:col-span-5">
          <div className="bg-[#1a2e05] rounded-[3rem] p-8 text-white shadow-xl h-full relative overflow-hidden border border-white/5">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500 rounded-full blur-[100px] opacity-10"></div>
            
            <h2 className="text-[10px] font-black uppercase italic tracking-[0.3em] mb-10 flex items-center gap-2 text-emerald-400">
               <Trophy size={16} /> Marcador de Temporada
            </h2>
            
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col gap-1">
                <span className="font-black italic uppercase text-white/20 text-[9px] tracking-widest">Ingresos Reales</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-5xl font-[1000] italic text-white tracking-tighter">{currency}{dashboardData.totalRevenue.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 pt-6 border-t border-white/5">
                <span className="font-black italic uppercase text-white/20 text-[9px] tracking-widest">Puntos MVP Emitidos</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-[1000] italic text-amber-400 tracking-tighter">{dashboardData.totalPointsIssued.toLocaleString()}</span>
                   <span className="text-amber-400/40 font-black text-[10px] uppercase italic tracking-widest">PTS</span>
                </div>
              </div>
            </div>

            <div className="mt-12 bg-white/5 p-5 rounded-2xl border border-white/5 relative z-10">
              <div className="flex justify-between items-center mb-3">
                 <p className="text-[9px] font-black uppercase italic text-emerald-400 tracking-widest">Meta Mensual</p>
                 <span className="text-[9px] font-black text-white/30 italic">70% COMPLETADO</span>
              </div>
              <div className="bg-black/20 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[70%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* ÚLTIMAS JUGADAS RECIENTES */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter">
                ÚLTIMAS <span className="text-emerald-500">JUGADAS</span>
              </h2>
              <Activity className="text-slate-100" size={32} />
            </div>

            <div className="space-y-3">
              {dashboardData.recentOrders.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                  <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Sin actividad en el campo</p>
                </div>
              ) : (
                dashboardData.recentOrders.map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-emerald-100 hover:bg-white transition-all group cursor-pointer shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#1a2e05] text-emerald-400 rounded-xl size-10 flex items-center justify-center shadow-md">
                        <Clock size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-[1000] uppercase italic text-[#1a2e05] tracking-tight">{pedido.cliente_nombre || "Ticket Externo"}</h4>
                        <p className="text-[8px] font-black text-slate-400 uppercase italic mt-0.5">ID: #{pedido.id.toString().slice(-4).toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <span className="text-xl font-[1000] text-[#1a2e05] italic block tracking-tighter leading-none">
                          {currency}{parseFloat(pedido.total || 0).toFixed(0)}
                        </span>
                        <span className="text-[8px] font-black text-emerald-500 uppercase italic tracking-widest mt-1 block">
                          +{pedido.puntos_generados || 0} PTS
                        </span>
                      </div>
                      <ArrowRight size={16} className="text-slate-200 group-hover:text-[#1a2e05] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))
              )}
            </div>

            <button className="w-full mt-8 py-4 rounded-xl border border-slate-100 text-[9px] font-black text-slate-400 uppercase italic tracking-widest hover:bg-[#1a2e05] hover:text-white transition-all">
               Ver reporte completo
            </button>
          </div>
        </div>
      </div>

      {/* REFRESH SUTIL */}
      <button 
        onClick={fetchDashboardData} 
        className="fixed bottom-8 right-8 bg-[#1a2e05] text-emerald-500 p-4 rounded-2xl shadow-xl hover:bg-emerald-500 hover:text-white transition-all z-50 group active:scale-95 border border-white/10"
      >
        <RefreshCcw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
      </button>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-lg hover:border-emerald-50">
      <div className={`w-12 h-12 rounded-xl ${bg} ${color} flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform`}>
        <Icon size={24} strokeWidth={3} />
      </div>
      <div>
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 italic">{title}</p>
        <h3 className="text-3xl font-[1000] italic leading-none text-[#1a2e05] tracking-tighter">{value}</h3>
      </div>
      <Activity className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50/50 group-hover:text-emerald-50/30 transition-colors duration-500" />
    </div>
  );
}