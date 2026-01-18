import { Link } from "react-router-dom";
import logo from "../assets/images/logo_light.webp"; // tu logo

const StoreNavbar = () => {
  return (
    <div className="flex items-center justify-between px-22 py-1 border-b border-slate-200 transition-all">
      <Link to="/" className="relative flex items-center gap-2">
        {/* Logo de la tienda */}
        <img
          src={logo}
          alt="Logo Store"
          className="h-10 sm:h-24 transition-transform duration-300"
          
        />
      </Link>

      <div className="flex items-center gap-3">
        <p>Hola Alejandro!</p>
      </div>
    </div>
  );
};

export default StoreNavbar;
