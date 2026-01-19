import BestSelling from "../Components/Home/BestSelling"
import Hero from "../Components/Home/Hero"
import OurSpecs from "../Components/Home/OurSpecs"
// 1. Importamos el componente de promociones (ajusta la ruta si lo guardaste en otra carpeta)
import WeeklyPromos from "../Components/Home/WeeklyPromos"

const Home = () => {
  return (
    // Padding-top para evitar que el Navbar tape el Hero
    <div className="pt-16">
      {/* SECCIÓN 1: BIENVENIDA */}
      <Hero/>
      
      {/* SECCIÓN 2: LO MÁS VENDIDO */}
      <BestSelling/>

      {/* SECCIÓN 3: PROMOS SEMANALES WINGOOL (MOVIMIENTO INFINITO) */}
      <WeeklyPromos />

      {/* SECCIÓN 4: ESPECIFICACIONES / CARACTERÍSTICAS */}
      <OurSpecs/>
    </div>
  )
}

export default Home