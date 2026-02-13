import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, Menu, X, LogOut, Star } from "lucide-react";
import { useSelector } from "react-redux";
import { supabase } from "../../services/supabase"; 
import logo from "../../assets/images/logo_light.webp";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null); 
  const [userRole, setUserRole] = useState("cliente"); 
  const cartCount = useSelector((state) => state.cart.total);

  useEffect(() => {
    const getRole = async (userId) => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();
      if (data) setUserRole(data.role);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) getRole(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) getRole(session.user.id);
      else setUserRole("cliente"); 
    });

    return () => subscription.unsubscribe();
  }, []);

  const profileRoute = userRole === "admin" ? "/store" : "/mi-cuenta";

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${search}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      toast.success("Sesión cerrada");
      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Error al salir");
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-[60] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center h-20 gap-4">
            
            {/* LOGO AREA */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="lg:hidden p-2 text-[#1a2e05] hover:bg-emerald-50 rounded-xl transition-colors"
              >
                <Menu size={24} />
              </button>
              <img 
                src={logo} 
                alt="Logo Wingool" 
                className="h-14 w-auto cursor-pointer hidden sm:block hover:scale-105 transition-transform" 
                onClick={() => navigate("/")} 
              />
            </div>

          {/* SEARCH BAR WINGOOL STYLE */}
  <form 
  onSubmit={handleSearch} 
  className="flex items-center gap-3 bg-white px-6 py-3 rounded-full border-2 border-slate-100 focus-within:border-emerald-500 focus-within:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex-1 max-w-lg mx-auto transition-all duration-300 group"
>
  <Search 
    size={20} 
    className="text-[#1a2e05] opacity-30 group-focus-within:opacity-100 group-focus-within:text-emerald-500 transition-all" 
  />
  <input 
    type="text" 
    placeholder="BUSCA TU PRÓXIMA JUGADA..." 
    value={search} 
    onChange={(e) => setSearch(e.target.value)} 
    className="w-full bg-transparent outline-none text-[11px] font-[1000] uppercase italic tracking-widest text-[#1a2e05] placeholder:text-slate-300 placeholder:italic" 
    required 
  />
  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse opacity-0 group-focus-within:opacity-100 transition-opacity" />
</form>

            {/* DESKTOP NAV */}
            <div className="hidden lg:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400 ml-6">
              <Link to="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
              <Link to="/shop" className="hover:text-emerald-600 transition-colors">Menú</Link>
            </div>

            {/* PROFILE & CART */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center">
                {session ? (
                  <div className="flex items-center gap-3 bg-white p-1 pr-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <Link to={profileRoute} className="flex items-center gap-2 group">
                      <div className="relative">
                        <img 
                          src={session.user.user_metadata.avatar_url} 
                          alt="Perfil" 
                          className="w-9 h-9 rounded-2xl border-2 border-emerald-500 shadow-sm group-hover:scale-105 transition-transform object-cover"
                        />
                        {userRole === "admin" && (
                          <div className="absolute -top-1 -right-1 bg-[#1a2e05] text-white p-0.5 rounded-full border border-white">
                            <Star size={8} fill="currentColor" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-emerald-600 leading-none tracking-tighter">
                          {userRole === "admin" ? "Administrador" : "Cliente Gold"}
                        </span>
                        <span className="text-xs font-black text-[#1a2e05] truncate max-w-[90px] uppercase italic">
                          {session.user.user_metadata.full_name.split(' ')[0]}
                        </span>
                      </div>
                    </Link>
                    
                    <div className="w-[1px] h-6 bg-slate-100 mx-1"></div>

                    <button 
                      onClick={handleLogout} 
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                      title="Cerrar sesión"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/admin" 
                    className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-[#1a2e05] text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/10 active:scale-95"
                  >
                    Ingresar
                  </Link>
                )}
              </div>

              {/* CART ICON */}
              <Link 
                to="/cart" 
                className="relative group p-3 bg-emerald-50 rounded-2xl text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all active:scale-90"
              >
                <ShoppingCart size={22} strokeWidth={2.5} />
                <span className="absolute -top-1 -right-1 text-[10px] bg-[#1a2e05] text-white size-5 rounded-xl flex items-center justify-center font-black italic shadow-lg border-2 border-white">
                  {cartCount}
                </span>
              </Link>
            </div>

          </div>
        </div>
      </nav>

      {/* MOBILE MENU IMPROVED */}
      <div className={`lg:hidden fixed inset-0 bg-[#1a2e05]/60 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className={`fixed top-0 left-0 w-[80%] max-w-sm h-full bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <img src={logo} alt="Logo" className="h-10" />
            <button 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="p-2 text-slate-400 hover:text-[#1a2e05] bg-slate-50 rounded-xl"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6 flex flex-col h-[calc(100%-88px)]">
            <nav className="space-y-2 flex-1">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-5 py-4 font-black uppercase italic text-slate-800 hover:bg-slate-50 rounded-2xl transition-colors">Inicio</Link>
              <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-5 py-4 font-black uppercase italic text-slate-800 hover:bg-slate-50 rounded-2xl transition-colors">Menú
              </Link>
              
              <div className="my-6 border-t border-slate-50 pt-6">
                {session ? (
                  <div className="space-y-3">
                    <Link 
                      to={profileRoute} 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="flex items-center gap-4 p-4 bg-emerald-50 text-emerald-700 rounded-[2rem] font-black uppercase text-xs"
                    >
                      <img src={session.user.user_metadata.avatar_url} className="w-10 h-10 rounded-2xl border-2 border-white shadow-sm" alt="" />
                      <span>Ver mi panel</span>
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest"
                    >
                      <LogOut size={16} /> Cerrar Sesión
                    </button>
                  </div>
                ) : (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                    className="block w-full text-center p-5 bg-[#1a2e05] text-white rounded-3xl font-black uppercase text-xs tracking-widest"
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </nav>
            
            <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              Wingool Company © 2026
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;