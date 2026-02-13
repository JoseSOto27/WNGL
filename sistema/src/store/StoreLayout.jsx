import { Outlet } from "react-router-dom";
import SellerNavbar from "./StoreNavbar";
import SellerSidebar from "./StoreSidebar";

const StoreLayout = () => {
  return (
    <div className="flex flex-col h-screen">
      <SellerNavbar />

      <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
        <SellerSidebar />

        <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StoreLayout;
