import React, { useState, useEffect } from "react";
import { supabase } from "../services/supabase";
import { 
  ShoppingBag, MapPin, CreditCard, Star, Plus, 
  Settings, Save, Trash2, Loader2, Clock, CheckCircle, 
  CreditCard as CardIcon, X, Package, Receipt
} from "lucide-react";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: "", points: 0 });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales y edición
  const [selectedOrder, setSelectedOrder] = useState(null); // Para ver detalles del pedido
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({ label: "", address: "" });

  useEffect(() => {
    fetchUserData();
  }, []);

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

    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ... (funciones handleUpdateProfile, saveAddress, deleteAddress se mantienen igual)
  const handleUpdateProfile = async () => {
    const { error } = await supabase.from('profiles').update({ nombre: profile.full_name }).eq('id', user.id);
    if (!error) {
      await supabase.auth.updateUser({ data: { full_name: profile.full_name } });
      toast.success("Perfil actualizado");
      setIsEditingProfile(false);
      fetchUserData();
    }
  };

  const saveAddress = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('direcciones').insert([{ user_id: user.id, label: newAddr.label, address: newAddr.address }]);
    if (!error) { toast.success("Dirección guardada"); setShowAddressModal(false); fetchUserData(); }
  };

  const deleteAddress = async (id) => {
    const { error } = await supabase.from('direcciones').delete().eq('id', id);
    if (!error) { toast.success("Dirección eliminada"); fetchUserData(); }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white italic font-black text-[#1a2e05]">
      <Loader2 className="animate-spin mr-2" /> CARGANDO TU PANEL...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex items-center gap-6">
            <img src={user?.user_metadata?.avatar_url} className="w-24 h-24 rounded-full border-4 border-emerald-50 shadow-md" alt="Avatar" />
            <div className="flex-1">
              {isEditingProfile ? (
                <div className="flex items-center gap-2">
                  <input className="text-2xl font-black bg-slate-50 p-2 rounded-xl border-b-2 border-emerald-500 w-full outline-none" value={profile.full_name} onChange={(e) => setProfile({...profile, full_name: e.target.value})} />
                  <button onClick={handleUpdateProfile} className="bg-emerald-600 text-white p-2 rounded-xl"><Save size={20}/></button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">{profile.full_name}</h1>
                  <p className="text-slate-500 font-medium">{user?.email}</p>
                  <button onClick={() => setIsEditingProfile(true)} className="mt-2 text-xs font-black text-emerald-600 uppercase flex items-center gap-1"><Settings size={14} /> Configuración</button>
                </>
              )}
            </div>
          </div>

          <div className="bg-[#1a2e05] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
            <Star className="absolute -right-6 -top-6 w-32 h-32 text-emerald-500 opacity-20 rotate-12" />
            <p className="text-emerald-400 font-black uppercase text-[10px] tracking-widest">Wingool Wallet</p>
            <h2 className="text-5xl font-black mt-2">{profile.points.toLocaleString()}</h2>
            <p className="text-[10px] text-emerald-200/60 mt-4 italic tracking-widest">MIEMBRO EXCLUSIVO WINGOOL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 1. DIRECCIONES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-black text-slate-800 uppercase italic flex items-center gap-2"><MapPin size={20} className="text-emerald-600" /> Direcciones</h2>
              <button onClick={() => setShowAddressModal(true)} className="bg-emerald-600 text-white p-1.5 rounded-full shadow-lg"><Plus size={18} /></button>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[300px]">
              {addresses.length > 0 ? addresses.map((addr) => (
                <div key={addr.id} className="p-5 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-emerald-600"/>
                    <div><p className="font-bold text-slate-800 text-xs uppercase">{addr.label}</p><p className="text-[10px] text-slate-400 truncate max-w-[120px]">{addr.address}</p></div>
                  </div>
                  <button onClick={() => deleteAddress(addr.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              )) : <p className="p-10 text-center text-xs text-slate-400 italic">No hay direcciones.</p>}
            </div>
          </div>

          {/* 2. HISTORIAL DE PEDIDOS (CON CLICK PARA DETALLE) */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-800 uppercase italic flex items-center gap-2 px-4"><ShoppingBag size={20} className="text-emerald-600" /> Historial</h2>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar">
              {orders.length > 0 ? orders.map((order) => (
                <div 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)} // <--- CLICK AQUÍ
                  className="p-5 flex items-center justify-between border-b border-slate-50 hover:bg-emerald-50 cursor-pointer transition-all active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className={order.estado === 'entregado' ? 'text-emerald-600' : 'text-amber-500'}><Clock size={16}/></div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs uppercase italic tracking-tighter">Orden #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(order.fecha_pedido).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-800 text-sm">${order.total}</p>
                </div>
              )) : <p className="p-10 text-center text-xs text-slate-400 italic">Sin pedidos aún.</p>}
            </div>
          </div>

          {/* 3. PAGOS */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-800 uppercase italic flex items-center gap-2 px-4"><CreditCard size={20} className="text-emerald-600" /> Wallet</h2>
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm min-h-[300px] flex flex-col justify-center items-center text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-4"><CardIcon size={32} className="text-slate-300" /></div>
              <p className="text-slate-800 font-bold text-sm uppercase mb-1">Pagos Wingool</p>
              <p className="text-[10px] text-slate-400 italic max-w-[150px]">Pronto podrás gestionar tus tarjetas aquí.</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DETALLES DEL PEDIDO */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Cabecera Modal */}
            <div className="bg-[#1a2e05] p-6 text-white flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Detalle de Compra</p>
                <h3 className="text-xl font-black uppercase italic tracking-tighter">Orden #{selectedOrder.id.slice(-8).toUpperCase()}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="bg-white/10 p-2 rounded-full hover:bg-white/20"><X size={20}/></button>
            </div>

            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Productos */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Package size={14}/> Lo que pediste:</p>
                <div className="space-y-3">
                  {selectedOrder.productos?.map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        {prod.imagen && <img src={prod.imagen} className="w-10 h-10 rounded-lg object-cover" alt="" />}
                        <div>
                          <p className="text-xs font-black text-slate-800 uppercase italic">{prod.cantidad}x {prod.nombre}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">Unitario: ${prod.precio_unitario}</p>
                        </div>
                      </div>
                      <p className="text-xs font-black text-slate-800">${prod.total}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen Económico */}
              <div className="bg-slate-50 p-5 rounded-3xl space-y-2 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2"><Receipt size={14}/> Resumen de cuenta:</p>
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Subtotal + Envío ($40)</span>
                  <span>${(Number(selectedOrder.total) + Number(selectedOrder.puntos_usados/10 || 0)).toFixed(2)}</span>
                </div>
                {selectedOrder.puntos_usados > 0 && (
                  <div className="flex justify-between text-xs font-black text-emerald-600 italic">
                    <span>✨ Descuento Wingool Points</span>
                    <span>-${(selectedOrder.puntos_usados / 10).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-[#1a2e05] border-t pt-2 mt-2">
                  <span>TOTAL PAGADO</span>
                  <span>${selectedOrder.total}</span>
                </div>
              </div>

              {/* Puntos Ganados */}
              <div className="bg-emerald-600 p-4 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-emerald-200">
                <div className="flex items-center gap-2">
                  <Star fill="white" size={18}/>
                  <span className="text-[10px] font-black uppercase tracking-widest">Puntos ganados en esta compra:</span>
                </div>
                <span className="text-xl font-black">+{selectedOrder.puntos_generados}</span>
              </div>

              {/* Entrega Info */}
              <div className="text-[10px] font-bold text-slate-400 uppercase text-center border-t pt-4">
                Enviado a: <span className="text-slate-600">{selectedOrder.direccion_entrega}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DIRECCIÓN (Existente) */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl">
            <h3 className="text-2xl font-black uppercase italic mb-6 text-[#1a2e05]">Nueva Ubicación</h3>
            <form onSubmit={saveAddress} className="space-y-4">
              <input className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ej: Casa, Oficina" onChange={(e) => setNewAddr({...newAddr, label: e.target.value})} required />
              <textarea className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 outline-none h-32 focus:ring-2 focus:ring-emerald-500" placeholder="Dirección completa..." onChange={(e) => setNewAddr({...newAddr, address: e.target.value})} required></textarea>
              <button type="submit" className="w-full bg-[#1a2e05] text-white py-4 rounded-2xl font-black uppercase tracking-widest">Guardar</button>
              <button type="button" onClick={() => setShowAddressModal(false)} className="w-full text-slate-400 font-black uppercase text-[10px] mt-2">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;