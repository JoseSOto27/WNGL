import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- COMPONENTES GLOBALES ---
import Navbar from "./Components/Common/Navbar";
import Footer from "./Components/Common/Footer";
import ScrollToTop from "./Components/Common/ScrollToTop";

// --- PÁGINAS PÚBLICAS ---
import Home from "./Pages/Home";
import Shop from "./Pages/Shop";
import ProductDetails from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import Contact from "./Pages/Contact";
import About from "./Pages/About";
import Login from "./Pages/Login";

// --- TIENDA / ADMIN ---
import StoreLayout from "./store/StoreLayout";
import Dashboard from "./store/Dashboard";
import StoreAddProduct from "./store/StoreAddProduct";
import StoreManageProducts from "./store/StoreManageProducts";
import StoreOrders from "./store/StoreOrders";

// --- RUTAS PROTEGIDAS ---
import { AdminRoute } from "./store/ProtectedRoute"; 
import UserDashboard from "./store/UserDashboard"; 
import { UserRoute } from "./store/UserRoute"; 

function AppContent() {
  const location = useLocation();
  
  // Ocultamos Navbar y Footer si estamos en el panel de Admin o en el Login de administración
  const ocultarLayout = location.pathname.startsWith("/store") || location.pathname === "/admin";

  return (
    <>
      {/* Si no es ruta de admin, mostramos el Navbar estilo Wingool */}
      {!ocultarLayout && <Navbar />}
      
      {/* Notificaciones globales */}
      <Toaster 
        position="top-right" 
        reverseOrder={false} 
        toastOptions={{
          style: {
            background: '#1a2e05',
            color: '#fff',
            fontFamily: 'inherit',
            fontWeight: '900',
            fontStyle: 'italic',
            borderRadius: '1rem',
            border: '1px solid #10b981'
          }
        }}
      />

      <Routes>
        {/* --- RUTAS PÚBLICAS DE WINGOOL COMPANY --- */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* --- MI CUENTA (CLIENTES) --- */}
        <Route 
          path="/mi-cuenta" 
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          } 
        />

        {/* --- ACCESO ADMIN --- */}
        <Route path="/admin" element={<Login />} />

        {/* --- PANEL DE CONTROL ADMINISTRADOR (STORE) --- */}
        <Route 
          path="/store" 
          element={
            <AdminRoute>
              <StoreLayout />
            </AdminRoute>
          }
        >
          {/* Sub-rutas del Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="add-product" element={<StoreAddProduct />} />
          <Route path="manage-product" element={<StoreManageProducts />} />
          <Route path="orders" element={<StoreOrders />} />
        </Route>

        {/* --- ERROR 404 --- */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
            <h1 className="text-9xl font-black text-slate-100 absolute">404</h1>
            <div className="relative z-10 text-center">
              <h2 className="text-4xl font-black text-[#1a2e05] uppercase italic tracking-tighter mb-4">
                FUERA DE LUGAR
              </h2>
              <p className="text-slate-500 font-bold mb-8">Esta jugada no existe en nuestro sistema.</p>
              <a href="/" className="bg-[#1a2e05] text-white px-8 py-4 rounded-2xl font-black uppercase italic tracking-widest hover:bg-emerald-600 transition-all">
                VOLVER AL CAMPO
              </a>
            </div>
          </div>
        } />
      </Routes>

      {/* Si no es ruta de admin, mostramos el Footer */}
      {!ocultarLayout && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  );
}