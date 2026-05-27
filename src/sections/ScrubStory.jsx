import { useRef, useState } from 'react'
import ScrubVideo from '../components/ScrubVideo.jsx'
import Caption from '../components/Caption.jsx'

export default function ScrubStory({ videoSrc, poster }) {
  const trigger = useRef(null)
  const [progress, setProgress] = useState(0)

  return (
    <section className="scrub" ref={trigger} style={{ height: '400vh' }}>
      <div className="scrub__stage">
        <ScrubVideo src={videoSrc} poster={poster} triggerRef={trigger} onProgress={setProgress} />
        <div className="scrub__captions">
          <Caption progress={progress} from={0.1} to={0.32}
            main="Premium Quality Sortex Rice" sub="MULTI-STAGE COLOR SORTED" />
          <Caption progress={progress} from={0.4} to={0.62} tamil
            main="நெய் கிச்சடி பொன்னி அரிசி" sub="GHEE KICHADI PONNI RICE" />
          <Caption progress={progress} from={0.7} to={0.95}
            main="Naturally Rich" sub="இயற்கையாக சத்தானது" />
        </div>
      </div>
    </section>
  )
}
