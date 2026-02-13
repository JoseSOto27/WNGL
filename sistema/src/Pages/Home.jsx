import BestSelling from "../Components/Home/BestSelling"
import Hero from "../Components/Home/Hero"
import OurSpecs from "../Components/Home/OurSpecs"
import WeeklyPromos from "../Components/Home/WeeklyPromos";
// 1. Importamos el scouting de sabores
import FlavorScouting from "../Components/Home/FlavorScouting";

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

      {/* SECCIÓN 4: SCOUTING DE SABORES (Nivel de picor y animaciones) */}
      <FlavorScouting />

      {/* SECCIÓN 5: ESPECIFICACIONES / CARACTERÍSTICAS */}
      <OurSpecs/>
    </div>
  )
}

export default Home