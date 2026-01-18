import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./Pages/Home";
import Footer from "./Components/Common/Footer";
import ScrollToTop from "./Components/Common/ScrollToTop";
import Navbar from "./Components/Common/Navbar";
import Shop from "./Pages/Shop";
import ProductDetails from "./Pages/ProductDetails";
import Cart from "./Pages/Cart";
import StoreLayout from "./store/StoreLayout";
import Dashboard from "./store/Dashboard";
import StoreAddProduct from "./store/StoreAddProduct";
import StoreManageProducts from "./store/StoreManageProducts";
import StoreOrders from "./store/StoreOrders";
import Contact from "./Pages/Contact";
import Login from "./Pages/Login";
import About from "./Pages/About";
import { Toaster } from "react-hot-toast";

// Rutas Protegidas
import { AdminRoute } from "./store/ProtectedRoute"; 
import UserDashboard from "./store/UserDashboard"; 
import { UserRoute } from "./store/UserRoute"; 

function AppContent() {
  const location = useLocation();
  
  // Ocultamos Navbar y Footer si estamos en el panel de Admin o en el Login
  const ocultarLayout = location.pathname.startsWith("/store") || location.pathname === "/admin";

  return (
    <>
      {!ocultarLayout && <Navbar />}
      
      <Toaster position="top-right" reverseOrder={false} />

      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        
        {/* --- RUTA DE CLIENTE (Empatada con /mi-cuenta) --- */}
        <Route 
          path="/mi-cuenta" 
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          } 
        />

        {/* --- RUTA DE LOGIN --- */}
        <Route path="/admin" element={<Login />} />

        {/* --- RUTA DE ADMINISTRADOR (Empatada con /store) --- */}
        <Route 
          path="/store" 
          element={
            <AdminRoute>
              <StoreLayout />
            </AdminRoute>
          }
        >
          {/* Sub-rutas del panel Admin */}
          <Route index element={<Dashboard />} />
          <Route path="add-product" element={<StoreAddProduct />} />
          <Route path="manage-product" element={<StoreManageProducts />} />
          <Route path="orders" element={<StoreOrders />} />
        </Route>

        <Route path="*" element={<div className="p-20 text-center text-2xl font-bold">Página no encontrada</div>} />
      </Routes>

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