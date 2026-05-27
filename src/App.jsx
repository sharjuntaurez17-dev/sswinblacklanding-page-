import { useLenis } from './hooks/useLenis.js'
import Hero from './sections/Hero.jsx'
import ScrubStory from './sections/ScrubStory.jsx'
import Highlights from './sections/Highlights.jsx'
import Story from './sections/Story.jsx'
import Footer from './sections/Footer.jsx'

const VIDEO = '/ss-win-commercial.mp4'
const BAG = '/ss-win-bag.png'

export default function App() {
  useLenis()

  return (
    <main>
      <Hero videoSrc={VIDEO} />
      <ScrubStory videoSrc={VIDEO} poster={BAG} />
      <Highlights bagSrc={BAG} />
      <Story />
      <Footer />
    </main>
  )
}
