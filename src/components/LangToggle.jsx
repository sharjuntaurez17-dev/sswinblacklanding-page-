import { useLang } from '../context/LanguageContext.jsx'

// English / தமிழ் language toggle. Same sliding-pill mechanism as the supplied
// design, re-skinned to the SS Win black/gold palette and sized for the nav.
export default function LangToggle() {
  const { lang, setLang } = useLang()
  const isTa = lang === 'ta'

  return (
    <div className={`lang-toggle ${isTa ? 'ta-active' : 'en-active'}`} role="group" aria-label="Website language">
      <div className="lang-toggle__track">
        <div className="lang-toggle__slider" />
        <button
          type="button"
          className="lang-toggle__btn lang-toggle__btn--en"
          aria-pressed={!isTa}
          onClick={() => setLang('en')}
        >EN</button>
        <button
          type="button"
          className="lang-toggle__btn lang-toggle__btn--ta"
          aria-pressed={isTa}
          onClick={() => setLang('ta')}
        >த</button>
      </div>
    </div>
  )
}
