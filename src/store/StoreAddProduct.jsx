import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../services/supabase";
import {
  Trash2, Pencil, Check, X, ImagePlus, Plus, 
  Trophy, Zap, LayoutGrid, Loader2, Star, Beer, Utensils
} from "lucide-react";

const StoreAddProduct = () => {
  const [categorias, setCategorias] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]); 
  const [imagen, setImagen] = useState(null);
  const [cargando, setCargando] = useState(false);

  const [infoProducto, setInfoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio_original: "",
    precio_oferta: "",
    precio_mayorista: "",
    categoria: "",
    ingredientes: [],
    complementos: [],
    bebidas: [],
  });

  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [categoriaEditando, setCategoriaEditando] = useState(null);
  const [nombreEditado, setNombreEditado] = useState("");

  const cargarDatos = async () => {
    const { data: catData } = await supabase.from("categorias").select("*").order("nombre");
    if (catData) setCategorias(catData);

    const { data: prodData } = await supabase.from("productos").select("id, nombre, precio_oferta, imagen_url");
    if (prodData) setTodosLosProductos(prodData);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarCambio = (e) => {
    setInfoProducto({ ...infoProducto, [e.target.name]: e.target.value });
  };

  const agregarItemExtra = (seccion) => {
    if (seccion === 'ingredientes') {
      const nuevoItem = { id: Date.now().toString(), nombre: "", precio: "" };
      setInfoProducto((prev) => ({ ...prev, [seccion]: [...prev[seccion], nuevoItem] }));
    } else {
      const nuevoItem = { id: "", nombre: "", precio: "", imagen: "" };
      setInfoProducto((prev) => ({ ...prev, [seccion]: [...prev[seccion], nuevoItem] }));
    }
  };

  const vincularProductoExtra = (seccion, indiceEnLista, productoId) => {
    const productoSeleccionado = todosLosProductos.find(p => p.id.toString() === productoId);
    if (!productoSeleccionado) return;

    const nuevaLista = [...infoProducto[seccion]];
    nuevaLista[indiceEnLista] = {
      id: productoSeleccionado.id.toString(),
      nombre: productoSeleccionado.nombre,
      precio: productoSeleccionado.precio_oferta,
      imagen: productoSeleccionado.imagen_url
    };
    setInfoProducto((prev) => ({ ...prev, [seccion]: nuevaLista }));
  };

  const eliminarItemExtra = (seccion, idORindex) => {
    setInfoProducto((prev) => ({
      ...prev,
      [seccion]: prev[seccion].filter((item, index) => 
        seccion === 'ingredientes' ? item.id !== idORindex : index !== idORindex
      ),
    }));
  };

  const manejarCambioExtra = (seccion, id, campo, valor) => {
    const nuevaLista = infoProducto[seccion].map((item) =>
      item.id === id ? { ...item, [campo]: valor } : item
    );
    setInfoProducto((prev) => ({ ...prev, [seccion]: nuevaLista }));
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

  const subirImagen = async () => {
    if (!imagen) return null;
    const fileName = `${Date.now()}-${imagen.name}`;
    const { error } = await supabase.storage.from("productos").upload(fileName, imagen);
    if (error) return null;
    const { data } = supabase.storage.from("productos").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setCargando(true);
    const ingredientesLimpios = infoProducto.ingredientes
      .filter(item => item.nombre.trim() !== "")
      .map(item => ({ ...item, precio: parseFloat(item.precio) || 0 }));
    const complementosLimpios = infoProducto.complementos.filter(item => item.id !== "");
    const bebidasLimpias = infoProducto.bebidas.filter(item => item.id !== "");

    try {
      const urlImagen = await subirImagen();
      const { error } = await supabase.from("productos").insert([
        {
          nombre: infoProducto.nombre,
          descripcion: infoProducto.descripcion,
          precio_original: parseFloat(infoProducto.precio_original) || 0,
          precio_oferta: parseFloat(infoProducto.precio_oferta) || 0,
          precio_mayorista: parseFloat(infoProducto.precio_mayorista) || 0,
          categoria: infoProducto.categoria,
          imagen_url: urlImagen,
          ingredientes: ingredientesLimpios,
          complementos: complementosLimpios,
          bebidas: bebidasLimpias,
          disponible: true,
          fecha: new Date().toISOString()
        },
      ]);
      if (error) throw error;
      toast.success("¡TOUCHDOWN! Menú actualizado");
      setInfoProducto({
        nombre: "", descripcion: "", precio_original: "", precio_oferta: "",
        precio_mayorista: "", categoria: "", ingredientes: [], complementos: [], bebidas: []
      });
      setImagen(null);
      cargarDatos();
    } catch (error) { toast.error(error.message); } finally { setCargando(false); }
  };

  return (
    <div className="p-4 sm:p-10 bg-slate-50/50 min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER MVP SUTIL */}
      <div className="flex justify-between items-end mb-10 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] uppercase tracking-[0.3em] mb-1 italic">
             <Zap size={12} fill="currentColor" /> Área de Entrenamiento
          </div>
          <h1 className="text-4xl md:text-5xl font-[1000] text-[#1a2e05] uppercase italic tracking-tighter leading-none">
            RECLUTAR <span className="text-emerald-500">JUGADOR</span>
          </h1>
        </div>
        <Trophy className="text-[#1a2e05] opacity-10 hidden md:block" size={60} />
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* DIVISIONES (CATEGORÍAS) */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
          <h2 className="text-[10px] font-black mb-6 flex items-center gap-2 uppercase italic tracking-[0.2em] text-slate-400">
            <LayoutGrid size={16} /> Gestionar Divisiones
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <input
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="NOMBRE DE LA DIVISIÓN..."
              className="flex-1 p-4 bg-slate-50 rounded-xl font-black text-[#1a2e05] uppercase italic text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all border border-slate-100"
            />
            <button onClick={agregarCategoria} className="bg-[#1a2e05] text-white px-8 py-4 rounded-xl font-black uppercase italic tracking-widest text-[10px] hover:bg-emerald-600 transition-all">AÑADIR</button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categorias.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 bg-white border border-slate-100 pl-5 pr-3 py-2.5 rounded-full shadow-sm hover:border-emerald-500 transition-all">
                {categoriaEditando === cat.id ? (
                  <input autoFocus value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} className="bg-emerald-50 font-black italic uppercase outline-none w-24 text-[10px] text-[#1a2e05]" />
                ) : <span className="font-black text-[10px] uppercase italic text-[#1a2e05]">{cat.nombre}</span>}
                <div className="flex gap-1 border-l border-slate-100 pl-3">
                  {categoriaEditando === cat.id ? (
                    <button onClick={() => guardarEdicionCat(cat.id)} className="text-emerald-500"><Check size={14} strokeWidth={3}/></button>
                  ) : (
                    <button onClick={() => {setCategoriaEditando(cat.id); setNombreEditado(cat.nombre)}} className="text-slate-300 hover:text-[#1a2e05]"><Pencil size={14}/></button>
                  )}
                  <button onClick={() => eliminarCategoria(cat.id)} className="text-slate-200 hover:text-red-500"><Trash2 size={14}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORMULARIO PRODUCTO */}
        <div className="bg-white rounded-[3rem] p-6 md:p-10 shadow-xl border border-slate-100">
          <form onSubmit={manejarEnvio}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* UPLOAD IMAGEN - SUTIL */}
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase text-slate-300 ml-4 block tracking-[0.2em] italic">Foto Oficial</label>
                <label className="relative h-80 lg:h-full bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all group overflow-hidden">
                  {imagen ? (
                    <img src={URL.createObjectURL(imagen)} className="object-contain w-full h-full p-6 group-hover:scale-105 transition-transform" alt="preview" />
                  ) : (
                    <div className="text-center">
                      <ImagePlus size={32} className="text-slate-200 mx-auto mb-3" />
                      <span className="text-[9px] font-black text-slate-300 uppercase italic tracking-widest">Cargar Visual</span>
                    </div>
                  )}
                  <input type="file" hidden accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />
                </label>
              </div>

              {/* DATOS BÁSICOS */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block italic tracking-widest">Nombre del Platillo</label>
                    <input name="nombre" value={infoProducto.nombre} onChange={manejarCambio} placeholder="EJ. WINGOOL MONSTER BURGER" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-[#1a2e05] uppercase italic outline-none focus:border-emerald-500 transition-all" required />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block italic tracking-widest">Análisis Táctico (Descripción)</label>
                    <textarea name="descripcion" value={infoProducto.descripcion} onChange={manejarCambio} placeholder="DESCRIPCIÓN DE LA JUGADA..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-500 outline-none focus:border-emerald-500 resize-none italic text-xs" rows="2" />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-4 mb-2 block italic tracking-widest">División</label>
                    <select value={infoProducto.categoria} onChange={(e) => setInfoProducto({...infoProducto, categoria: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-[#1a2e05] uppercase italic text-xs outline-none focus:border-emerald-500 cursor-pointer" required>
                      <option value="">ELEGIR DIVISIÓN...</option>
                      {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-400 text-center block mb-2 italic">BASE</label>
                      <input type="number" name="precio_original" step="0.01" value={infoProducto.precio_original} onChange={manejarCambio} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-black text-slate-400 text-center text-xs outline-none" required />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-emerald-500 text-center block mb-2 italic">MVP</label>
                      <input type="number" name="precio_oferta" step="0.01" value={infoProducto.precio_oferta} onChange={manejarCambio} className="w-full p-4 bg-emerald-50 border border-emerald-100 rounded-xl font-black text-emerald-600 text-center text-sm outline-none italic" required />
                    </div>
                  </div>
                </div>

                {/* SECCIÓN EXTRAS COMPACTA */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="bg-[#1a2e05] rounded-[2rem] p-5 shadow-lg space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-emerald-500 text-[10px] uppercase italic tracking-widest">Extras</h3>
                      <button type="button" onClick={() => agregarItemExtra('ingredientes')} className="bg-emerald-500 text-[#1a2e05] p-1.5 rounded-lg hover:scale-110 transition-transform"><Plus size={16} strokeWidth={3}/></button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {infoProducto.ingredientes.map(item => (
                        <div key={item.id} className="flex gap-2 items-center bg-white/5 p-2 rounded-xl border border-white/5">
                          <input placeholder="NOMBRE" value={item.nombre} onChange={(e) => manejarCambioExtra('ingredientes', item.id, 'nombre', e.target.value)} className="flex-1 bg-transparent text-[9px] font-black text-white uppercase italic outline-none placeholder:opacity-20" />
                          <input type="number" step="0.01" placeholder="$" value={item.precio} onChange={(e) => manejarCambioExtra('ingredientes', item.id, 'precio', e.target.value)} className="w-10 bg-emerald-500 text-[#1a2e05] text-center rounded-lg text-[9px] font-black italic outline-none" />
                          <button type="button" onClick={() => eliminarItemExtra('ingredientes', item.id)} className="text-white/20 hover:text-red-500"><X size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VINCULOS ANTOJOS */}
                  <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-[#1a2e05] text-[10px] uppercase italic tracking-widest">Antojos</h3>
                      <button type="button" onClick={() => agregarItemExtra('complementos')} className="text-[#1a2e05] bg-white border border-slate-200 p-1.5 rounded-lg hover:bg-[#1a2e05] hover:text-white transition-all shadow-sm"><Utensils size={14}/></button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {infoProducto.complementos.map((item, index) => (
                        <div key={index} className="bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between group/item">
                          <select className="flex-1 bg-transparent text-[9px] font-black text-[#1a2e05] uppercase italic outline-none" value={item.id} onChange={(e) => vincularProductoExtra('complementos', index, e.target.value)}>
                            <option value="">ELEGIR...</option>
                            {todosLosProductos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </select>
                          <button type="button" onClick={() => eliminarItemExtra('complementos', index)} className="text-slate-200 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* VINCULOS BEBIDAS */}
                  <div className="bg-slate-50 rounded-[2rem] p-5 border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-[#1a2e05] text-[10px] uppercase italic tracking-widest">Bebidas</h3>
                      <button type="button" onClick={() => agregarItemExtra('bebidas')} className="text-[#1a2e05] bg-white border border-slate-200 p-1.5 rounded-lg hover:bg-[#1a2e05] hover:text-white transition-all shadow-sm"><Beer size={14}/></button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {infoProducto.bebidas.map((item, index) => (
                        <div key={index} className="bg-white p-2 rounded-xl border border-slate-100 flex items-center justify-between">
                          <select className="flex-1 bg-transparent text-[9px] font-black text-[#1a2e05] uppercase italic outline-none" value={item.id} onChange={(e) => vincularProductoExtra('bebidas', index, e.target.value)}>
                            <option value="">ELEGIR...</option>
                            {todosLosProductos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                          </select>
                          <button type="button" onClick={() => eliminarItemExtra('bebidas', index)} className="text-slate-200 hover:text-red-500"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button disabled={cargando} className="w-full bg-[#1a2e05] text-white py-5 rounded-2xl font-black uppercase text-sm italic tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-xl">
                  {cargando ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} strokeWidth={4} /> <span>PUBLICAR JUGADA</span></>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10b981; }
      `}</style>
    </div>
  );
};

export default StoreAddProduct;