import { useEffect, useState } from "react";
import { 
  CircleDollarSignIcon, 
  ShoppingBasketIcon, 
  TrendingUpIcon,
  Trophy,
  Activity,
  RefreshCcw,
  Clock,
  Coins
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
      // 1. Consultar productos
      const { data: productos } = await supabase.from('productos').select('*');
      
      // 2. Consultar pedidos_v2
      const { data: pedidos, error: pedidosErr } = await supabase
        .from('pedidos_v2')
        .select('*');

      if (pedidosErr) {
        console.error("ERROR CRÍTICO AL LEER pedidos_v2:", pedidosErr);
        return;
      }

      // --- LOG DE DIAGNÓSTICO (Presiona F12 en tu navegador para verlo) ---
      if (pedidos && pedidos.length > 0) {
        console.log("¡PEDIDOS ENCONTRADOS!", pedidos.length);
        console.log("PRIMER PEDIDO RECIBIDO:", pedidos[0]);
        // Revisa en la consola si los nombres son 'total', 'puntos', 'puntos_generados', etc.
      } else {
        console.warn("LA TABLA pedidos_v2 ESTÁ VACÍA O NO TIENE DATOS");
      }

      const vent = pedidos || [];
      const prods = productos || [];

      // 3. CÁLCULOS FLEXIBLES (Intenta varios nombres de columna comunes)
      const totalRev = vent.reduce((sum, p) => {
        // Intenta obtener el total de varias formas posibles
        const valor = p.total || p.total_pedido || p.monto || 0;
        return sum + parseFloat(valor);
      }, 0);

      const pointsIssued = vent.reduce((sum, p) => {
        // Intenta obtener puntos de varias formas
        const pts = p.puntos_generados || p.puntos || p.wingool_points || 0;
        return sum + parseInt(pts);
      }, 0);

      setDashboardData({
        totalProducts: prods.length,
        totalRevenue: totalRev,
        totalPotentialProfit: totalRev * 0.30,
        totalPointsIssued: pointsIssued,
        // Ordenamos manualmente por fecha si created_at falla
        recentOrders: vent.sort((a, b) => new Date(b.created_at || b.fecha) - new Date(a.created_at || a.fecha)).slice(0, 5),
        outOfStock: prods.filter(p => p.disponible === false).length
      });

    } catch (err) {
      console.error("Error en el motor del Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen pb-28">
      
      {/* HEADER */}
      <div className="mb-10">
        <span className="bg-[#1a2e05] text-emerald-500 text-[10px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-lg mb-2 inline-block">
          Wingool Live Engine
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-[#1a2e05] uppercase italic tracking-tighter leading-none">
          Dashboard <span className="text-emerald-600">Wingool</span>
        </h1>
      </div>

      {/* TARJETAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Ventas Totales" value={`${currency}${dashboardData.totalRevenue.toLocaleString()}`} icon={CircleDollarSignIcon} color="text-emerald-500" bg="bg-emerald-50" />
        <StatCard title="Wingool Points" value={dashboardData.totalPointsIssued.toLocaleString()} icon={Coins} color="text-yellow-500" bg="bg-yellow-50" />
        <StatCard title="Ganancia Est." value={`${currency}${dashboardData.totalPotentialProfit.toLocaleString()}`} icon={TrendingUpIcon} color="text-amber-500" bg="bg-amber-50" />
        <StatCard title="Productos" value={dashboardData.totalProducts} icon={ShoppingBasketIcon} color="text-blue-500" bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SCORE PANEL */}
        <div className="lg:col-span-5">
          <div className="bg-[#1a2e05] rounded-[3rem] p-8 text-white shadow-2xl h-full relative overflow-hidden">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8">
               <Trophy className="inline mr-2 text-emerald-500" /> Marcador Global
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="font-black italic uppercase text-white/40 text-[10px]">Total Revenue</span>
                <span className="text-2xl font-black italic text-emerald-500">{currency}{dashboardData.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="font-black italic uppercase text-white/40 text-[10px]">Points en Circulación</span>
                <span className="text-2xl font-black italic text-yellow-500">{dashboardData.totalPointsIssued.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-12 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <p className="text-[10px] font-black uppercase italic text-emerald-500 mb-1 tracking-widest text-center">Rendimiento de Ventas</p>
              <div className="bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[30%] shadow-[0_0_10px_#10b981]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* LISTA DE ACTIVIDAD */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm h-full">
            <h2 className="text-2xl font-black text-[#1a2e05] uppercase italic tracking-tighter mb-8">
              Últimas <span className="text-emerald-600">Jugadas</span>
            </h2>
            <div className="space-y-4">
              {dashboardData.recentOrders.length === 0 ? (
                <div className="py-20 text-center text-slate-300 font-black uppercase italic text-xs tracking-widest">
                  Esperando datos de pedidos_v2...
                </div>
              ) : (
                dashboardData.recentOrders.map((pedido) => (
                  <div key={pedido.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-emerald-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#1a2e05] text-emerald-500 rounded-xl w-10 h-10 flex items-center justify-center">
                        <Clock size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase italic text-[#1a2e05]">{pedido.cliente_nombre || pedido.nombre || "Anónimo"}</h4>
                        <span className="text-[9px] font-black text-slate-400 uppercase italic">
                           ID: {pedido.id.toString().slice(-4)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#1a2e05] italic block leading-none">
                        {currency}{parseFloat(pedido.total || pedido.total_pedido || 0).toFixed(0)}
                      </span>
                      <span className="text-[9px] font-black text-emerald-500 uppercase italic tracking-widest">
                        +{pedido.puntos_generados || pedido.puntos || 0} PTS
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <button onClick={fetchDashboardData} className="fixed bottom-8 right-8 bg-[#1a2e05] text-white p-5 rounded-full shadow-2xl hover:bg-emerald-600 transition-all z-50">
        <RefreshCcw size={24} />
      </button>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
  return (
    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 relative group overflow-hidden transition-all hover:shadow-xl">
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-6`}>
        <Icon size={24} strokeWidth={3} />
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">{title}</p>
      <h3 className="text-4xl font-black italic leading-none text-[#1a2e05] tracking-tighter">{value}</h3>
      <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-slate-50 group-hover:text-emerald-50 transition-colors" />
    </div>
  );
}