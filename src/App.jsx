import { useLenis } from './hooks/useLenis.js'
import Nav from './components/Nav.jsx'
import Hero from './sections/Hero.jsx'
import ScrubStory from './sections/ScrubStory.jsx'
import Highlights from './sections/Highlights.jsx'
import Story from './sections/Story.jsx'
import Order from './sections/Order.jsx'
import Footer from './sections/Footer.jsx'

const VIDEO = '/ss-win-commercial.mp4'
const BAG = '/ss-win-bag.png'

export default function App() {
  useLenis()

  return (
    <main>
      <Nav />
      <Hero videoSrc={VIDEO} />
      <ScrubStory videoSrc={VIDEO} poster={BAG} />
      <Highlights bagSrc={BAG} />
      <Story />
      <Order bagSrc={BAG} />
      <Footer />
    </main>
  )
}
