import { useLang } from '../context/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="footer" id="contact">
      <div className="footer__mark">
        MUTHU WIN <span className="dot">·</span> SS <span className="dot">·</span> KANGAYAM
      </div>
      <p className="footer__tag">{t('ft.tag')}</p>
      <p className="footer__contact tamil">முத்து வின் எஸ்.எஸ் கங்கயம் அரிசி</p>
      <p className="footer__legal">© {new Date().getFullYear()} MUTHU WIN SS · {t('ft.legal')}</p>
    </footer>
  )
}
