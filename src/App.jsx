import { useLenis } from './hooks/useLenis.js'
import { LanguageProvider } from './context/LanguageContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import Nav from './components/Nav.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import Checkout from './components/Checkout.jsx'
import Track from './components/Track.jsx'
import Orders from './components/Orders.jsx'
import Auth from './components/Auth.jsx'
import LocationPicker from './components/LocationPicker.jsx'
import CustomerCare from './components/CustomerCare.jsx'
import Hero from './sections/Hero.jsx'
import Highlights from './sections/Highlights.jsx'
import Reviews from './sections/Reviews.jsx'
import Story from './sections/Story.jsx'
import Footer from './sections/Footer.jsx'

const VIDEO = '/ss-win-commercial.mp4'
const BAG = '/ss-win-bag.png'

export default function App() {
  useLenis()

  return (
    <LanguageProvider>
    <CartProvider>
      <main>
        <Nav />
        <Hero videoSrc={VIDEO} />
        <Highlights bagSrc={BAG} />
        <Reviews />
        <Story />
        <Footer />
      </main>
      <CartDrawer />
      <Checkout />
      <Track />
      <Orders />
      <Auth />
      <LocationPicker />
      <CustomerCare />
    </CartProvider>
    </LanguageProvider>
  )
}
