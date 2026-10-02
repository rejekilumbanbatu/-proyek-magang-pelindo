import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../store/auth'
import { useTheme } from '../../store/theme'
import NotificationBell from './NotificationBell'
import MetricDetailModal from './MetricDetailModal'
import { publicAPI } from '../../services/api'

const fmtSLA = v => v == null ? '0.00' : Number(v).toFixed(2)
const DROPDOWN_ID = 'profile-dd'
const LOCALE_MAP = { id: 'id-ID', en: 'en-US', zh: 'zh-CN', ja: 'ja-JP', ru: 'ru-RU' }

function ProfileDropdown({ user, avatar, onProfile, onLogout, onSettings, onAbout, onClose, rect, telegramLink }) {
  if (!rect) return null
  const { themeId, setTheme, THEME_OPTIONS, t } = useTheme()
  const rc = { superadmin: '#7c3aed', admin: '#3b82f6', adminpelindo: '#10b981', viewer: '#64748b' }[user?.role] || '#64748b'
  const rl = { superadmin: 'SuperAdmin', admin: 'Admin', adminpelindo: 'Admin Pelindo', viewer: 'Viewer' }[user?.role] || 'User'

  const lightThemes = THEME_OPTIONS.filter(t => t.dark === false)
  const darkThemes = THEME_OPTIONS.filter(t => t.dark === true)

  return createPortal(
    <div id={DROPDOWN_ID} style={{
      position: 'fixed', top: rect.bottom + 8, right: window.innerWidth - rect.right, width: 280,
      background: 'var(--bg-card)', backdropFilter: 'blur(24px)', border: '1px solid var(--border)',
      borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.3)', zIndex: 99995, overflow: 'hidden', animation: 'fadeIn 0.15s ease'
    }}>

      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'var(--accent-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatar ? 'transparent' : `linear-gradient(135deg,${rc}22,${rc}44)`, border: `2px solid ${rc}88`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: rc, overflow: 'hidden' }}>
            {avatar ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (user?.username || '?')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>{user?.username}</div>
            <div style={{ fontSize: 11, color: rc, fontWeight: 700, letterSpacing: '0.05em' }}>{rl.toUpperCase()}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px' }}>
        {[{ icon: '👤', label: t.profile, action: onProfile }, { icon: '⚙️', label: t.settings, action: onSettings }, { icon: 'ℹ️', label: t.about, action: onAbout }].map(item => (
          <button key={item.label} onClick={() => { item.action(); onClose() }}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)', fontSize: 14, fontWeight: 600, borderRadius: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>{item.label}
          </button>
        ))}
        <button 
          title={t.telegramJoinTooltip || "Gabung ke grup Telegram untuk mendapatkan notifikasi real-time"}
          onClick={() => {
            window.open(telegramLink || 'https://t.me/spmt_monitoring_group', '_blank', 'noopener,noreferrer');
            onClose();
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--text)', fontSize: 14, fontWeight: 600, borderRadius: 8, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="#229ED9" style={{ flexShrink: 0 }}><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.62.15-.15 2.7-2.48 2.75-2.7.01-.03.01-.14-.06-.2-.07-.06-.17-.04-.25-.02-.11.02-1.78 1.14-5.06 3.35-.48.33-.91.49-1.3.48-.43-.01-1.26-.24-1.88-.45-.76-.25-1.37-.39-1.31-.83.03-.23.35-.46.96-.7 3.76-1.63 6.27-2.7 7.54-3.21 3.58-1.43 4.32-1.68 4.81-1.69.11 0 .35.03.5.15.13.1.16.24.18.33.02.1.04.31.02.47z"/></svg>Telegram
        </button>
        <div style={{ height: 1, background: 'var(--border)', margin: '4px 8px' }} />
        <button onClick={() => { onLogout(); onClose() }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--offline)', fontSize: 14, fontWeight: 700, borderRadius: 8, transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
          <span style={{ fontSize: 16 }}>🚪</span>{t.logout}
        </button>
      </div>
    </div>,
    document.body
  )
}

export default function TopBar({
  summary, activeNav, onNavChange, onLogout,
  websites, notifications, onMarkRead, onMarkAllRead, navItems = ['dashboard', 'websites', 'activity-log'], onNavigate,
  isTvMode, onToggleTvMode, onProfile, onSettings, onAbout, onOpenDetail, pendingCount = 0
}) {
  const { user } = useAuth()
  const { themeId, setTheme, t, lang } = useTheme()
  const locale = LOCALE_MAP[lang] || 'en-US'
  const [clock, setClock] = useState(new Date())
  const [showLogout, setShowLogout] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showTheme, setShowTheme] = useState(false)
  const [profileRect, setProfileRect] = useState(null)
  const [activeMetric, setActiveMetric] = useState(null)
  const [hoveredMetric, setHoveredMetric] = useState(null)
  const [hoveredNav, setHoveredNav] = useState(null)
  const [isClockHovered, setIsClockHovered] = useState(false)
  const [avatar, setAvatar] = useState(() => localStorage.getItem(`spmt_avatar_${user?.username}`) || null)
  const profileRef = useRef(null)
  const [telegramLink, setTelegramLink] = useState('https://t.me/spmt_monitoring_group')

  useEffect(() => {
    let active = true
    publicAPI.getTelegramLink()
      .then(res => {
        if (active && res.data && res.data.link) {
          setTelegramLink(res.data.link)
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    const h = () => setAvatar(localStorage.getItem(`spmt_avatar_${user?.username}`) || null)
    window.addEventListener('AvatarUpdated', h)
    return () => window.removeEventListener('AvatarUpdated', h)
  }, [user?.username])

  useEffect(() => { const iv = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(iv) }, [])
  useEffect(() => {
    const h = (e) => {
      if (profileRef.current && profileRef.current.contains(e.target)) return
      const dd = document.getElementById(DROPDOWN_ID)
      if (dd && dd.contains(e.target)) return
      setShowProfile(false)
    }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])

  const alertCount = summary?.active_alerts ?? 0
  const onlineCount = websites.filter(w => w.status === 'ONLINE').length
  const warningCount = websites.filter(w => w.status === 'WARNING').length
  const criticalCount = websites.filter(w => w.status === 'CRITICAL').length
  const offlineCount = websites.filter(w => w.status === 'OFFLINE').length
  const unknownCount = websites.filter(w => !w.status || w.status === 'UNKNOWN').length
  const totalCount = websites.length

  const metrics = [
    { id: 'online', label: t?.online || 'ONLINE', value: onlineCount, color: '#10b981' },
    { id: 'critical', label: t?.critical || 'CRITICAL', value: criticalCount + warningCount, color: '#d97706' },
    { id: 'offline', label: t?.offline || 'OFFLINE', value: offlineCount, color: '#ef4444' },
    { id: 'sla', label: 'SLA', value: `${fmtSLA(summary?.sla_percent)}%`, color: '#0ea5e9' },
    { id: 'total', label: t?.total || 'TOTAL', value: totalCount, color: '#64748b' },
    { id: 'avg-rt', label: t?.avgRt || 'AVG RT', value: `${Math.round(summary?.avg_response_time ?? 0)}ms`, color: '#8b5cf6' },
  ]

  const slaPct = Number(summary?.sla_percent || 100);

  const rc = { superadmin: '#8b5cf6', admin: '#3b82f6', adminpelindo: '#10b981', viewer: '#64748b' }[user?.role] || '#64748b'
  const rl = { superadmin: 'SA', admin: 'AD', adminpelindo: 'AP', viewer: 'VW' }[user?.role] || '??'
  const navIcon = tab => {
    if (tab === 'dashboard') return '📊'
    if (tab === 'websites') return '🌐'
    if (tab === 'incidents') return '🚨'
    if (tab === 'activity-log') return '📋'
    if (tab === 'notifications') return '🔔'
    if (tab === 'users') return '👥'
    return '📄'
  }
  const navTitle = tab => {
    if (tab === 'dashboard') return t?.dashboard || 'Dashboard'
    if (tab === 'websites') return t?.websites || 'Websites'
    if (tab === 'incidents') return t?.incidents || 'Incident Center'
    if (tab === 'activity-log') return t?.activity || 'Activity'
    if (tab === 'notifications') return t?.notifications || 'Notifications'
    if (tab === 'users') return t?.users || 'Users'
    return tab
  }

  return (
    <>
      <div className="topbar" style={{
        display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
        padding: '0 24px', height: '72px !important', minHeight: '72px', position: 'relative', zIndex: 100,
        borderBottom: '1px solid var(--border)', background: 'var(--bg-header)'
      }}>

        {/* ── BRANDING SECTION (Logo Only) ── */}
        <div className="topbar-branding" style={{ display: 'flex', alignItems: 'center', height: '100%', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(10px)',
            padding: '6px 14px', borderRadius: '12px',
            border: '1px solid var(--border)', boxShadow: 'var(--shadow)'
          }}>
            <img src="/images/logos/lo.png" alt="Logo"
              style={{ height: 48, width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(0, 31, 63, 0.1))' }} />
          </div>
        </div>

        {/* ── METRICS SECTION (Single Row) ──
            Rendered only on the dashboard so other pages don't reserve an empty
            metrics row (matters on phones, where it wraps to its own line). */}
        {activeNav === 'dashboard' && (
        <div className="topbar-metrics" style={{
          display: 'flex',
          flexWrap: 'nowrap',
          gap: '8px'
        }}>
          {metrics.map(m => {
            const active = activeMetric === m.id
            const isAlert = (m.id === 'alerts') && m.value > 0
            const isDark = themeId === 'theme-dark'

            // Generate clean class names for each metric type using the stable id
            const statusClass = m.id;

            return (
              <div key={m.id} title={`${t?.detail || 'Detail'} ${m.label}`}
                className={`metric-card m-${statusClass} hover-float`}
                onMouseEnter={() => setHoveredMetric(m.id)}
                onMouseLeave={() => setHoveredMetric(null)}
                style={{
                  cursor: 'pointer', userSelect: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: active ? m.color : (isDark ? m.color : `${m.color}22`),
                  borderColor: m.color,
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  minWidth: 0,
                  width: '100%',
                  color: isDark ? '#000000' : (active ? '#ffffff' : m.color),
                  textShadow: 'none',
                  borderRadius: 8,
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  position: 'relative',
                  zIndex: hoveredMetric === m.id ? 100 : 1
                }}
                onClick={() => setActiveMetric(active ? null : m.id)}>

                {/* Bubble Animation */}
                {hoveredMetric === m.id && (
                  <div className="bubble-wrap">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bubble-anim" style={{
                        left: `${Math.random() * 80 + 10}%`,
                        width: `${Math.random() * 10 + 4}px`,
                        height: `${Math.random() * 10 + 4}px`,
                        animationDelay: `${Math.random() * 1}s`
                      }} />
                    ))}
                  </div>
                )}

                {isAlert && <span style={{ position: 'absolute', top: 1, right: 2, width: 4, height: 4, borderRadius: '50%', background: '#ff4d4f', animation: 'pulse 1s infinite' }} />}

                <span style={{ fontSize: '28px', fontWeight: 900, lineHeight: 1, marginBottom: 2 }}>{m.value}</span>
                <span style={{ fontSize: '11px', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase', opacity: 0.9 }}>{m.label}</span>
              </div>
            )
          })}
        </div>
        )}

        {/* ── NAVIGATION SECTION (Pill Style) ── */}
        <div className="topbar-nav-container" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          <div className="topbar-nav" style={{
            display: 'flex', gap: 1, background: '#24411762',
            borderRadius: '25px', padding: '4px', height: '54px', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(53, 188, 218, 0.73)'
          }}>
            {navItems.map(tab => (
              <button key={tab} title={navTitle(tab)}
                className={`nav-btn-custom ${activeNav === tab ? 'active' : ''}`}
                onMouseEnter={() => setHoveredNav(tab)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  background: activeNav === tab ? 'var(--primary)' : 'transparent',
                  border: 'none',
                  color: activeNav === tab ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: '22px', padding: '0 20px', borderRadius: '20px',
                  cursor: 'pointer', height: '100%', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  transform: hoveredNav === tab ? 'scale(1.2) translateY(-5px)' : 'scale(1)'
                }}
                onClick={() => onNavChange(tab)}>
                {navIcon(tab)}
                <span className="nav-label">{navTitle(tab)}</span>
                {tab === 'users' && pendingCount > 0 && (
                  <span title={`${pendingCount} registrasi menunggu konfirmasi`} style={{
                    position: 'absolute', top: 2, right: 2, minWidth: 18, height: 18, padding: '0 5px',
                    borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--bg-header)', boxShadow: '0 0 8px rgba(239,68,68,0.7)'
                  }}>
                    {pendingCount > 9 ? '9+' : pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>



        {/* Actions */}
        <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={onToggleTvMode} title={isTvMode ? t.exitFullScreen : t.enterFullScreen}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.boxShadow = '0 0 10px var(--accent)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--accent-light)', backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)', color: 'var(--primary)',
              cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0
            }}>
            {isTvMode ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
              </svg>
            )}
          </button>

          <NotificationBell notifications={notifications} onMarkRead={onMarkRead} onMarkAllRead={onMarkAllRead} onNavigate={onNavigate} />

          <div
            onMouseEnter={() => setIsClockHovered(true)}
            onMouseLeave={() => setIsClockHovered(false)}
            className="hover-float topbar-clock"
            style={{ flexShrink: 0, padding: '0 24px', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '160px', transition: 'all 0.3s ease' }}>
            <div className={`topbar-clock-time ${isClockHovered ? 'rainbow-text' : ''}`} style={{ color: 'var(--primary)', fontSize: '32px', fontWeight: 900, fontFamily: '"Inter", sans-serif', letterSpacing: '0.02em', lineHeight: 1.1, fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s' }}>
              {clock.toLocaleTimeString(locale, { hour12: false })}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', marginTop: 2, textTransform: 'uppercase' }}>
              {clock.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
          </div>

          {/* Profile avatar */}
          <div ref={profileRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={() => { setShowProfile(v => !v); if (profileRef.current) setProfileRect(profileRef.current.getBoundingClientRect()) }}
              className="hover-glow"
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--accent-light)', border: `1px solid var(--border)`, borderRadius: 25, padding: '6px 16px 6px 6px', cursor: 'pointer' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatar ? 'transparent' : `linear-gradient(135deg,${rc}22,${rc}44)`, border: `2px solid ${rc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: rc, flexShrink: 0, overflow: 'hidden' }}>
                {avatar ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : (user?.username || '?')[0].toUpperCase()}
              </div>
              <div className="topbar-username" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: 0 }}>
                <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</span>
              </div>
              <span className="topbar-username" style={{ color: 'var(--text-muted)', fontSize: 12 }}>▾</span>
            </button>
            {showProfile && <ProfileDropdown user={user} avatar={avatar} rect={profileRect} onProfile={onProfile} onLogout={onLogout} onSettings={onSettings} onAbout={onAbout} onClose={() => setShowProfile(false)} telegramLink={telegramLink} />}
          </div>
        </div>
      </div>

      {activeMetric && <MetricDetailModal type={activeMetric} websites={websites} summary={summary} onOpenDetail={onOpenDetail} onClose={() => setActiveMetric(null)} />}
    </>
  )
}
