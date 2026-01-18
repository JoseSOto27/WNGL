

const About = () => {
  return (
    <div className="min-h-screen bg-white pt-24 sm:pt-28 md:pt-32">
      <div className="mx-6">
        <div className="max-w-6xl mx-auto py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-slate-800 mb-4">
              Sobre <span className="text-blue-600">Nosotros</span>
            </h2>
            <p className="text-base text-slate-600 max-w-3xl mx-auto">
              Descubre Multiservicios KUK en Aldea Campat, San Juan Chamelco: tu aliado confiable para útiles escolares, gestión de certificados RENAP, trámites de RTU, impresión de calcomanías y tarjeta de circulación. Servicios rápidos, confiables y de calidad para toda la comunidad.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Imagen */}
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-100 rounded-2xl -rotate-2 opacity-60"></div>
                <img
                  src="/images/about.webp"
                  alt="Equipo de Multiservicios KUK"
                  className="relative rounded-2xl shadow-lg w-full h-auto"
                />
              </div>
            </div>

            {/* Contenido */}
            <div className="lg:w-1/2 space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">
                  Nuestra <span className="text-blue-600">Misión</span>
                </h3>
                <p className="text-base text-slate-600 leading-relaxed">
                  En Multiservicios KUK en Chamelco nos dedicamos a ofrecer servicios confiables y productos de alta calidad. Desde útiles escolares, gestión de certificados RENAP y trámites de RTU, hasta impresión de calcomanías y tarjeta de circulación, buscamos ser tu aliado de confianza para todas tus necesidades diarias.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-slate-800 mb-4">
                  Lo que <span className="text-blue-600">Ofrecemos</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <span className="text-3xl">📚</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1 text-base">Útiles Escolares</h4>
                      <p className="text-slate-600 text-base">Materiales de calidad para estudiantes en Chamelco</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <span className="text-3xl">📝</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1 text-base">Gestión de Certificados RENAP</h4>
                      <p className="text-slate-600 text-base">Trámites rápidos y confiables de documentos personales</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <span className="text-3xl">🏢</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1 text-base">Trámites de RTU</h4>
                      <p className="text-slate-600 text-base">Asesoría completa para tu Registro Tributario Unificado</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <span className="text-3xl">🖨️</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1 text-base">Impresión de Calcomanías</h4>
                      <p className="text-slate-600 text-base">Calcomanías y documentos impresos de alta calidad</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                      <span className="text-3xl">🛂</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-800 mb-1 text-base">Tarjeta de Circulación</h4>
                      <p className="text-slate-600 text-base">Trámites rápidos y seguros para vehículos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h4 className="font-medium text-slate-800 mb-3 flex items-center text-base">
                  <span className="text-blue-600 mr-2">✓</span>
                  Compromiso de Calidad
                </h4>
                <p className="text-slate-600 text-base">
                  Nos comprometemos a ofrecer solo productos de la más alta calidad y servicios confiables que superen tus expectativas. Tu satisfacción es nuestra prioridad en Multiservicios KUK, Aldea Campat.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
