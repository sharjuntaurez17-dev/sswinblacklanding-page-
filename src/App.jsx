import { useLenis } from './hooks/useLenis.js'
import { CartProvider } from './context/CartContext.jsx'
import Nav from './components/Nav.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Hero from './sections/Hero.jsx'
import Highlights from './sections/Highlights.jsx'
import Story from './sections/Story.jsx'
import Order from './sections/Order.jsx'
import Footer from './sections/Footer.jsx'

const VIDEO = '/ss-win-commercial.mp4'
const BAG = '/ss-win-bag.png'

export default function App() {
  useLenis()

  return (
    <CartProvider>
      <main>
        <Nav />
        <Hero videoSrc={VIDEO} />
        <Highlights bagSrc={BAG} />
        <Story />
        <Order bagSrc={BAG} />
        <Footer />
      </main>
      <CartDrawer />
    </CartProvider>
  )
}
