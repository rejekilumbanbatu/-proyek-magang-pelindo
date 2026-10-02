import { useState } from 'react'
import { useAuth } from '../store/auth'
import { useTheme } from '../store/theme'
import { Turnstile } from '@marsidev/react-turnstile'
import { authAPI } from '../services/api'
import { showToast } from '../components/dashboard/Toast'
import VideoBackground from '../components/common/VideoBackground'
import GoogleSignInButton from '../components/common/GoogleSignInButton'

// Penyimpanan kredensial "Ingat saya" (di-obfuscate ringan dengan base64).
const REMEMBER_FLAG = 'spmt_remember'
const REMEMBER_DATA = 'spmt_saved_login'

function readSavedLogin() {
  try {
    if (localStorage.getItem(REMEMBER_FLAG) !== 'on') return null
    const raw = localStorage.getItem(REMEMBER_DATA)
    if (!raw) return null
    return JSON.parse(decodeURIComponent(atob(raw)))
  } catch { return null }
}

export default function LoginPage({ onLogin }) {
  const { login, loginWithToken } = useAuth()
  const { t, lang } = useTheme()

  const saved = readSavedLogin()
  const [form, setForm] = useState({ username: saved?.username || '', password: saved?.password || '', email: '' })
  const [remember, setRemember] = useState(!!saved)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!turnstileToken) {   // Penjelasan untuk bagian catcha
      setError(t.completeCaptcha)
      return
    }
    setError('')
    setLoading(true)

    try {
      await login(form.username, form.password, turnstileToken)
      // Simpan / hapus kredensial sesuai pilihan "Ingat saya"
      if (remember) {
        localStorage.setItem(REMEMBER_FLAG, 'on')
        localStorage.setItem(REMEMBER_DATA, btoa(encodeURIComponent(JSON.stringify({ username: form.username, password: form.password }))))
      } else {
        localStorage.removeItem(REMEMBER_FLAG)
        localStorage.removeItem(REMEMBER_DATA)
      }
      onLogin()
    } catch (err) {
      console.error('[Login Error]:', err)
      setError(err.response?.data?.error || t.loginFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleCredential = async (credential) => {
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.googleLogin({ credential })
      const data = res.data || {}
      if (data.token && data.user) {
        loginWithToken(data.token, data.user)
        onLogin()
      } else if (data.status === 'pending') {
        showToast(data.message || (t.regSuccess || 'Akun Anda menunggu persetujuan admin.'), 'success')
      } else {
        setError(data.message || 'Tidak dapat masuk dengan Google.')
      }
    } catch (err) {
      console.error('[Google Login Error]:', err)
      setError(err.response?.data?.error || 'Login dengan Google gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root} className="login-root">
      <style>{`
        .back-btn-animated {
          animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseGlow 3s infinite;
          transition: all 0.3s ease;
        }
        .back-btn-animated:hover {
          transform: translateX(-5px) scale(1.05);
          box-shadow: 0 0 25px rgba(37, 99, 235, 0.4);
          background: rgba(255, 255, 255, 0.9) !important;
          color: #2563eb !important;
        }

        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(37, 99, 235, 0.2); }
          50% { box-shadow: 0 0 20px rgba(37, 99, 235, 0.5); }
        }

        /* Turnstile (~300px) diperkecil agar tidak overflow di layar sangat sempit */
        @media (max-width: 360px) {
          .login-turnstile { transform: scale(0.82); transform-origin: center; }
        }

        /* Kontras teks input:
           - kosong (placeholder tampil)  → latar putih, teks hitam (placeholder terbaca)
           - sudah diketik                → latar gelap, teks putih (kontras tinggi)
           [type=checkbox] dikecualikan agar "Ingat saya" tidak ikut berubah. */
        .login-card input:not([type="checkbox"]) {
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        .login-card input:not([type="checkbox"]):placeholder-shown {
          background: #ffffff !important;
          color: #0a1b2e !important;
        }
        .login-card input:not([type="checkbox"])::placeholder { color: #5b6b7d; opacity: 1; }
        .login-card input:not([type="checkbox"]):not(:placeholder-shown) {
          background: rgba(8, 22, 40, 0.96) !important;
          color: #ffffff !important;
        }
        .login-card input:focus {
          border-color: #6fd6ff !important;
          box-shadow: 0 0 0 3px rgba(111, 214, 255, 0.20) !important;
        }
        /* Autofill = field punya nilai → samakan dengan keadaan terisi (gelap + teks putih) */
        .login-card input:-webkit-autofill,
        .login-card input:-webkit-autofill:hover,
        .login-card input:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff;
          -webkit-box-shadow: 0 0 0 1000px rgba(8, 22, 40, 0.96) inset;
          transition: background-color 9999s ease-in-out 0s;
          caret-color: #ffffff;
        }

        /* Layout: card di kanan (desktop), tengah di HP */
        .login-root {
          justify-content: flex-end;
          padding: clamp(16px, 4vw, 32px);
          padding-right: clamp(40px, 9vw, 150px);
        }
        .login-bg { background-position: 78% center; }
        .login-scrim { display: block; }
        @media (max-width: 820px) {
          .login-root {
            justify-content: center;
            padding: clamp(16px, 4vw, 32px);
          }
          .login-bg { background-position: center; }
          .login-scrim { display: none; }
        }
      `}</style>

      {/* BACKGROUND: video full-screen dengan loop mulus (crossfade) */}
      <VideoBackground
        src="/images/background/login-bg.mp4"
        poster="/images/background/login-bg-composite.svg"
        fade={0.8}
      />

      <div style={s.overlay} />
      <div style={s.scrim} className="login-scrim" />

      {/* LOGIN CARD */}
      <div style={s.card} className="login-card">

        {/* LOGO */}
        <div style={s.logoWrap}>
          <img
            src="/images/logos/lo.png"
            style={s.logo}
            alt="Pelindo Logo"
          />
        </div>

        <div style={s.welcomeText}>{t.welcome}</div>
        <div style={s.welcomeSub}>{t.signInAccess}</div>

        <form onSubmit={handleSubmit} style={s.form}>
          <input
            id="username"
            name="username"
            autoComplete="username"
            style={s.input}
            type="text"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            placeholder={t.usernamePh}
            required
          />

          <input
            id="password"
            name="password"
            autoComplete="current-password"
            style={s.input}
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder={t.passwordPh}
            required
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '2px' }}>
            <label style={s.rememberRow}>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
                style={s.rememberCheckbox}
              />
              {t.rememberMe || 'Remember me'}
            </label>
          </div>

          <div className="login-turnstile" style={s.turnstileWrap}>
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '3x00000000000000000000FF'}
              options={{ theme: 'light' }}
              onSuccess={(token) => setTurnstileToken(token)}
            />
          </div>

          {error && <div style={s.error}>{error}</div>}

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? t.processing : t.signIn}
          </button>
        </form>

        {import.meta.env.VITE_GOOGLE_CLIENT_ID && (
          <>
            {/* Divider */}
            <div style={s.dividerContainer}>
              <div style={s.dividerLine} />
              <span style={s.dividerText}>
                {lang === 'id' ? 'atau' : (lang === 'zh' ? '或' : (lang === 'ru' ? 'или' : (lang === 'ja' ? 'atau' : 'or')))}
              </span>
              <div style={s.dividerLine} />
            </div>

            {/* Google Sign-in/up Button */}
            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              text="signin_with"
            />
          </>
        )}

      </div>

    </div>
  )
}

const s = {

  root: {
    width: '100%',
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    overflowY: 'auto',
    position: 'relative',
    // Warna dasar (terlihat di balik layer blur saat gambar di-load)
    background: '#1d2f3f'
  },
  // Layer utama: gambar tampil penuh menutupi seluruh layar (cover)
  bgImage: {
    position: 'fixed',
    inset: 0,
    zIndex: 0,
    backgroundImage: 'url(/images/background/login-bg-composite.svg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat'
  },
  backBtn: {
    position: 'absolute',
    top: '60px',
    right: '150px',
    zIndex: 100,
    padding: '15px 30px',
    background: 'rgba(190, 190, 190, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(37, 235, 195, 0.77)',
    borderRadius: '30px',
    color: 'var(--text)',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.1em',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 8px 32px rgba(152, 234, 65, 1)'
  },

  overlay:{
    position:'fixed',
    inset:0,
    // Radial gradient: lighter center glow (accent) fading to a dark premium vignette
    background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(15, 23, 42, 0.75) 100%)',
    zIndex:1
  },

  // Scrim sisi kanan: menambah kontras di belakang card (desktop), disembunyikan di HP
  scrim:{
    position:'fixed',
    inset:0,
    zIndex:1,
    background: 'linear-gradient(90deg, rgba(4,16,30,0) 38%, rgba(4,16,30,0.42) 78%, rgba(4,16,30,0.6) 100%)',
    pointerEvents:'none'
  },

card:{
position:'relative',
zIndex:2,
width:'min(400px, 92vw)',
maxWidth:'90%',
padding:'clamp(24px, 5vw, 40px)',
borderRadius:'14px',
background:'rgba(10, 27, 46, 0.78)',
backdropFilter:'blur(18px)',
border:'1px solid rgba(111, 214, 255, 0.28)',
boxShadow:'0 24px 70px rgba(0, 8, 24, 0.55)',
display:'flex',
flexDirection:'column',
alignItems:'center'
},

logoWrap:{
marginBottom:'20px'
},

logo:{
height:'clamp(90px, 24vw, 130px)',
background:'#ffffff',
padding: '12px 28px',
borderRadius: '12px',
border:'1px solid rgba(111, 214, 255, 0.35)',
boxShadow:'0 8px 26px rgba(0, 8, 24, 0.35)',
objectFit:'contain'
},

welcomeText:{
fontSize:'clamp(20px, 5vw, 24px)',
fontWeight:700,
color:'#eaf4fb'
},

welcomeSub:{
fontSize:'13px',
color:'#9fc1dc',
marginBottom:'25px'
},

form:{
width:'100%',
display:'flex',
flexDirection:'column',
gap:'14px'
},

input:{
width:'100%',
padding:'14px 16px',
borderRadius:'12px',
border:'1px solid rgba(120, 175, 225, 0.45)',
background:'#ffffff',
color:'#0a1b2e',
fontSize: '16px', // >=16px agar iOS tidak auto-zoom saat input difokus
outline:'none',
transition: 'all 0.2s',
boxSizing: 'border-box'
},

btn:{
marginTop:'14px',
padding:'14px',
borderRadius:'8px',
border:'none',
background: 'linear-gradient(135deg, #2f8fe0 0%, #0f4c8a 100%)',
color:'#ffffff',
fontSize: '14px',
fontWeight:800,
letterSpacing: '0.05em',
cursor:'pointer',
boxShadow: '0 6px 18px rgba(31, 111, 224, 0.4)'
},

rememberRow:{
display:'flex',
alignItems:'center',
gap:'8px',
fontSize:'13px',
color:'#cfe3f5',
cursor:'pointer',
userSelect:'none',
marginTop:'2px'
},

rememberCheckbox:{
width:'16px',
height:'16px',
accentColor:'#2f8fe0',
cursor:'pointer',
flexShrink:0
},

turnstileWrap:{
alignSelf:'center',
margin:'10px 0',
maxWidth:'100%',
background:'#ffffff',
borderRadius:'10px',
padding:'8px',
border:'1px solid rgba(111, 214, 255, 0.35)',
boxShadow:'0 4px 14px rgba(0, 8, 24, 0.35)'
},

error:{
color:'#ef4444',
fontSize:'12px'
},

footer:{
marginTop:'18px',
fontSize:'11px',
color:'var(--text-muted)'
},

  brandRow:{
    display: 'none'
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    margin: '16px 0',
    gap: '10px'
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(120, 175, 225, 0.25)'
  },
  dividerText: {
    fontSize: '12px',
    color: '#9fc1dc',
    textTransform: 'lowercase'
  }

}