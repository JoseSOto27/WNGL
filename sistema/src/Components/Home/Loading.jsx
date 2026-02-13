const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-8">
      {/* Logo con efecto ondulado */}
      <div className="flex space-x-1 text-6xl font-bold text-blue-600">
        <span className="wave-letter" style={{ animationDelay: '0s' }}>K</span>
        <span className="wave-letter" style={{ animationDelay: '0.1s' }}>U</span>
        <span className="wave-letter" style={{ animationDelay: '0.2s' }}>K</span>
      </div>
      
      {/* Texto con efecto de puntos grandes azules */}
      <div className="text-center">
        <p className="text-gray-600 font-medium mb-2">Cargando</p>
        <div className="flex justify-center space-x-3 mt-2">
          <span className="animate-pulse text-3xl text-blue-500">•</span>
          <span className="animate-pulse text-3xl text-blue-500" style={{ animationDelay: '0.3s' }}>•</span>
          <span className="animate-pulse text-3xl text-blue-500" style={{ animationDelay: '0.6s' }}>•</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .wave-letter {
          display: inline-block;
          animation: wave 1.5s ease-in-out infinite;
        }

        
      `}</style>
    </div>
  );
};

export default Loading;

