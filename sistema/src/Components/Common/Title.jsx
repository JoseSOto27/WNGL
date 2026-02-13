import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Title = ({ title, description, visibleButton = true, href = "/" }) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-semibold text-slate-800">{title}</h2>

      <Link
        to={href}
        className="flex flex-col items-center gap-2 sm:flex-row text-sm text-slate-600 mt-2 no-underline"
      >
        <p className="max-w-lg text-center">{description}</p>
        {visibleButton && (
          <button className="text-blue-600 flex items-center gap-1 mt-2 sm:mt-0">
            Ver mas <ArrowRight size={14} />
          </button>
        )}
      </Link>
    </div>
  );
};

export default Title;
