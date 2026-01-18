import BestSelling from "../Components/Home/BestSelling"
import Hero from "../Components/Home/Hero"
import OurSpecs from "../Components/Home/OurSpecs"

const Home = () => {
  return (
    // Agregamos padding-top equivalente a la altura del navbar (por ejemplo 20 = 5rem)
    <div className="pt-16">
      <Hero/>
      <BestSelling/>
      <OurSpecs/>
    </div>
  )
}

export default Home
