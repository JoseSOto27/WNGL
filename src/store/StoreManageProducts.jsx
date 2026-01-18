import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Loading from "../Components/Common/Loading";
import { supabase } from "../services/supabase";
import { 
  Trash2, Pencil, Save, X, RefreshCcw, 
  Package, ToggleLeft, ToggleRight, Search, Trophy, Star
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
      toast.success("¡Disponibilidad actualizada!");
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
    setFormularioEdicion({ nombre: "", descripcion: "", precio_original: 0, precio_oferta: 0, imagen_url: "" });
  };

  const guardarEdicion = async () => {
    if (!editandoId) return;
    try {
      if (!formularioEdicion.nombre.trim()) return toast.error("El nombre es requerido");
      const { error } = await supabase.from("productos").update({
          nombre: formularioEdicion.nombre,
          descripcion: formularioEdicion.descripcion,
          precio_original: formularioEdicion.precio_original,
          precio_oferta: formularioEdicion.precio_oferta,
          imagen_url: formularioEdicion.imagen_url,
          fecha: new Date().toISOString(),
        }).eq("id", editandoId);

      if (error) throw error;
      setProductos((prev) => prev.map((p) => p.id === editandoId ? {
                ...p,
                name: formularioEdicion.nombre,
                description: formularioEdicion.descripcion,
                mrp: parseFloat(formularioEdicion.precio_original),
                price: parseFloat(formularioEdicion.precio_oferta),
                images: [formularioEdicion.imagen_url],
                datosOriginales: { ...formularioEdicion },
              } : p));
      toast.success("¡Producto actualizado exitosamente!");
      cancelarEdicion();
    } catch (error) {
      toast.error("Error al actualizar: " + error.message);
    }
  };

  const eliminarProducto = async (productoId) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const { error } = await supabase.from("productos").delete().eq("id", productoId);
      if (error) throw error;
      setProductos((prev) => prev.filter((p) => p.id !== productoId));
      toast.success("¡Producto eliminado!");
    } catch (error) {
      toast.error("Error al eliminar: " + error.message);
    }
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setFormularioEdicion((prev) => ({
      ...prev,
      [name]: name.includes("precio") ? parseFloat(value) || 0 : value,
    }));
  };

  useEffect(() => { obtenerProductos(); }, []);

  if (cargando) return <Loading />;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      
      {/* HEADER WINGOOL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-[#1a2e05] uppercase italic tracking-tighter flex items-center gap-3">
            <Trophy className="text-emerald-600" size={32} /> Administrar <span className="text-emerald-600">Plantilla</span>
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
            Gestión total de inventario y precios de Wingool Company
          </p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="bg-white px-6 py-3 rounded-2xl border-2 border-slate-100 flex items-center gap-4 shadow-sm">
                <div className="flex flex-col text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Productos Activos</span>
                    <span className="text-xl font-black text-[#1a2e05] italic">{productos.length}</span>
                </div>
                <Package className="text-emerald-500" size={24} />
            </div>
            <button onClick={obtenerProductos} className="bg-[#1a2e05] text-white p-4 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-90">
                <RefreshCcw size={20} className={cargando ? "animate-spin" : ""} />
            </button>
        </div>
      </div>

      {/* TABLA DE PRODUCTOS ESTILO WINGOOL */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a2e05] text-emerald-400 uppercase text-[10px] font-black tracking-[0.2em]">
                <th className="px-6 py-5 italic italic">Producto</th>
                <th className="px-6 py-5 hidden md:table-cell italic">Descripción</th>
                <th className="px-6 py-5 hidden md:table-cell italic text-center italic">Coste Base</th>
                <th className="px-6 py-5 italic text-center italic">Precio Venta</th>
                <th className="px-6 py-5 italic italic">Estado</th>
                <th className="px-6 py-5 text-right italic italic">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <Search size={48} />
                        <p className="font-black uppercase italic tracking-widest text-xs">Sin alineación registrada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-emerald-50/30 transition-colors group">
                    {editandoId === producto.id ? (
                      /* --- MODO EDICIÓN (INPUTS NEGROS) --- */
                      <>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            name="nombre"
                            value={formularioEdicion.nombre}
                            onChange={manejarCambioFormulario}
                            className="bg-slate-50 border-2 border-emerald-100 rounded-xl px-3 py-2 w-full text-sm font-black text-slate-900 outline-none focus:border-emerald-500 shadow-inner"
                          />
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <textarea
                            name="descripcion"
                            value={formularioEdicion.descripcion}
                            onChange={manejarCambioFormulario}
                            className="bg-slate-50 border-2 border-emerald-100 rounded-xl px-3 py-2 w-full text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 shadow-inner"
                            rows="2"
                          />
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <input
                            type="number"
                            name="precio_original"
                            value={formularioEdicion.precio_original}
                            onChange={manejarCambioFormulario}
                            className="bg-slate-50 border-2 border-emerald-100 rounded-xl px-3 py-2 w-full text-sm font-black text-slate-900 text-center"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            name="precio_oferta"
                            value={formularioEdicion.precio_oferta}
                            onChange={manejarCambioFormulario}
                            className="bg-emerald-50 border-2 border-emerald-200 rounded-xl px-3 py-2 w-full text-sm font-black text-emerald-700 text-center"
                          />
                        </td>
                        <td className="px-6 py-4">
                            <span className="text-[9px] font-black text-slate-300 italic uppercase">Editando...</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <button onClick={guardarEdicion} className="bg-emerald-500 text-[#1a2e05] p-2.5 rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-200"><Save size={18} strokeWidth={3} /></button>
                            <button onClick={cancelarEdicion} className="bg-slate-200 text-slate-500 p-2.5 rounded-xl hover:bg-slate-300 transition"><X size={18} strokeWidth={3} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      /* --- MODO VISUALIZACIÓN --- */
                      <>
                        <td className="px-6 py-4">
                          <div className="flex gap-4 items-center">
                            <div className="relative">
                                <img
                                    src={producto.images[0] || "/default-image.png"}
                                    alt={producto.name}
                                    className="w-14 h-14 object-contain p-1 bg-slate-50 rounded-2xl shadow-sm group-hover:scale-110 transition-transform"
                                />
                                <div className="absolute -top-2 -left-2"><Star size={16} fill="#10b981" className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                            </div>
                            <div>
                              <p className="font-black text-[#1a2e05] uppercase italic text-sm tracking-tighter leading-none">{producto.name}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">UID: {producto.id.toString().slice(0,8)}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 hidden md:table-cell">
                          <p className="text-xs text-slate-500 font-medium line-clamp-2 max-w-[200px]">{producto.description || "Sin descripción de menú"}</p>
                        </td>

                        <td className="px-6 py-4 hidden md:table-cell text-center">
                          <span className="text-xs font-bold text-slate-400">{moneda} {producto.mrp.toFixed(2)}</span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <span className="text-lg font-black text-[#1a2e05] italic">
                            {moneda} {producto.price.toFixed(2)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => alternarStock(producto.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase italic transition-all ${
                              producto.enStock 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : "bg-red-50 text-red-600 border border-red-100"
                            }`}
                          >
                            {producto.enStock ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            {producto.enStock ? "En Juego" : "Banca"}
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => iniciarEdicion(producto)}
                              className="bg-white border-2 border-slate-100 text-[#1a2e05] p-2.5 rounded-xl hover:border-[#1a2e05] hover:bg-[#1a2e05] hover:text-white transition-all shadow-sm"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              onClick={() => eliminarProducto(producto.id)}
                              className="bg-white border-2 border-slate-100 text-red-400 p-2.5 rounded-xl hover:border-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 size={18} />
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
    </div>
  );
};

export default AdministrarProductosTienda;