import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Loading from "../Components/Common/Loading";
import { supabase } from "../services/supabase";
import { 
  Trash2, Pencil, Save, X, RefreshCcw, 
  Package, Trophy, Zap, Coins
} from "lucide-react";

const AdministrarProductosTienda = () => {
  const moneda = "$"; 

  const [cargando, setCargando] = useState(true);
  const [productos, setProductos] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [formularioEdicion, setFormularioEdicion] = useState({
    nombre: "",
    descripcion: "",
    precio_original: 0,
    precio_oferta: 0,
    ingredientes: []
  });

  const obtenerProductos = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .order("fecha", { ascending: false });

      if (error) throw new Error(error.message);

      const productosFormateados = (data || []).map((item) => ({
        id: item.id,
        name: item.nombre || "Sin nombre",
        description: item.descripcion || "",
        mrp: parseFloat(item.precio_original) || 0,
        price: parseFloat(item.precio_oferta || item.precio_original) || 0,
        images: item.imagen_url ? [item.imagen_url] : [],
        enStock: item.disponible !== false,
        ingredientes: Array.isArray(item.ingredientes) ? item.ingredientes : [],
      }));

      setProductos(productosFormateados);
    } catch (error) {
      toast.error("Error al cargar: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (producto) => {
    setFormularioEdicion({
      nombre: producto.name,
      descripcion: producto.description,
      precio_original: producto.mrp,
      precio_oferta: producto.price,
      ingredientes: Array.isArray(producto.ingredientes) ? [...producto.ingredientes] : []
    });
    setEditandoId(producto.id);
  };

  const manejarCambioExtra = (idExtra, nuevoPrecio) => {
    const nuevosExtras = formularioEdicion.ingredientes.map(extra => 
      extra.id === idExtra ? { ...extra, precio: parseFloat(nuevoPrecio) || 0 } : extra
    );
    setFormularioEdicion(prev => ({ ...prev, ingredientes: nuevosExtras }));
  };

  const guardarEdicion = async () => {
    if (!editandoId) return;
    try {
      const { error } = await supabase.from("productos").update({
          nombre: formularioEdicion.nombre,
          descripcion: formularioEdicion.descripcion,
          precio_original: parseFloat(formularioEdicion.precio_original) || 0,
          precio_oferta: parseFloat(formularioEdicion.precio_oferta) || 0,
          ingredientes: formularioEdicion.ingredientes,
          fecha: new Date().toISOString(),
        }).eq("id", editandoId);

      if (error) throw error;
      toast.success("¡JUGADA ACTUALIZADA!");
      setEditandoId(null);
      obtenerProductos();
    } catch (error) { 
      toast.error("Error al guardar: " + error.message); 
    }
  };

  const alternarStock = async (productoId) => {
    try {
      const producto = productos.find((p) => p.id === productoId);
      const nuevoEstado = !producto.enStock;
      const { error } = await supabase.from("productos").update({ disponible: nuevoEstado }).eq("id", productoId);
      if (error) throw error;
      setProductos((prev) => prev.map((p) => p.id === productoId ? { ...p, enStock: nuevoEstado } : p));
      toast.success("ESTADO ACTUALIZADO");
    } catch (error) { toast.error("Error de stock"); }
  };

  const eliminarProducto = async (productoId) => {
    if (!window.confirm("¿Sacar de la alineación?")) return;
    try {
        await supabase.from("productos").delete().eq("id", productoId);
        setProductos(prev => prev.filter(p => p.id !== productoId));
        toast.success("Eliminado");
    } catch (e) { toast.error("Error al eliminar"); }
  };

  useEffect(() => { obtenerProductos(); }, []);

  if (cargando) return <Loading />;

  return (
    <div className="p-4 md:p-10 bg-white min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-1 italic">
             <Zap size={14} fill="currentColor" /> PANEL DE CONTROL
          </div>
          <h1 className="text-3xl md:text-4xl font-[1000] text-[#0f1a04] uppercase italic tracking-tighter leading-none">
            GESTIONAR <span className="text-emerald-500">PLANTILLA</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="bg-slate-50 px-6 py-3 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="text-right leading-none">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Fichajes</span>
                    <span className="text-2xl font-[1000] text-[#0f1a04] italic">{productos.length}</span>
                </div>
                <div className="bg-[#0f1a04] text-emerald-500 p-2 rounded-xl"><Package size={20} /></div>
            </div>
            <button onClick={obtenerProductos} className="bg-[#0f1a04] text-emerald-500 p-4 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95"><RefreshCcw size={22} /></button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden mb-20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] border-b border-slate-100">
              <tr>
                <th className="px-10 py-7 italic">PRODUCTO</th>
                <th className="px-10 py-7 text-center italic">BASE</th>
                <th className="px-10 py-7 text-center italic">PRECIO MVP</th>
                <th className="px-10 py-7 text-center italic">ESTADO</th>
                <th className="px-10 py-7 text-right italic">ACCIONES</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {(productos || []).map((producto) => (
                <tr key={producto.id} className="hover:bg-slate-50/50 transition-all group">
                  {editandoId === producto.id ? (
                    <td colSpan="5" className="p-8 bg-emerald-50/30">
                      <div className="space-y-6">
                        <div className="flex flex-wrap lg:flex-nowrap gap-4 items-center">
                          <div className="flex-1">
                            <label className="text-[8px] font-black text-emerald-600 uppercase ml-2 mb-1 block">Nombre</label>
                            <input
                              value={formularioEdicion.nombre}
                              onChange={(e) => setFormularioEdicion({...formularioEdicion, nombre: e.target.value})}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-[#0f1a04] uppercase italic outline-none focus:border-emerald-500"
                            />
                          </div>
                          <div className="w-32">
                            <label className="text-[8px] font-black text-slate-400 text-center mb-1 block uppercase">Base</label>
                            <input
                              type="number"
                              value={formularioEdicion.precio_original}
                              onChange={(e) => setFormularioEdicion({...formularioEdicion, precio_original: e.target.value})}
                              className="w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 text-xs font-black text-slate-400 text-center outline-none"
                            />
                          </div>
                          <div className="w-32">
                            <label className="text-[8px] font-black text-emerald-600 text-center mb-1 block uppercase">MVP</label>
                            <input
                              type="number"
                              value={formularioEdicion.precio_oferta}
                              onChange={(e) => setFormularioEdicion({...formularioEdicion, precio_oferta: e.target.value})}
                              className="w-full bg-white border-2 border-emerald-500 rounded-xl px-4 py-3 text-xs font-black text-emerald-600 text-center italic outline-none"
                            />
                          </div>
                          <div className="flex gap-2 pt-5">
                            <button onClick={guardarEdicion} className="bg-emerald-500 text-[#0f1a04] p-3.5 rounded-xl hover:bg-[#0f1a04] hover:text-white transition-all shadow-lg active:scale-90"><Save size={20} strokeWidth={3} /></button>
                            <button onClick={() => setEditandoId(null)} className="bg-white border border-slate-200 text-slate-400 p-3.5 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"><X size={20} strokeWidth={3}/></button>
                          </div>
                        </div>

                        {/* LISTA DE EXTRAS SEGURA */}
                        {(formularioEdicion.ingredientes || []).length > 0 && (
                          <div className="bg-white/50 p-6 rounded-[2rem] border border-emerald-100 space-y-4">
                            <p className="text-[9px] font-black text-emerald-600 uppercase italic tracking-widest flex items-center gap-2"><Coins size={14}/> Editar Precios de Extras</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {formularioEdicion.ingredientes.map((extra, idx) => (
                                <div key={extra.id || idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                  <span className="text-[9px] font-black text-[#0f1a04] uppercase italic truncate w-24">{extra.nombre || 'Extra'}</span>
                                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg">
                                    <span className="text-[9px] font-bold text-slate-300">$</span>
                                    <input 
                                      type="number" 
                                      value={extra.precio} 
                                      onChange={(e) => manejarCambioExtra(extra.id, e.target.value)}
                                      className="w-12 bg-transparent text-[10px] font-black text-[#0f1a04] outline-none text-right"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-10 py-6">
                        <div className="flex gap-6 items-center">
                          <img 
                            src={producto?.images?.[0] || "/default.png"} 
                            className="size-14 object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" 
                            onError={(e) => e.target.src = "/default.png"}
                          />
                          <div>
                            <p className="font-[1000] text-[#0f1a04] uppercase italic text-sm tracking-tight leading-none">{producto.name}</p>
                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2 italic">Ref: {producto.id?.toString().slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-center text-[11px] font-black text-slate-200 italic line-through decoration-emerald-500/20">{moneda}{producto.mrp.toFixed(0)}</td>
                      <td className="px-10 py-6 text-center text-2xl font-[1000] text-[#0f1a04] italic tracking-tighter">{moneda}{producto.price.toFixed(0)}</td>
                      <td className="px-10 py-6 text-center">
                        <button onClick={() => alternarStock(producto.id)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase italic tracking-widest border-2 transition-all ${producto.enStock ? "bg-emerald-100 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-300 border-slate-200"}`}>
                          {producto.enStock ? "EN JUEGO" : "BANCA"}
                        </button>
                      </td>
                      <td className="px-10 py-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => iniciarEdicion(producto)} className="bg-white border-2 border-slate-100 text-slate-300 p-3 rounded-2xl hover:text-emerald-500 hover:border-emerald-500 transition-all active:scale-95"><Pencil size={18}/></button>
                          <button onClick={() => eliminarProducto(producto.id)} className="bg-white border-2 border-slate-100 text-slate-300 p-3 rounded-2xl hover:text-red-500 hover:border-red-500 transition-all active:scale-95"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdministrarProductosTienda;