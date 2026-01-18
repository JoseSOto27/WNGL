import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../services/supabase";
import {
  Trash2,
  Pencil,
  Check,
  X,
  ImagePlus,
  Plus,
  Pizza,
  Coffee,
  Utensils,
  Star,
  Trophy,
  Flame,
  LayoutGrid,
  Loader2
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
      toast.success("Categoría agregada");
      setNuevaCategoria("");
      cargarDatos();
    }
  };

  const eliminarCategoria = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const { error } = await supabase.from("categorias").delete().eq("id", id);
    if (!error) { toast.success("Categoría eliminada"); cargarDatos(); }
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

    const ingredientesLimpios = infoProducto.ingredientes.filter(item => item.nombre.trim() !== "");
    const complementosLimpios = infoProducto.complementos.filter(item => item.id !== "");
    const bebidasLimpias = infoProducto.bebidas.filter(item => item.id !== "");

    const urlImagen = await subirImagen();

    const { error } = await supabase.from("productos").insert([
      {
        nombre: infoProducto.nombre,
        descripcion: infoProducto.descripcion,
        precio_original: Number(infoProducto.precio_original),
        precio_oferta: Number(infoProducto.precio_oferta),
        precio_mayorista: Number(infoProducto.precio_mayorista),
        categoria: infoProducto.categoria,
        imagen_url: urlImagen,
        ingredientes: ingredientesLimpios,
        complementos: complementosLimpios,
        bebidas: bebidasLimpias,
      },
    ]);

    if (!error) {
      toast.success("¡Touchdown! Platillo agregado");
      setInfoProducto({
        nombre: "", descripcion: "", precio_original: "", precio_oferta: "",
        precio_mayorista: "", categoria: "", ingredientes: [], complementos: [], bebidas: []
      });
      setImagen(null);
      cargarDatos();
    } else {
        toast.error("Error al guardar: " + error.message);
    }
    setCargando(false);
  };

  return (
    <div className="px-4 pb-20 bg-slate-50 min-h-screen pt-10 text-slate-800 max-w-6xl mx-auto">
      
      {/* SECCIÓN CATEGORÍAS */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 mb-10 relative overflow-hidden">
        <h2 className="text-3xl font-black mb-6 flex items-center gap-3 uppercase italic tracking-tighter text-[#1a2e05]">
          <LayoutGrid size={28} className="text-emerald-600" /> Gestionar <span className="text-emerald-600">Categorías</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            value={nuevaCategoria}
            onChange={(e) => setNuevaCategoria(e.target.value)}
            placeholder="Nombre de la nueva división..."
            className="flex-1 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
          />
          <button onClick={agregarCategoria} className="bg-[#1a2e05] text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-95 shadow-lg">Añadir</button>
        </div>

        <div className="flex flex-wrap gap-3">
          {categorias.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 bg-white border-2 border-slate-100 px-5 py-2.5 rounded-2xl shadow-sm hover:border-emerald-200 transition-all">
              {categoriaEditando === cat.id ? (
                <input autoFocus value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} className="bg-slate-50 border-b-2 border-emerald-500 font-bold outline-none w-28 text-sm" />
              ) : <span className="font-black text-xs uppercase italic tracking-wider text-[#1a2e05]">{cat.nombre}</span>}
              <div className="flex gap-2 border-l-2 border-slate-100 pl-3">
                {categoriaEditando === cat.id ? (
                  <button onClick={() => guardarEdicionCat(cat.id)} className="text-emerald-600"><Check size={18} strokeWidth={3}/></button>
                ) : (
                  <button onClick={() => {setCategoriaEditando(cat.id); setNombreEditado(cat.nombre)}}><Pencil size={16}/></button>
                )}
                <button onClick={() => eliminarCategoria(cat.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AGREGAR PRODUCTO */}
      <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100 relative">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-[#1a2e05]">
            Nuevo <span className="text-emerald-600">Platillo</span>
          </h1>
          <Trophy className="text-emerald-500 opacity-20" size={60} />
        </div>

        <form onSubmit={manejarEnvio}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
            <label className="relative h-64 lg:h-full min-h-[250px] bg-slate-50 border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-all overflow-hidden group">
              {imagen ? <img src={URL.createObjectURL(imagen)} className="object-cover w-full h-full" alt="p" /> : <div className="text-center p-6"><ImagePlus size={40} className="text-emerald-600 mx-auto mb-4" /><span className="text-xs font-black text-slate-400 uppercase tracking-widest block">Foto del Platillo</span></div>}
              <input type="file" hidden accept="image/*" onChange={(e) => setImagen(e.target.files[0])} />
            </label>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Nombre</label>
                <input name="nombre" value={infoProducto.nombre} onChange={manejarCambio} placeholder="Ej. Alitas BBQ" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 shadow-sm" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Categoría</label>
                <select value={infoProducto.categoria} onChange={(e) => setInfoProducto({...infoProducto, categoria: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 cursor-pointer" required>
                  <option value="">Seleccionar...</option>
                  {categorias.map(c => <option key={c.id} value={c.nombre}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Precio Original</label>
                <input type="number" name="precio_original" value={infoProducto.precio_original} onChange={manejarCambio} placeholder="$ 0.00" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 shadow-sm" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Precio Venta</label>
                <input type="number" name="precio_oferta" value={infoProducto.precio_oferta} onChange={manejarCambio} placeholder="$ 0.00" className="w-full p-4 bg-emerald-50/50 border-2 border-emerald-100 rounded-2xl font-black text-emerald-700 outline-none focus:border-emerald-500 shadow-sm" required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Precio Mayorista</label>
                <input type="number" name="precio_mayorista" value={infoProducto.precio_mayorista} onChange={manejarCambio} placeholder="$ 0.00" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:border-emerald-500 shadow-sm" required />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-[0.2em]">Descripción</label>
                <textarea name="descripcion" value={infoProducto.descripcion} onChange={manejarCambio} placeholder="Describe el sabor..." className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-[2rem] font-bold text-slate-700 outline-none focus:border-emerald-500 shadow-sm resize-none" rows="3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#1a2e05] rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden text-white">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-emerald-500 text-xs uppercase italic tracking-widest">Ingredientes Extra</h3>
                <button type="button" onClick={() => agregarItemExtra('ingredientes')} className="bg-emerald-500 text-[#1a2e05] p-2 rounded-xl active:scale-90"><Plus size={18} strokeWidth={3}/></button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {infoProducto.ingredientes.map(item => (
                  <div key={item.id} className="flex gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                    <input placeholder="Nombre" value={item.nombre} onChange={(e) => manejarCambioExtra('ingredientes', item.id, 'nombre', e.target.value)} className="flex-1 bg-transparent text-[11px] font-bold text-white outline-none" />
                    <input type="number" placeholder="$" value={item.precio} onChange={(e) => manejarCambioExtra('ingredientes', item.id, 'precio', e.target.value)} className="w-12 bg-emerald-500/20 text-emerald-400 text-center rounded-lg text-[11px] font-black" />
                    <button type="button" onClick={() => eliminarItemExtra('ingredientes', item.id)} className="text-red-400"><X size={16}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-emerald-600 text-xs uppercase italic tracking-widest">Vincular Antojos</h3>
                <button type="button" onClick={() => agregarItemExtra('complementos')} className="bg-[#1a2e05] text-white p-2 rounded-xl active:scale-90"><Plus size={18} strokeWidth={3}/></button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {infoProducto.complementos.map((item, index) => (
                  <div key={index} className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col">
                    <div className="flex gap-2 items-center">
                      <select className="flex-1 bg-transparent text-[10px] font-black uppercase outline-none" value={item.id} onChange={(e) => vincularProductoExtra('complementos', index, e.target.value)}>
                        <option value="">Elegir...</option>
                        {todosLosProductos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                      <button type="button" onClick={() => eliminarItemExtra('complementos', index)} className="text-red-400"><X size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-emerald-600 text-xs uppercase italic tracking-widest">Vincular Bebidas</h3>
                <button type="button" onClick={() => agregarItemExtra('bebidas')} className="bg-[#1a2e05] text-white p-2 rounded-xl active:scale-90"><Plus size={18} strokeWidth={3}/></button>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {infoProducto.bebidas.map((item, index) => (
                  <div key={index} className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex flex-col">
                    <div className="flex gap-2 items-center">
                      <select className="flex-1 bg-transparent text-[10px] font-black uppercase outline-none" value={item.id} onChange={(e) => vincularProductoExtra('bebidas', index, e.target.value)}>
                        <option value="">Elegir...</option>
                        {todosLosProductos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                      </select>
                      <button type="button" onClick={() => eliminarItemExtra('bebidas', index)} className="text-red-400"><X size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button disabled={cargando} className="mt-16 bg-[#1a2e05] text-white py-6 rounded-[2.5rem] font-black text-xl uppercase italic tracking-[0.2em] w-full shadow-2xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-4 group">
            {cargando ? <><Loader2 className="animate-spin" /> <span>SUBIENDO...</span></> : <><Check size={28} strokeWidth={3} /> <span>Publicar en el Menú</span></>}
          </button>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default StoreAddProduct;