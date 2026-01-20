import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Loading from "../Components/Common/Loading";
import { supabase } from "../services/supabase";
import { 
  Trash2, Pencil, Save, X, RefreshCcw, 
  Package, ToggleLeft, ToggleRight, Search, Trophy, Zap
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
    imagen_url: "",
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
        name: item.nombre,
        description: item.descripcion,
        mrp: parseFloat(item.precio_original) || 0,
        price: parseFloat(item.precio_oferta || item.precio_original) || 0,
        images: item.imagen_url ? [item.imagen_url] : [],
        enStock: item.disponible !== false,
        datosOriginales: {
          nombre: item.nombre,
          descripcion: item.descripcion,
          precio_original: item.precio_original,
          precio_oferta: item.precio_oferta,
          imagen_url: item.imagen_url,
        },
      }));

      setProductos(productosFormateados);
    } catch (error) {
      toast.error("Error al cargar los productos: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const alternarStock = async (productoId) => {
    try {
      const producto = productos.find((p) => p.id === productoId);
      const nuevoEstado = !producto.enStock;
      const { error } = await supabase.from("productos").update({ disponible: nuevoEstado }).eq("id", productoId);
      if (error) throw error;
      setProductos((prev) => prev.map((p) => p.id === productoId ? { ...p, enStock: nuevoEstado } : p));
      toast.success("¡Estado actualizado!");
    } catch (error) {
      toast.error("Error al actualizar disponibilidad");
    }
  };

  const iniciarEdicion = (producto) => {
    setEditandoId(producto.id);
    setFormularioEdicion({
      nombre: producto.datosOriginales.nombre || producto.name || "",
      descripcion: producto.datosOriginales.descripcion || producto.description || "",
      precio_original: producto.datosOriginales.precio_original || producto.mrp || 0,
      precio_oferta: producto.datosOriginales.precio_oferta || producto.price || 0,
      imagen_url: producto.datosOriginales.imagen_url || (producto.images && producto.images[0]) || "",
    });
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
  };

  const guardarEdicion = async () => {
    if (!editandoId) return;
    try {
      if (!formularioEdicion.nombre.trim()) return toast.error("El nombre es requerido");
      const numPrecioOriginal = parseFloat(formularioEdicion.precio_original);
      const numPrecioOferta = parseFloat(formularioEdicion.precio_oferta);
      if (isNaN(numPrecioOriginal) || isNaN(numPrecioOferta)) return toast.error("Precios inválidos");

      const { error } = await supabase.from("productos").update({
          nombre: formularioEdicion.nombre,
          descripcion: formularioEdicion.descripcion,
          precio_original: numPrecioOriginal,
          precio_oferta: numPrecioOferta,
          imagen_url: formularioEdicion.imagen_url,
          fecha: new Date().toISOString(),
        }).eq("id", editandoId);

      if (error) throw error;
      setProductos((prev) => prev.map((p) => p.id === editandoId ? {
                ...p,
                name: formularioEdicion.nombre,
                description: formularioEdicion.descripcion,
                mrp: numPrecioOriginal,
                price: numPrecioOferta,
                images: [formularioEdicion.imagen_url],
                datosOriginales: { ...formularioEdicion, precio_original: numPrecioOriginal, precio_oferta: numPrecioOferta },
              } : p));

      toast.success("¡Jugada guardada!");
      cancelarEdicion();
    } catch (error) { toast.error(error.message); }
  };

  const eliminarProducto = async (productoId) => {
    if (!window.confirm("¿Sacar de la alineación permanentemente?")) return;
    try {
      const { error } = await supabase.from("productos").delete().eq("id", productoId);
      if (error) throw error;
      setProductos((prev) => prev.filter((p) => p.id !== productoId));
      toast.success("Producto eliminado");
    } catch (error) { toast.error(error.message); }
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setFormularioEdicion((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => { obtenerProductos(); }, []);

  if (cargando) return <Loading />;

  return (
    <div className="p-4 md:p-10 bg-slate-50 min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER MVP SUTIL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em] mb-1 italic">
             <Zap size={12} fill="currentColor" /> Control de Plantilla
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
            ADMINISTRAR <span className="text-emerald-500">PRODUCTOS</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="flex flex-col text-right">
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Items Totales</span>
                    <span className="text-2xl font-[1000] text-[#1a2e05] italic tracking-tighter leading-none">{productos.length}</span>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-2 rounded-xl">
                    <Package size={20} />
                </div>
            </div>
            <button 
                onClick={obtenerProductos} 
                className="bg-[#1a2e05] text-emerald-400 p-4 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-md active:scale-95 group border border-white/10"
            >
                <RefreshCcw size={22} className={cargando ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
            </button>
        </div>
      </div>

      {/* TABLA REFINADA */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 italic">Producto</th>
                <th className="px-8 py-5 hidden lg:table-cell italic text-center">MRP (Base)</th>
                <th className="px-8 py-5 text-center italic">Precio MVP</th>
                <th className="px-8 py-5 text-center italic">Estado</th>
                <th className="px-8 py-5 text-right italic">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                        <Search size={48} strokeWidth={1} />
                        <p className="font-black uppercase italic tracking-widest text-xs">Sin jugadores convocados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-slate-50/80 transition-all group">
                    {editandoId === producto.id ? (
                      /* --- MODO EDICIÓN SUTIL --- */
                      <td colSpan="5" className="p-6 bg-emerald-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <input
                            name="nombre"
                            value={formularioEdicion.nombre}
                            onChange={manejarCambioFormulario}
                            placeholder="Nombre"
                            className="bg-white border border-emerald-200 rounded-xl px-4 py-3 text-xs font-black text-[#1a2e05] uppercase italic outline-none shadow-sm focus:border-emerald-500"
                          />
                          <div className="flex gap-2">
                             <input
                                type="number"
                                name="precio_original"
                                value={formularioEdicion.precio_original}
                                onChange={manejarCambioFormulario}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-black text-slate-400 text-center outline-none"
                              />
                              <input
                                type="number"
                                name="precio_oferta"
                                value={formularioEdicion.precio_oferta}
                                onChange={manejarCambioFormulario}
                                className="w-full bg-white border border-emerald-500 rounded-xl px-4 py-3 text-xs font-black text-emerald-600 text-center italic outline-none"
                              />
                          </div>
                          <div className="flex-1">
                             <input
                                name="imagen_url"
                                value={formularioEdicion.imagen_url}
                                onChange={manejarCambioFormulario}
                                placeholder="URL de Imagen"
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-[10px] font-bold text-slate-400 outline-none"
                              />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={guardarEdicion} className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-[#1a2e05] transition shadow-md active:scale-90"><Save size={18} /></button>
                            <button onClick={cancelarEdicion} className="bg-white border border-slate-200 text-slate-400 p-3 rounded-xl hover:bg-red-50 hover:text-red-500 transition active:scale-90"><X size={18} /></button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      /* --- MODO VISUALIZACIÓN --- */
                      <>
                        <td className="px-8 py-5">
                          <div className="flex gap-4 items-center">
                            <div className="shrink-0 bg-slate-50 border border-slate-100 rounded-2xl size-14 flex items-center justify-center overflow-hidden">
                                <img
                                    src={producto.images[0] || "/default-image.png"}
                                    alt={producto.name}
                                    className="h-10 w-auto object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-md"
                                />
                            </div>
                            <div>
                              <p className="font-black text-[#1a2e05] uppercase italic text-xs tracking-tight leading-tight">{producto.name}</p>
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{producto.id.toString().slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-5 hidden lg:table-cell text-center">
                          <span className="text-[10px] font-black text-slate-300 italic">{moneda}{producto.mrp.toFixed(0)}</span>
                        </td>

                        <td className="px-8 py-5 text-center">
                          <span className="text-xl font-[1000] text-[#1a2e05] italic tracking-tighter">
                            {moneda}{producto.price.toFixed(0)}
                          </span>
                        </td>

                        <td className="px-8 py-5 text-center">
                          <button
                            onClick={() => alternarStock(producto.id)}
                            className={`px-4 py-1.5 rounded-full font-black text-[8px] uppercase italic tracking-widest border transition-all ${
                              producto.enStock 
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                              : "bg-slate-50 text-slate-300 border-slate-100"
                            }`}
                          >
                            {producto.enStock ? "En Juego" : "Banca"}
                          </button>
                        </td>

                        <td className="px-8 py-5">
                          <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => iniciarEdicion(producto)}
                              className="bg-white border border-slate-100 text-slate-400 p-2.5 rounded-xl hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-sm active:scale-90"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => eliminarProducto(producto.id)}
                              className="bg-white border border-slate-100 text-slate-400 p-2.5 rounded-xl hover:text-red-500 hover:border-red-500 transition-all shadow-sm active:scale-90"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdministrarProductosTienda;