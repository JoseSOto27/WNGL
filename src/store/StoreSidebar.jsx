import { useLocation, Link } from "react-router-dom";
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react";

const StoreSidebar = ({ storeInfo }) => {
  const location = useLocation();  

  // Enlaces del menú lateral
  const sidebarLinks = [
    { name: "Panel", href: "/store", icon: HomeIcon },
    { name: "Agregar producto", href: "/store/add-product", icon: SquarePlusIcon },
    { name: "Administrar productos", href: "/store/manage-product", icon: SquarePenIcon },
    { name: "Pedidos", href: "/store/orders", icon: LayoutListIcon },
  ];

  return (
    <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60">
      {/* Encabezado con logo */}
      <div className="flex flex-col gap-3 justify-center items-center pt-8 max-sm:hidden">
        <p className="text-slate-700 font-medium">{storeInfo?.name}</p>
      </div>

      {/* Enlaces del menú lateral */}
      <div className="max-sm:mt-6">
        {sidebarLinks.map((link, index) => {
          const isActive = location.pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={index}
              to={link.href}
              className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition ${
                isActive ? "bg-slate-100 sm:text-slate-600" : ""
              }`}
            >
              <Icon size={18} className="sm:ml-5" />
              <p className="max-sm:hidden">{link.name}</p>
              {isActive && (
                <span className="absolute bg-green-500 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default StoreSidebar;
