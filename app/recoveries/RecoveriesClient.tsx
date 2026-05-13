'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '../lib/supabase'
import {
  RefreshCw, CalendarCheck, MessageCircle, PhoneIncoming,
  PhoneMissed, RotateCcw, PhoneOff
} from 'lucide-react'

const SUBMARK = `M34.4958 0.0112218H34.4509C15.3486 0.0112218 0 15.6376 0 34.406C0 35.0092 0.0224436 35.6067 0.0589144 36.2071C6.56755 33.4999 11.7127 32.4282 17.9941 31.5304L18.0671 31.6062C12.8714 35.0288 6.27579 41.4449 3.31043 49.9482C5.95036 54.8072 9.05599 58.5385 13.0594 61.5459C13.8814 45.8915 26.6293 30.1249 45.2659 26.7303L45.2379 26.6125H3.54889C8.43598 18.3196 16.4343 12.4169 27.5804 12.4169C41.5515 12.4169 52.7508 23.7874 52.7508 37.997C52.7508 51.8391 40.968 65.179 25.2462 64.9938C21.7198 64.9489 19.1332 64.5478 15.4019 63.2011C21.097 67.2831 26.8089 68.9579 33.8758 68.9579C52.4787 68.9579 69 53.7075 69 34.2826C69 15.5282 53.3119 0 34.521 0L34.4958 0.0112218Z`

function formatDate(ts: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

function formatTime(ms: number) {
  if (!ms) return '—'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function callTypeInfo(type: string) {
  if (type === 'repeated') return { label: 'Repeated Caller', color: '#a855f7', icon: <RotateCcw size={14} color="#a855f7" /> }
  if (type === 'no_answer') return { label: 'No Answer', color: '#fbbf24', icon: <PhoneMissed size={14} color="#fbbf24" /> }
  if (type === 'dropped') return { label: 'Dropped Call', color: '#f87171', icon: <PhoneOff size={14} color="#f87171" /> }
  return { label: type, color: '#94a3b8', icon: <PhoneMissed size={14} color="#94a3b8" /> }
}

export default function RecoveriesClient({ recoveries, calls, clinic }: {
  recoveries: any[]
  calls: any[]
  clinic: any
}) {
  const pathname = usePathname()
  const [selectedCall, setSelectedCall] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const supabaseClient = createBrowserSupabaseClient()

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = '/login'
  }

  function getMatchingCall(recovery: any) {
    return calls.find(c => c.to_number === recovery.from_number)
  }

  const totalRecoveries = recoveries.length
  const successfulRecoveries = recoveries.filter(r => {
    const call = getMatchingCall(r)
    return call?.appointment_booked_ai === true
  }).length
  const recoveryRate = totalRecoveries > 0
    ? Math.round(successfulRecoveries / totalRecoveries * 100)
    : 0

  return (
  <div className="db-root">
    <div className="page-bg"><div className="page-bg-mid" /></div>
    <nav className="db-topnav">
        <div className="db-logo">
          <svg width="20" height="20" viewBox="0 0 69 69" fill="none">
            <path d={SUBMARK} fill="#8942F0" />
          </svg>
          <span className="db-logo-text">CLARIVE AI</span>
        </div>
        <a className={`db-navlink ${pathname === '/' ? 'active' : ''}`} href="/">Overview</a>
        <a className={`db-navlink ${pathname === '/calls' ? 'active' : ''}`} href="/calls">Calls</a>
        <a className={`db-navlink ${pathname === '/recoveries' ? 'active' : ''}`} href="/recoveries">Recoveries</a>
        <a className={`db-navlink ${pathname === '/reports' ? 'active' : ''}`} href="/reports">Reports</a>
        <div className="db-spacer" />
        <div className="db-nav-right">
          <div className="db-clinic-pill">
            <span className="db-live-dot" />
            {clinic?.name ?? 'Dashboard'}
          </div>
          <a className="db-nav-btn" href="/settings" style={{ textDecoration: 'none' }}>Settings</a>
          <button className="db-nav-btn logout" onClick={handleLogout}>Log out</button>
        </div>
        <button className="db-hamburger db-nav-btn" onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
            <rect width="16" height="1.5" rx="0.75" fill="currentColor"/>
            <rect y="5.25" width="16" height="1.5" rx="0.75" fill="currentColor"/>
            <rect y="10.5" width="16" height="1.5" rx="0.75" fill="currentColor"/>
          </svg>
        </button>
      </nav>
      {menuOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={() => setMenuOpen(false)} />
          <div className="db-mobile-menu">
            <a className="db-mobile-menu-item" href="/" onClick={() => setMenuOpen(false)}>Overview</a>
            <a className="db-mobile-menu-item" href="/calls" onClick={() => setMenuOpen(false)}>Calls</a>
            <a className="db-mobile-menu-item" href="/recoveries" onClick={() => setMenuOpen(false)}>Recoveries</a>
            <a className="db-mobile-menu-item" href="/reports" onClick={() => setMenuOpen(false)}>Reports</a>
            <a className="db-mobile-menu-item" href="/settings" onClick={() => setMenuOpen(false)}>Settings</a>
            <button className="db-mobile-menu-item" style={{ color: 'rgba(248,113,113,0.7)' }} onClick={() => { setMenuOpen(false); handleLogout() }}>Log out</button>
          </div>
        </>
      )}

      <div className="db-subnav">
        <div className="db-page-title">Recoveries</div>
        <div className="db-controls">
          <div className="rec-stat">
            <span className="rec-stat-val">{totalRecoveries}</span>
            <span className="rec-stat-label">Total attempts</span>
          </div>
          <div className="rec-stat">
            <span className="rec-stat-val" style={{ color: '#4ade80' }}>{successfulRecoveries}</span>
            <span className="rec-stat-label">Appointments booked</span>
          </div>
          <div className="rec-stat">
            <span className="rec-stat-val" style={{ color: '#a855f7' }}>{recoveryRate}%</span>
            <span className="rec-stat-label">Recovery rate</span>
          </div>
        </div>
      </div>

      <div className="db-content">
        <div className="db-panel">
          <div className="db-panel-head">
            <div className="db-panel-title">Recovery Attempts</div>
          </div>

          {recoveries.length === 0 ? (
            <div className="db-empty">No recovery attempts yet</div>
          ) : (
            recoveries.map((recovery: any) => {
              const matchedCall = getMatchingCall(recovery)
              const typeInfo = callTypeInfo(recovery.call_type)
              const booked = matchedCall?.appointment_booked_ai === true
              const faq = matchedCall?.faq_only === true
              const sentiment = matchedCall?.user_sentiment

              return (
                <div
                  key={recovery.id}
                  className="db-call"
                  onClick={() => matchedCall && setSelectedCall(matchedCall)}
                  style={{ cursor: matchedCall ? 'pointer' : 'default' }}
                >
                  <div className="db-call-ico ico-recovery">
                    <RefreshCw size={15} color="#22d3ee" />
                  </div>
                  <div className="db-call-body">
                    <div className="db-call-sum">
                      {matchedCall?.call_summary ?? `Recovery call to ${recovery.from_number}`}
                    </div>
                    <div className="db-call-met" style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                      {recovery.from_number}
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: typeInfo.color }}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      {matchedCall?.duration_ms && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span> {formatTime(matchedCall.duration_ms)}</>}
                      {sentiment && <><span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span> <span className={`sent-${sentiment.toLowerCase()}`}>{sentiment}</span></>}
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                      {formatDate(recovery.recovery_triggered_at)}
                    </div>
                  </div>
                  <div>
                    {booked
                      ? <span className="db-badge badge-booked">Booked</span>
                      : faq
                      ? <span className="db-badge badge-faq">FAQ</span>
                      : matchedCall
                      ? <span className="db-badge badge-success">Answered</span>
                      : <span className="db-badge badge-unknown">Pending</span>
                    }
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {selectedCall && (
        <div className="db-modal-overlay" onClick={() => setSelectedCall(null)}>
          <div className="db-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="db-modal-head">
              <div>
                <div className="db-badge badge-recovery" style={{ marginBottom: 8 }}>Recovery Call</div>
                <div className="db-modal-title">Recovery Call Detail</div>
              </div>
              <button className="db-modal-close" onClick={() => setSelectedCall(null)}>✕</button>
            </div>
            <div className="db-modal-body">
              <div className="db-modal-section">
                <div className="db-modal-label">Summary</div>
                <div className="db-modal-text">{selectedCall.call_summary ?? 'No summary available'}</div>
              </div>
              <div className="db-modal-grid">
                <div><div className="db-modal-label">Called</div><div className="db-modal-val">{selectedCall.to_number}</div></div>
                <div><div className="db-modal-label">Duration</div><div className="db-modal-val">{formatTime(selectedCall.duration_ms)}</div></div>
                <div><div className="db-modal-label">Sentiment</div><div className={`db-modal-val sent-${(selectedCall.user_sentiment ?? '').toLowerCase()}`}>{selectedCall.user_sentiment ?? '—'}</div></div>
                <div><div className="db-modal-label">Status</div><div className="db-modal-val">{selectedCall.call_status ?? '—'}</div></div>
                <div><div className="db-modal-label">Time</div><div className="db-modal-val">{formatDate(selectedCall.created_at)}</div></div>
                <div><div className="db-modal-label">Direction</div><div className="db-modal-val">{selectedCall.direction ?? '—'}</div></div>
              </div>
              {selectedCall.recording_url && (
                <div className="db-modal-section">
                  <div className="db-modal-label">Recording</div>
                  <audio controls src={selectedCall.recording_url} className="db-audio" preload="none" />
                </div>
              )}
              <div className="db-modal-flags">
                {selectedCall.appointment_booked_ai && <span className="db-flag flag-green">Appointment Booked</span>}
                {selectedCall.high_value_lead_ai && <span className="db-flag flag-purple">High Value Lead</span>}
                {selectedCall.faq_only && <span className="db-flag flag-blue">FAQ Only</span>}
                {selectedCall.new_patient && <span className="db-flag flag-blue">New Patient</span>}
                {selectedCall.callback_requested && <span className="db-flag flag-yellow">Callback Requested</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}