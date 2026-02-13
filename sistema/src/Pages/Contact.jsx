import React, { useState } from "react";
import { 
  Phone, 
  Clock,  
  MessageCircle,
  Send,
  Facebook,
  Instagram,
  MapPin,
  Star,
  Trophy
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    alert("¡Kickoff! Tu mensaje ha sido enviado. Te contactaremos pronto.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/527751521896", "_blank", "noopener noreferrer");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HEADER ESTILO SPORTBAR */}
        <div className="text-center mb-16 relative">
          <Trophy className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 text-emerald-500/10 -z-0" />
          <h1 className="text-5xl md:text-6xl font-black text-[#1a2e05] uppercase italic tracking-tighter relative z-10">
            Ponte en <span className="text-emerald-600">Contacto</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.3em] mt-4 relative z-10">
            La alineación titular está lista para escucharte
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* INFORMACIÓN DE CONTACTO */}
          <div className="space-y-8">
            
            {/* CARD DE HORARIOS WINGOOL */}
            <div className="bg-[#1a2e05] rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-white">
              <Star className="absolute -right-6 -top-6 w-32 h-32 text-emerald-500 opacity-20 rotate-12" />
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-emerald-500 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                  <Clock className="text-[#1a2e05]" size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-black uppercase italic tracking-tighter">Horarios de Juego</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="font-bold text-emerald-400 uppercase tracking-widest text-[10px]">Martes a Domingo</span>
                  <span className="font-black italic text-lg uppercase tracking-tighter">A partir de la 1 PM</span>
                </div>
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest italic pt-2">
                  * Los lunes descansamos para calentar motores
                </p>
              </div>
            </div>

            {/* INFO CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a href="tel:+527751521896" className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                <div className="bg-slate-50 w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Phone size={20} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Llámanos</p>
                <p className="text-sm font-black text-[#1a2e05]">+52 775 152 1896</p>
              </a>

              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="bg-slate-50 w-12 h-12 flex items-center justify-center rounded-2xl mb-4">
                  <MapPin size={20} className="text-emerald-600" />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ubícanos</p>
                <p className="text-[11px] font-black text-[#1a2e05] uppercase leading-tight italic">Carr. Tulancingo-Santiago #415, Medias Tierras</p>
              </div>
            </div>

            {/* SOCIAL MEDIA BAR */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-xs font-black uppercase text-[#1a2e05] italic tracking-tighter">Síguenos en la cancha:</p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/profile.php?id=61576125955219" className="bg-slate-100 p-4 rounded-2xl text-[#1a2e05] hover:bg-emerald-500 hover:text-white transition-all">
                  <Facebook size={20} fill="currentColor" />
                </a>
                <a href="https://www.instagram.com/wingoolcompanytulancingo/" className="bg-slate-100 p-4 rounded-2xl text-[#1a2e05] hover:bg-emerald-500 hover:text-white transition-all">
                  <Instagram size={20} />
                </a>
              </div>
            </div>

            <button
              onClick={openWhatsApp}
              className="w-full bg-emerald-500 text-[#1a2e05] py-6 rounded-[2.5rem] font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] shadow-xl shadow-emerald-500/20 active:scale-95"
            >
              <MessageCircle size={24} strokeWidth={2.5} />
              <span>Chatear por WhatsApp</span>
            </button>
          </div>

          {/* FORMULARIO DE CONTACTO PREMIUM */}
          <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl border border-slate-100 relative">
            <h3 className="text-3xl font-black text-[#1a2e05] mb-8 uppercase italic tracking-tighter flex items-center gap-3">
               Mándanos un <span className="text-emerald-600">Mensaje</span>
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Nombre Completo</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    placeholder="Tu nombre de MVP"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">WhatsApp / Cel</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                    placeholder="+52 000..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="tu@correo.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4 tracking-widest">Mensaje</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] p-4 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  placeholder="¿Dudas, quejas o reservas?"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1a2e05] text-white py-5 rounded-[2rem] font-black uppercase italic tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-emerald-700 shadow-xl active:scale-95"
              >
                <Send size={20} strokeWidth={2.5} />
                <span>Enviar Comentario</span>
              </button>
            </form>
          </div>
        </div>

        {/* LLAMADO A LA ACCIÓN FINAL */}
        <div className="mt-20 bg-emerald-50 rounded-[4rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100 rounded-full blur-3xl -z-0"></div>
          <div className="relative z-10">
            <h3 className="text-4xl font-black text-[#1a2e05] mb-4 uppercase italic tracking-tighter">
              ¿Hambre de <span className="text-emerald-600">Victoria?</span>
            </h3>
            <p className="text-slate-600 font-bold max-w-2xl mx-auto mb-10 text-sm uppercase italic tracking-tight">
              En Wingool Company Tulancingo, estamos listos para servirte el mejor sabor y la atención de campeones. ¡No te quedes fuera de la jugada!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={openWhatsApp}
                className="bg-emerald-500 text-[#1a2e05] py-4 px-10 rounded-2xl font-black uppercase italic tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
              >
                Orden Directa
              </button>
              <a
                href="tel:+527751521896"
                className="bg-[#1a2e05] text-white py-4 px-10 rounded-2xl font-black uppercase italic tracking-widest hover:scale-105 transition-all"
              >
                Llamada de Emergencia
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;