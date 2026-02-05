import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../services/supabase";
import {
  Trash2, Pencil, Check, X, ImagePlus, Plus, 
  Trophy, Zap, LayoutGrid, Loader2, Coins
} from "lucide-react";

const StoreAddProduct = () => {
  const [categorias, setCategorias] = useState([]);
  const [imagen, setImagen] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [infoProducto, setInfoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio_original: "",
    precio_oferta: "",
    categoria: "",
    ingredientes: [], 
  });

  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");

  const cargarDatos = async () => {
    const { data: catData } = await supabase.from("categorias").select("*").order("nombre");
    if (catData) setCategorias(catData);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarCambio = (e) => {
    setInfoProducto({ ...infoProducto, [e.target.name]: e.target.value });
  };

  const agregarItemExtra = () => {
    const nuevoItem = { id: Date.now().toString(), nombre: "", precio: "" };
    setInfoProducto((prev) => ({ 
      ...prev, 
      ingredientes: [...prev.ingredientes, nuevoItem] 
    }));
  };

  const eliminarItemExtra = (id) => {
    setInfoProducto((prev) => ({
      ...prev,
      ingredientes: prev.ingredientes.filter((item) => item.id !== id),
    }));
  };

  const manejarCambioExtra = (id, campo, valor) => {
    const nuevaLista = infoProducto.ingredientes.map((item) =>
      item.id === id ? { ...item, [campo]: valor } : item
    );
    setInfoProducto((prev) => ({ ...prev, ingredientes: nuevaLista }));
  };

  // --- LÓGICA DE SUBIDA DE IMAGEN MEJORADA ---
  const subirImagen = async () => {
    if (!imagen) return null;
    
    try {
      // 1. Crear nombre de archivo único para evitar caché
      const fileExt = imagen.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      // 2. Subir al Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("productos")
        .upload(filePath, imagen);

      if (uploadError) {
        console.error("Error al subir imagen:", uploadError.message);
        return null;
      }

      // 3. Obtener la URL pública explícitamente
      const { data } = supabase.storage
        .from("productos")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error("Error crítico en Storage:", err);
      return null;
    }
  };

  const agregarCategoria = async (e) => {
    e.preventDefault();
    if (!nuevaCategoria.trim()) return toast.error("Escribe una categoría");
    const { error } = await supabase.from("categorias").insert([{ nombre: nuevaCategoria }]);
    if (!error) {
      toast.success("¡División añadida!");
      setNuevaCategoria("");
      cargarDatos();
    }
  };

  const eliminarCategoria = async (id) => {
    if (!confirm("¿Eliminar división?")) return;
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (!error) { toast.success("División eliminada"); cargarDatos(); }
  };

  const guardarEdicionCat = async (id) => {
    const { error } = await supabase.from("categorias").update({ nombre: nombreEditado }).eq("id", id);
    if (!error) { toast.success("Actualizada"); setCategoriaEditando(null); cargarDatos(); }
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      // Paso 1: Intentar subir la imagen
      const urlImagen = await subirImagen();
      
      // Validación: Si el usuario seleccionó una imagen pero no se subió, detenemos el proceso
      if (imagen && !urlImagen) {
        throw new Error("No se pudo subir la imagen al servidor. Revisa los permisos del Storage.");
      }

      const ingredientesLimpios = infoProducto.ingredientes
        .filter(item => item.nombre.trim() !== "")
        .map(item => ({ ...item, precio: parseFloat(item.precio) || 0 }));

      // Paso 2: Inserción en la tabla
      const { error } = await supabase.from("productos").insert([
        {
          nombre: infoProducto.nombre,
          descripcion: infoProducto.descripcion,
          precio_original: parseFloat(infoProducto.precio_original) || 0,
          precio_oferta: parseFloat(infoProducto.precio_oferta) || 0,
          categoria: infoProducto.categoria,
          imagen_url: urlImagen, // Aquí ya garantizamos que si existe, es la URL real
          ingredientes: ingredientesLimpios,
          complementos: [], 
          bebidas: [],      
          disponible: true,
          fecha: new Date().toISOString()
        },
      ]);

      if (error) throw error;

      toast.success("¡MENÚ ACTUALIZADO!");
      
      // Resetear estado
      setInfoProducto({
        nombre: "", descripcion: "", precio_original: "", precio_oferta: "",
        categoria: "", ingredientes: []
      });
      setImagen(null);
      cargarDatos();
    } catch (error) { 
      toast.error(error.message); 
    } finally { 
      setCargando(false); 
    }
  };

  return (
    <div className="p-4 sm:p-10 bg-white min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      {/* HEADER TÁCTICO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-b border-slate-100 pb-8">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-[0.4em] mb-1 italic leading-none">
             <Zap size={14} fill="currentColor" /> ÁREA DE ENTRENAMIENTO
          </div>
          <h1 className="text-3xl md:text-4xl font-[1000] text-[#0f1a04] uppercase italic tracking-tighter leading-none">
            RECLUTAR <span className="text-emerald-500">NUEVO PRODUCTO</span>
          </h1>
        </div>
        <div className="size-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#0f1a04] shadow-sm">
            <Trophy size={28} strokeWidth={2.5} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10">
        {/* DIVISIONES (CATEGORÍAS) */}
        <div className="bg-[#0f1a04] rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border-b-8 border-emerald-600">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[80px] opacity-10"></div>
          <h2 className="text-[10px] font-black mb-6 flex items-center gap-2 uppercase italic tracking-[0.3em] text-emerald-500 relative z-10">
            <LayoutGrid size={16} /> GESTIONAR DIVISIONES
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-8 relative z-10">
            <input value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} placeholder="NOMBRE DE LA DIVISIÓN..." className="flex-1 p-4 bg-white/5 rounded-xl font-black text-white uppercase italic text-xs outline-none border border-white/10 focus:border-emerald-500 transition-all" />
            <button onClick={agregarCategoria} className="bg-emerald-500 text-[#0f1a04] px-8 py-4 rounded-xl font-[1000] uppercase italic tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">AÑADIR DIVISIÓN</button>
          </div>
          <div className="flex flex-wrap gap-2 relative z-10">
            {categorias.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 bg-white/5 border border-white/5 pl-5 pr-3 py-2.5 rounded-full hover:border-emerald-500/50 transition-all group">
                {categoriaEditando === cat.id ? <input autoFocus value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} className="bg-emerald-500/10 font-black italic uppercase outline-none w-24 text-[10px] text-emerald-400 p-1 rounded" /> : <span className="font-black text-[10px] uppercase italic text-white/60 group-hover:text-white transition-colors">{cat.nombre}</span>}
                <div className="flex gap-1 border-l border-white/10 pl-3">
                  {categoriaEditando === cat.id ? <button onClick={() => guardarEdicionCat(cat.id)} className="text-emerald-400"><Check size={14} strokeWidth={3}/></button> : <button onClick={() => {setCategoriaEditando(cat.id); setNombreEditado(cat.nombre)}} className="text-white/20 hover:text-emerald-500"><Pencil size={14}/></button>}
                  <button onClick={() => eliminarCategoria(cat.id)} className="text-white/20 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-2xl border border-slate-100">
          <form onSubmit={manejarEnvio}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase text-slate-300 ml-4 block tracking-[0.2em] italic">Foto Oficial del Item</label>
                <label className="relative h-80 lg:h-full min-h-[400px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all group overflow-hidden shadow-inner">
                  {imagen ? <img src={URL.createObjectURL(imagen)} className="object-contain w-full h-full p-8" alt="preview" /> : <div className="text-center p-6"><div className="size-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm"><ImagePlus size={28} className="opacity-20" /></div><span className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Cargar Perfil Visual</span></div>}
                  <input type="file" hidden accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />
                </label>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block italic tracking-widest">Nombre del Platillo</label>
                    <input name="nombre" value={infoProducto.nombre} onChange={manejarCambio} placeholder="EJ. WINGOOL MONSTER BURGER" className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-[#0f1a04] uppercase italic text-xs outline-none focus:ring-2 focus:ring-emerald-500/20" required />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block italic tracking-widest">Descripción</label>
                    <textarea name="descripcion" value={infoProducto.descripcion} onChange={manejarCambio} placeholder="DESCRIBE TU PRODUCTO..." className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-500 outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none italic text-xs" rows="3" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block italic tracking-widest">División Seleccionada</label>
                    <select value={infoProducto.categoria} onChange={(e) => setInfoProducto({...infoProducto, categoria: e.target.value})} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-[#0f1a04] uppercase italic text-[11px] outline-none" required>
                      <option value="">ELEGIR DIVISIÓN...</option>
                      {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-300 text-center block mb-2 italic">Precio Base</label>
                      <input type="number" name="precio_original" step="0.01" value={infoProducto.precio_original} onChange={manejarCambio} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-black text-slate-400 text-center text-xs outline-none" required />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-emerald-500 text-center block mb-2 italic tracking-widest animate-pulse">Precio MVP</label>
                      <input type="number" name="precio_oferta" step="0.01" value={infoProducto.precio_oferta} onChange={manejarCambio} className="w-full p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl font-black text-emerald-600 text-center text-sm outline-none italic shadow-md" required />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f1a04] rounded-[2.5rem] p-8 shadow-xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full blur-[60px] opacity-10"></div>
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center gap-3"><div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-500"><Coins size={18}/></div><h3 className="font-[1000] text-white text-[10px] uppercase italic tracking-widest leading-none">Gestionar Extras MVP</h3></div>
                      <button type="button" onClick={agregarItemExtra} className="bg-emerald-500 text-[#0f1a04] p-2 rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"><Plus size={18} strokeWidth={4}/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto custom-scrollbar pr-2 relative z-10">
                      {infoProducto.ingredientes.map(item => (
                        <div key={item.id} className="flex gap-3 items-center bg-white/5 p-4 rounded-2xl border border-white/5 group hover:border-emerald-500/30 transition-all">
                          <input placeholder="NOMBRE EXTRA" value={item.nombre} onChange={(e) => manejarCambioExtra(item.id, 'nombre', e.target.value)} className="flex-1 bg-transparent text-[11px] font-black text-white uppercase italic outline-none placeholder:opacity-20" />
                          <div className="flex items-center gap-1.5 bg-emerald-500 rounded-xl px-3 py-1.5"><span className="text-[#0f1a04] text-[10px] font-black italic">$</span><input type="number" step="0.01" value={item.precio} onChange={(e) => manejarCambioExtra(item.id, 'precio', e.target.value)} className="w-10 bg-transparent text-[#0f1a04] text-right text-[11px] font-[1000] italic outline-none" /></div>
                          <button type="button" onClick={() => eliminarItemExtra(item.id)} className="text-white/10 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div>
                      ))}
                    </div>
                </div>

                <button disabled={cargando} className="w-full bg-[#0f1a04] text-white py-6 rounded-[2rem] font-[1000] uppercase text-xs italic tracking-[0.3em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-2xl disabled:opacity-50">
                  {cargando ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} strokeWidth={4} className="text-emerald-500" /> <span>REGISTRAR FICHAJE EN MENÚ</span></>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StoreAddProduct;