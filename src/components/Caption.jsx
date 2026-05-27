// A caption that fades in while scroll progress is within [from, to].
export default function Caption({ progress, from, to, main, sub, tamil }) {
  const active = progress >= from && progress <= to
  return (
    <div className={`caption${active ? ' is-active' : ''}`}>
      <div className={`caption__main${tamil ? ' tamil' : ''}`}>{main}</div>
      {sub && <div className="caption__sub">{sub}</div>}
    </div>
  )
}
