import { useRef } from 'react'
import ScrubVideo from '../components/ScrubVideo.jsx'

export default function ScrubStory({ videoSrc, poster }) {
  const trigger = useRef(null)

  return (
    <section className="scrub" ref={trigger} style={{ height: '400vh' }}>
      <div className="scrub__stage">
        <ScrubVideo src={videoSrc} poster={poster} triggerRef={trigger} />
      </div>
    </section>
  )
}
