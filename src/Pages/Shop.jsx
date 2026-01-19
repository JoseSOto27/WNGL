import { MoveLeft, SearchX } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Loading from "../Components/Common/Loading";
import ProductCard from "../Components/Common/ProductCard";

function ContenidoTienda() {
  const navigate = useNavigate();
  const location = useLocation();

  const { list: productos, loading, error } = useSelector(
    (state) => state.product
  );

  /* =========================
     BÚSQUEDA Y NORMALIZACIÓN
  ========================== */
  const searchParams = new URLSearchParams(location.search);
  const busqueda = searchParams.get("search") || "";

  const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  };

  const singularizar = (texto = "") => texto.replace(/es$/i, "").replace(/s$/i, "");

  const terminoBusqueda = normalizarTexto(busqueda);
  const terminoSingular = singularizar(terminoBusqueda);

  const productosFiltrados = terminoBusqueda
    ? productos.filter((producto) => {
        const nombre = normalizarTexto(producto.name);
        const nombreSingular = singularizar(nombre);
        return (
          nombre.includes(terminoBusqueda) ||
          terminoBusqueda.includes(nombre) ||
          nombreSingular.includes(terminoSingular) ||
          terminoSingular.includes(nombreSingular)
        );
      })
    : productos;

  /* =========================
     ESTADOS DE CARGA / ERROR
  ========================== */
  if (loading) return <Loading text="CALENTANDO MOTORES..." />;

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[2.5rem] text-center max-w-md">
          <p className="text-red-600 font-black uppercase italic tracking-tighter">{error}</p>
        </div>
      </div>
    );
  }

  /* =========================
     ESTADO VACÍO (NO RESULTADOS)
  ========================== */
  if (!productosFiltrados.length) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center px-6">
        <div className="bg-slate-50 p-10 rounded-full shadow-inner">
          <SearchX size={50} className="text-slate-300" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-[#1a2e05] uppercase italic tracking-tighter">
            FUERA DE JUEGO
          </h2>
          <p className="text-slate-500 font-bold max-w-xs mx-auto text-sm">
            No encontramos resultados para <span className="text-emerald-600">"{busqueda}"</span>. Intenta con otro término.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
          <Link
            to="/shop"
            className="px-8 py-4 rounded-2xl bg-[#1a2e05] text-white font-black uppercase italic tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
          >
            VER TODO EL MENÚ
          </Link>
          <Link
            to="/"
            className="px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-black uppercase italic tracking-widest hover:bg-slate-50 transition-all"
          >
            VOLVER AL INICIO
          </Link>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER PRINCIPAL
  ========================== */
  return (
    <div className="min-h-screen bg-white pb-32 pt-28 sm:pt-32">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        
        {/* CABECERA WINGOOL */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div 
              onClick={() => navigate("/shop")}
              className="group flex items-center gap-2 text-emerald-600 font-black uppercase italic text-[10px] sm:text-xs tracking-[0.25em] mb-3 cursor-pointer"
            >
              {busqueda && <MoveLeft size={16} className="group-hover:-translate-x-1 transition-transform" />}
              {busqueda ? "VOLVER AL MENÚ" : "WINGOOL SELECCIÓN"}
            </div>
            
            {/* TÍTULO EN UN SOLO RENGLÓN CON RESPONSIVE */}
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-[#1a2e05] uppercase italic leading-none tracking-tighter">
              {busqueda ? "RESULTADOS " : "NUESTRO "}
              <span className="text-emerald-500">{busqueda ? "DE BÚSQUEDA" : "MENÚ"}</span>
            </h1>
          </div>
          
          {/* CONTADOR LÍMPIO (Solo visible en Desktop/Tablet) */}
          <div className="hidden md:block bg-slate-50 px-8 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 text-center">Stock Disponible</p>
            <p className="text-3xl font-black text-[#1a2e05] italic leading-none text-center">
              {productosFiltrados.length} <span className="text-sm font-bold text-slate-400">ARTÍCULOS</span>
            </p>
          </div>
        </div>

        {/* GRID DE PRODUCTOS */}
        {/* grid-cols-2: Dos productos por fila en celular (Look App Profesional)
            lg:grid-cols-3 / xl:grid-cols-4: Ajuste para pantallas grandes
        */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8 lg:gap-10">
          {productosFiltrados.map((producto) => (
            <ProductCard key={producto.id} product={producto} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContenidoTienda;