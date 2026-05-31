import { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react'
import { DICT } from '../lib/i18n.js'

const LanguageContext = createContext(null)
const KEY = 'sswin.lang.v1'

function readLang() {
  try {
    const s = localStorage.getItem(KEY)
    return s === 'ta' || s === 'en' ? s : 'en'
  } catch { return 'en' }
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readLang)

  // Persist + reflect on <html lang> for accessibility.
  useEffect(() => {
    try { localStorage.setItem(KEY, lang) } catch {}
    document.documentElement.lang = lang
    document.documentElement.classList.toggle('lang-ta', lang === 'ta')
  }, [lang])

  const setLang = useCallback((l) => setLangState(l === 'ta' ? 'ta' : 'en'), [])
  const toggle = useCallback(() => setLangState((l) => (l === 'en' ? 'ta' : 'en')), [])

  // t(key) -> translated string, falling back to English, then the key itself.
  const t = useCallback(
    (key) => {
      const table = DICT[lang] || DICT.en
      return table[key] ?? DICT.en[key] ?? key
    },
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, toggle, t }), [lang, setLang, toggle, t])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLang = () => useContext(LanguageContext)
