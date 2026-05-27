export default function Hero({ videoSrc }) {
  return (
    <header className="hero" id="home">
      <video className="hero__bg" src={videoSrc} muted playsInline autoPlay loop preload="auto" />
      <div className="hero__veil" />
    </header>
  )
}
