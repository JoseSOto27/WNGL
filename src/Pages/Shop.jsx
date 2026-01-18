import { MoveLeft } from "lucide-react";
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
     BÚSQUEDA
  ========================== */

  const searchParams = new URLSearchParams(location.search);
  const busqueda = searchParams.get("search") || "";

  // 🔒 Normaliza texto (acentos, mayúsculas, null)
  const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  // 🔁 Singulariza (cables → cable)
  const singularizar = (texto = "") =>
    texto.replace(/es$/i, "").replace(/s$/i, "");

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
     ESTADOS
  ========================== */

  if (loading) {
    return <Loading text="Cargando productos..." />;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-20">
        <p>{error}</p>
      </div>
    );
  }

  if (!productosFiltrados.length) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-6 pt-20">
        <h2 className="text-xl font-semibold text-slate-700">
          No encontramos productos
        </h2>

        {busqueda && (
          <p className="text-slate-500">
            No hay resultados para <strong>"{busqueda}"</strong>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Link
            to="/"
            className="px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition"
          >
            Ir al inicio
          </Link>

          <Link
            to="/shop"
            className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================== */

  return (
    <div className="min-h-[70vh] mx-6 pt-20">
      <div className="max-w-7xl mx-auto">
        <h1
          onClick={() => navigate("/shop")}
          className="text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"
        >
          {busqueda && <MoveLeft size={20} />}
          Todos los <span className="text-slate-700 font-medium">Productos</span>
        </h1>

        <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
          {productosFiltrados.map((producto) => (
            <ProductCard key={producto.id} product={producto} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ContenidoTienda;
