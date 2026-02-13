import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { 
  ShoppingBag, MapPin, Star, Plus, 
  Settings, Save, Trash2, Loader2, Clock, CheckCircle, 
  X, Package, Receipt, Truck, UtensilsCrossed, Wallet, Ticket, Flame, ChevronRight, Droplets
} from "lucide-react";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: "", points: 0 });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "", address: "" });

  // CONFIGURACIÓN DE ESTATUS
  const statusConfig = {
    pendiente: { step: 1, label: "PEDIDO RECIBIDO", desc: "Estamos confirmando tu orden", color: "text-amber-500", bg: "bg-amber-500/10", icon: <Clock size={20} className="animate-pulse" /> },
    procesando: { step: 2, label: "PREPARANDO", desc: "Tu comida está en la cocina", color: "text-blue-500", bg: "bg-blue-500/10", icon: <Flame size={20} className="animate-bounce" /> },
    enviado: { step: 3, label: "EN CAMINO", desc: "El repartidor va hacia ti", color: "text-fuchsia-500", bg: "bg-fuchsia-500/10", icon: <Truck size={20} /> },
    entregado: { step: 4, label: "ENTREGADO", desc: "¡Que disfrutes tu Wingool!", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: <CheckCircle size={20} /> }
  };

  useEffect(() => { fetchUserData(); }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      setUser(authUser);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', authUser.id).single();
      if (prof) setProfile({ full_name: prof.nombre || authUser.user_metadata?.full_name, points: prof.points || 0 });
      const { data: addr } = await supabase.from('direcciones').select('*').eq('user_id', authUser.id);
      if (addr) setAddresses(addr);
      const { data: ords } = await supabase.from('pedidos_v2').select('*').eq('customer_id', authUser.id).order('fecha_pedido', { ascending: false });
      if (ords) setOrders(ords);
    } catch (err) { console.error("Error:", err); } finally { setLoading(false); }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    if (!user) return;
    const { error } = await supabase.from('direcciones').insert([{ user_id: user.id, label: newAddr.label, address: newAddr.address }]);
    if (!error) { toast.success("Dirección guardada"); setShowAddressModal(false); setNewAddr({ label: "", address: "" }); fetchUserData(); }
  };

  const deleteAddress = async (id) => {
    const { error } = await supabase.from('direcciones').delete().eq('id', id);
    if (!error) { toast.success("Dirección eliminada"); fetchUserData(); }
  };

  const handleUpdateProfile = async () => {
    const { error } = await supabase.from('profiles').update({ nombre: profile.full_name }).eq('id', user.id);
    if (!error) {
      await supabase.auth.updateUser({ data: { full_name: profile.full_name } });
      toast.success("Perfil actualizado");
      setIsEditingProfile(false);
      fetchUserData();
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white italic font-black text-[#1a2e05]"><Loader2 className="animate-spin mr-2" /> ENTRANDO A LOS VESTIDORES...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex items-center gap-6">
            <img src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}`} className="w-24 h-24 rounded-full border-4 border-emerald-50 shadow-md" alt="Avatar" />
            <div className="flex-1">
                <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">{profile.full_name}</h1>
                <p className="text-slate-400 font-bold text-[10px] mt-2 tracking-widest uppercase">{user?.email}</p>
                <button onClick={() => setIsEditingProfile(true)} className="mt-3 text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1 hover:text-[#1a2e05] transition-all"><Settings size={14} /> Editar Perfil</button>
            </div>
          </div>

          <div className="bg-[#1a2e05] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border-b-8 border-emerald-500">
            <Star className="absolute -right-6 -top-6 w-32 h-32 text-emerald-500 opacity-20 rotate-12" />
            <p className="text-emerald-400 font-black uppercase text-[10px] tracking-widest italic leading-none">Mi Balance</p>
            <h2 className="text-5xl font-black mt-2 italic tracking-tighter">{profile.points.toLocaleString()} PTS</h2>
            <p className="text-[11px] text-white font-black uppercase tracking-[0.2em] mt-1 opacity-90 italic">Wallet Wingool</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-black text-slate-800 uppercase italic tracking-tighter"><MapPin size={20} className="text-emerald-600" /> Direcciones</h2>
              <button onClick={() => setShowAddressModal(true)} className="bg-emerald-600 text-white p-2 rounded-xl shadow-lg active:scale-95 transition-all"><Plus size={18} /></button>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
              {addresses.map((addr) => (
                <div key={addr.id} className="p-5 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="leading-tight">
                    <p className="font-black text-slate-800 text-xs uppercase italic">{addr.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase truncate max-w-[150px]">{addr.address}</p>
                  </div>
                  <button onClick={() => deleteAddress(addr.id)} className="text-slate-200 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-black text-slate-800 uppercase italic px-4 tracking-tighter"><ShoppingBag size={20} className="text-emerald-600" /> Mis Pedidos</h2>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
              {orders.length > 0 ? orders.map((order) => {
                const config = statusConfig[order.estado] || statusConfig.pendiente;
                return (
                  <div key={order.id} onClick={() => setSelectedOrder(order)} className="p-6 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-all active:scale-[0.98] group">
                    <div className="flex items-center gap-5">
                      <div className={`p-3 rounded-2xl ${config.bg} ${config.color} transition-all duration-500`}>{config.icon}</div>
                      <div>
                        <p className="font-black text-slate-800 text-sm uppercase italic tracking-tighter leading-none">#{order.id.toString().slice(-6).toUpperCase()}</p>
                        <p className={`text-[9px] font-black uppercase italic mt-1 ${config.color}`}>{config.label}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="font-black text-[#1a2e05] text-xl italic tracking-tighter">${order.total}</p>
                        <ChevronRight size={18} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                );
              }) : <div className="p-20 text-center"><p className="text-xs text-slate-300 font-black uppercase italic tracking-widest">Sin actividad reciente</p></div>}
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-[#1a2e05]/95 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300 border-b-[16px] border-emerald-500 relative">
            
            <div className="bg-[#1a2e05] p-8 text-white flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest italic mb-1">Resumen del Pedido</p>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-none">#{selectedOrder.id.toString().slice(-8).toUpperCase()}</h3>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="bg-white/10 p-4 rounded-3xl hover:bg-white/20 transition-all active:scale-90 relative z-10"><X size={24}/></button>
            </div>

            <div className="p-8 space-y-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100">
                <div className="flex flex-col gap-6">
                    {Object.keys(statusConfig).map((key) => {
                        const stepConfig = statusConfig[key];
                        const isDone = (statusConfig[selectedOrder.estado]?.step || 1) >= stepConfig.step;
                        const isCurrent = selectedOrder.estado === key;
                        return (
                            <div key={key} className={`flex items-start gap-4 transition-opacity duration-500 ${isDone ? 'opacity-100' : 'opacity-30'}`}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? `${stepConfig.bg} ${stepConfig.color} border-current` : 'bg-white border-slate-200 text-slate-300'}`}>
                                        {isDone ? <CheckCircle size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                                    </div>
                                    {stepConfig.step !== 4 && <div className={`w-0.5 h-6 my-1 ${isDone ? 'bg-emerald-500' : 'bg-slate-100'}`} />}
                                </div>
                                <div className="leading-tight pt-1">
                                    <p className={`text-[11px] font-[1000] uppercase italic tracking-tighter ${isDone ? 'text-slate-800' : 'text-slate-300'}`}>{stepConfig.label}</p>
                                    {isCurrent && <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stepConfig.desc}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>

              {/* PRODUCTOS CORREGIDO PARA MOSTRAR SALSAS E INGREDIENTES */}
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest flex items-center gap-2"><Package size={14}/> Tu Comanda</p>
                <div className="space-y-2">
                  {selectedOrder.productos?.map((prod, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-500 font-black italic text-xs underline decoration-2 underline-offset-4">{prod.cantidad}x</span>
                            <p className="text-[11px] font-[1000] text-[#1a2e05] uppercase italic">{prod.nombre}</p>
                          </div>
                        </div>

                        {/* DETALLE DE SALSA (SI EXISTE) */}
                        {prod.salsa && (
                          <div className="mt-2 pl-7">
                            <span className="bg-orange-50 text-orange-600 text-[8px] font-black uppercase px-2.5 py-1 rounded-lg border border-orange-100 italic flex items-center gap-1.5 w-fit">
                              <Droplets size={10} fill="currentColor"/> Baño: {prod.salsa}
                            </span>
                          </div>
                        )}

                        {/* DETALLE DE INGREDIENTES EXTRA */}
                        {(prod.ingredientes?.length > 0 || prod.extras?.length > 0) && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pl-7">
                            {(prod.ingredientes || prod.extras).map((ing, iIdx) => (
                              <span key={iIdx} className="bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-100 italic">
                                + {ing.nombre || ing}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a2e05] p-8 rounded-[3rem] space-y-3 shadow-xl text-white">
                <div className="flex justify-between text-[10px] font-black text-white/40 uppercase italic tracking-widest"><span>Subtotal Comida</span><span>${selectedOrder.subtotal || (selectedOrder.total - 40 + (selectedOrder.puntos_usados || 0))}</span></div>
                <div className="flex justify-between text-[10px] font-black text-white/40 uppercase italic tracking-widest"><span>Costo de Envío</span><span>$40</span></div>
                {selectedOrder.puntos_usados > 0 && <div className="flex justify-between text-[11px] font-black text-emerald-400 uppercase italic bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 shadow-lg"><span><Wallet size={12} className="inline mr-2"/> Wingool Wallet</span><span>-${selectedOrder.puntos_usados}</span></div>}
                <div className="flex justify-between items-end pt-5 border-t border-white/10 mt-2">
                  <div className="leading-none"><span className="text-[10px] font-black uppercase italic text-emerald-500 tracking-widest">Total Pagado</span><p className="text-[8px] font-bold text-white/20 uppercase mt-1 italic leading-none">Vía {selectedOrder.metodo_pago}</p></div>
                  <span className="text-5xl font-black italic tracking-tighter leading-none text-white">${selectedOrder.total}</span>
                </div>
              </div>

              <div className="bg-emerald-500 p-5 rounded-[2.5rem] text-white flex justify-between items-center shadow-lg transform active:scale-95 transition-all">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl"><Star fill="white" size={20}/></div>
                  <div className="leading-tight"><p className="text-[10px] font-black uppercase tracking-widest italic leading-none">Puntos Ganados</p><p className="text-[8px] font-bold text-white/60 uppercase mt-1">Sumados a tu Wallet</p></div>
                </div>
                <span className="text-3xl font-black italic tracking-tighter leading-none">+{selectedOrder.puntos_generados}</span>
              </div>
              
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                 <MapPin className="text-emerald-500" size={16} />
                 <div><p className="text-[8px] font-black text-slate-300 uppercase italic mb-0.5 tracking-widest">Entregar en:</p><p className="text-[10px] font-[1000] text-slate-600 uppercase italic tracking-tighter leading-none">{selectedOrder.direccion_entrega}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddressModal && (
        <div className="fixed inset-0 bg-[#1a2e05]/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[4rem] p-12 shadow-2xl relative border-b-[20px] border-emerald-500 animate-in slide-in-from-bottom duration-500">
            <h3 className="text-3xl font-black uppercase italic mb-8 text-[#1a2e05] tracking-tighter leading-none underline decoration-emerald-500 decoration-4 underline-offset-8">Nueva Sede</h3>
            <form onSubmit={saveAddress} className="space-y-5">
              <input className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-2xl p-5 font-black text-sm outline-none transition-all uppercase tracking-widest" placeholder="EJ: ESTADIO CASA" value={newAddr.label} onChange={(e) => setNewAddr({...newAddr, label: e.target.value})} required />
              <textarea className="w-full bg-slate-50 border-2 border-transparent focus:border-emerald-500/20 focus:bg-white rounded-[2.5rem] p-6 font-black text-sm outline-none h-32 transition-all uppercase tracking-widest resize-none" placeholder="DIRECCIÓN COMPLETA..." value={newAddr.address} onChange={(e) => setNewAddr({...newAddr, address: e.target.value})} required></textarea>
              <button type="submit" className="w-full bg-[#1a2e05] text-white py-6 rounded-[2rem] font-black uppercase italic tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl active:scale-95">REGISTRAR SEDE</button>
              <button type="button" onClick={() => setShowAddressModal(false)} className="w-full text-slate-300 font-black uppercase text-[10px] mt-4 tracking-[0.3em] hover:text-red-500 transition-colors">CANCELAR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;