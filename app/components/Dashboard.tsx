'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '../lib/supabase'
import {
  AlertCircle, Star, CalendarCheck, PhoneCall, MessageCircle,
  RefreshCw, PhoneMissed, PhoneIncoming, AlertTriangle, UserPlus,
  PhoneOff, HelpCircle
} from 'lucide-react'

const SUBMARK = `M34.4958 0.0112218H34.4509C15.3486 0.0112218 0 15.6376 0 34.406C0 35.0092 0.0224436 35.6067 0.0589144 36.2071C6.56755 33.4999 11.7127 32.4282 17.9941 31.5304L18.0671 31.6062C12.8714 35.0288 6.27579 41.4449 3.31043 49.9482C5.95036 54.8072 9.05599 58.5385 13.0594 61.5459C13.8814 45.8915 26.6293 30.1249 45.2659 26.7303L45.2379 26.6125H3.54889C8.43598 18.3196 16.4343 12.4169 27.5804 12.4169C41.5515 12.4169 52.7508 23.7874 52.7508 37.997C52.7508 51.8391 40.968 65.179 25.2462 64.9938C21.7198 64.9489 19.1332 64.5478 15.4019 63.2011C21.097 67.2831 26.8089 68.9579 33.8758 68.9579C52.4787 68.9579 69 53.7075 69 34.2826C69 15.5282 53.3119 0 34.521 0L34.4958 0.0112218Z`

function formatTime(ms: number) {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

function formatDate(ts: number) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

function classifyCall(call: any) {
  if (call.direction === 'outbound') return { label: 'Recovery Call', cls: 'recovery', filter: 'recovery' }
  if (call.emergency_call === true) return { label: 'Emergency', cls: 'emergency', filter: 'emergency' }
  if (call.high_value_lead_ai === true) return { label: 'High Value Lead', cls: 'high-value', filter: 'highvalue' }
  if (call.appointment_booked_ai === true) return { label: 'Booked', cls: 'booked', filter: 'booked' }
  if (call.callback_requested === true) return { label: 'Callback Needed', cls: 'callback', filter: 'callback' }
  if (call.faq_only === true) return { label: 'FAQ', cls: 'faq', filter: 'faq' }
  if (call.wrong_number === true) return { label: 'Wrong Number', cls: 'unknown', filter: 'other' }
  if (call.call_successful === true) return { label: 'Resolved', cls: 'success', filter: 'resolved' }
  if (call.call_successful === false) return { label: 'Missed', cls: 'missed', filter: 'missed' }
  return { label: 'Unclassified', cls: 'unknown', filter: 'other' }
}

function CallIcon({ cls }: { cls: string }) {
  const size = 15
  if (cls === 'emergency') return <AlertCircle size={size} color="#f87171" />
  if (cls === 'high-value') return <Star size={size} color="#a855f7" />
  if (cls === 'booked') return <CalendarCheck size={size} color="#4ade80" />
  if (cls === 'callback') return <PhoneCall size={size} color="#fbbf24" />
  if (cls === 'faq') return <MessageCircle size={size} color="#60a5fa" />
  if (cls === 'recovery') return <RefreshCw size={size} color="#22d3ee" />
  if (cls === 'missed') return <PhoneMissed size={size} color="#f87171" />
  if (cls === 'success') return <PhoneIncoming size={size} color="#4ade80" />
  if (cls === 'unknown') return <HelpCircle size={size} color="#94a3b8" />
  return <PhoneIncoming size={size} color="#94a3b8" />
}

const DATE_FILTERS = ['Today', '7 days', '28 days', 'All time']

const CALL_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'emergency', label: 'Emergency' },
  { key: 'booked', label: 'Booked' },
  { key: 'highvalue', label: 'High Value' },
  { key: 'faq', label: 'FAQ' },
  { key: 'callback', label: 'Callback' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'missed', label: 'Missed' },
  { key: 'recovery', label: 'Recovery' },
]

const DATE_MS: Record<string, number> = {
  'Today': 86400000,
  '7 days': 7 * 86400000,
  '28 days': 28 * 86400000,
  'All time': Infinity,
}

export default function Dashboard({ calls, clinic }: { calls: any[], clinic: any }) {
  const pathname = usePathname()
  const [dateFilter, setDateFilter] = useState('All time')
  const [callFilter, setCallFilter] = useState('all')
  const [selectedCall, setSelectedCall] = useState<any>(null)
  const [now] = useState(() => Date.now())
  const [menuOpen, setMenuOpen] = useState(false)

  const supabaseClient = createBrowserSupabaseClient()

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = '/login'
  }

  const dateCutoff = now - (DATE_MS[dateFilter] ?? Infinity)

  const filteredCalls = calls.filter(c => {
    const ts = c.started_at ?? (c.created_at ? new Date(c.created_at).getTime() : 0)
    const passDate = dateFilter === 'All time' || ts >= dateCutoff
    const classification = classifyCall(c)
    const passType = callFilter === 'all' || classification.filter === callFilter
    return passDate && passType
  })

  const totalCalls = filteredCalls.filter(c => c.direction !== 'outbound').length
  const resolvedCalls = filteredCalls.filter(c => c.call_successful === true && c.direction !== 'outbound').length
  const emergencyCalls = filteredCalls.filter(c => c.emergency_call === true).length
  const bookedCalls = calls.filter(c => c.appointment_booked_ai === true).length
  const estimatedRevenue = bookedCalls * (clinic?.avg_booking_value ?? 135)

  const barCounts = [0,1,2,3,4,5,6].map(i => {
    const dayStart = new Date(now - (6-i)*86400000)
    dayStart.setHours(0,0,0,0)
    const dayEnd = new Date(dayStart.getTime() + 86400000)
    return calls.filter(c => {
      const t = c.started_at ?? new Date(c.created_at).getTime()
      return t >= dayStart.getTime() && t < dayEnd.getTime() && c.direction !== 'outbound'
    }).length
  })
  const maxBar = Math.max(...barCounts, 1)
  const dayLabels = ['M','T','W','T','F','S','S']
  const today = new Date().getDay()
  const todayIdx = today === 0 ? 6 : today - 1

  const breakdown = [
    { label: 'Resolved', color: '#4ade80', count: calls.filter(c => classifyCall(c).filter === 'resolved').length },
    { label: 'FAQ', color: '#60a5fa', count: calls.filter(c => classifyCall(c).filter === 'faq').length },
    { label: 'Emergency', color: '#f87171', count: calls.filter(c => classifyCall(c).filter === 'emergency').length },
    { label: 'Booked', color: '#a855f7', count: calls.filter(c => classifyCall(c).filter === 'booked').length },
    { label: 'Missed', color: '#fbbf24', count: calls.filter(c => classifyCall(c).filter === 'missed').length },
    { label: 'Recovery', color: '#22d3ee', count: calls.filter(c => classifyCall(c).filter === 'recovery').length },
  ].filter(b => b.count > 0)
  const maxBreakdown = Math.max(...breakdown.map(b => b.count), 1)

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
        <div className="db-page-title">Overview</div>
        <div className="db-controls">
          {DATE_FILTERS.map(f => (
            <button
              key={f}
              className={`db-btn ${dateFilter === f ? 'active' : ''}`}
              onClick={() => setDateFilter(f)}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="db-content">
        <div className="db-kpis">
          <div className="db-kpi">
            <div className="db-kpi-label">Calls Answered</div>
            <div className="db-kpi-val">{totalCalls}</div>
            <div className="db-kpi-sub">Total handled</div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi-label">Calls Resolved</div>
            <div className="db-kpi-val">{resolvedCalls}</div>
            <div className="db-kpi-sub">{totalCalls ? Math.round(resolvedCalls/totalCalls*100) : 0}% resolution rate</div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi-label">Emergencies</div>
            <div className={`db-kpi-val ${emergencyCalls > 0 ? 'red' : ''}`}>{emergencyCalls}</div>
            <div className={`db-kpi-sub ${emergencyCalls > 0 ? 'warn' : ''}`}>{emergencyCalls > 0 ? 'Needs follow-up' : 'None flagged'}</div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi-label">Appointments</div>
            <div className="db-kpi-val">{bookedCalls}</div>
            <div className="db-kpi-sub">Booked by Clara</div>
          </div>
          <div className="db-kpi">
            <div className="db-kpi-label">Est. Revenue</div>
            <div className="db-kpi-val accent">£{estimatedRevenue.toLocaleString()}</div>
            <div className="db-kpi-sub">{bookedCalls} × £{clinic?.avg_booking_value ?? 135} avg</div>
          </div>
        </div>

        <div className="db-grid">
          <div className="db-panel">
            <div className="db-panel-head">
              <div className="db-panel-title">Recent Calls</div>
              <div className="db-tabs">
                {CALL_FILTERS.map(f => (
                  <button
                    key={f.key}
                    className={`db-tab ${callFilter === f.key ? 'active' : ''}`}
                    onClick={() => setCallFilter(f.key)}
                  >{f.label}</button>
                ))}
              </div>
            </div>
            {filteredCalls.length === 0 ? (
              <div className="db-empty">No calls match this filter</div>
            ) : (
              filteredCalls.slice(0, 10).map((call: any) => {
                const c = classifyCall(call)
                return (
                  <div key={call.id} className="db-call" onClick={() => setSelectedCall(call)}>
                    <div className={`db-call-ico ico-${c.cls}`}>
                      <CallIcon cls={c.cls} />
                    </div>
                    <div className="db-call-body">
                      <div className="db-call-sum">{call.call_summary ?? 'No summary available'}</div>
                      <div className="db-call-met">
                        {call.from_number}
                        {call.user_sentiment && <> · <span className={`sent-${(call.user_sentiment).toLowerCase()}`}>{call.user_sentiment}</span></>}
                        {call.duration_ms && <> · {formatTime(call.duration_ms)}</>}
                        {call.started_at && <> · {formatDate(call.started_at)}</>}
                      </div>
                    </div>
                    <div className={`db-badge badge-${c.cls}`}>{c.label}</div>
                  </div>
                )
              })
            )}
          </div>

          <div className="db-right">
            <div className="db-card">
              <div className="db-card-title">Clinic Details</div>
              <div className="db-info-row"><span className="db-info-key">Practice</span><span className="db-info-val">{clinic?.name}</span></div>
              <div className="db-info-row"><span className="db-info-key">Address</span><span className="db-info-val">{clinic?.address ?? '—'}</span></div>
              <div className="db-info-row"><span className="db-info-key">City</span><span className="db-info-val">{clinic?.city ?? '—'}</span></div>
              <div className="db-info-row"><span className="db-info-key">Phone</span><span className="db-info-val">{clinic?.phone ?? '—'}</span></div>
              <div className="db-info-row"><span className="db-info-key">Hours</span><span className="db-info-val">{clinic?.hours ?? '—'}</span></div>
              <div className="db-info-row"><span className="db-info-key">Avg booking</span><span className="db-info-val">£{clinic?.avg_booking_value ?? 135}</span></div>
            </div>

            <div className="db-card">
              <div className="db-card-title">Call Volume — 7 Days</div>
              <div className="db-bars">
                {barCounts.map((count, i) => (
                  <div key={i} className="db-bar-wrap">
                    <div
                      className={`db-bar ${i === todayIdx ? 'today' : ''}`}
                      style={{ height: `${Math.max(Math.round((count / maxBar) * 52), count > 0 ? 4 : 0)}px` }}
                    />
                    <div className={`db-bar-label ${i === todayIdx ? 'today-label' : ''}`}>{dayLabels[i]}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-title">Call Breakdown</div>
              {breakdown.length === 0 ? (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No data yet</div>
              ) : breakdown.map(b => (
                <div key={b.label} className="db-bd-row">
                  <div className="db-bd-dot" style={{ background: b.color }} />
                  <div className="db-bd-name">{b.label}</div>
                  <div className="db-bd-bar">
                    <div className="db-bd-fill" style={{ width: `${Math.round(b.count/maxBreakdown*100)}%`, background: b.color }} />
                  </div>
                  <div className="db-bd-count">{b.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedCall && (
        <div className="db-modal-overlay" onClick={() => setSelectedCall(null)}>
          <div className="db-modal" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="db-modal-head">
              <div>
                <div className={`db-badge badge-${classifyCall(selectedCall).cls}`} style={{ marginBottom: 8 }}>{classifyCall(selectedCall).label}</div>
                <div className="db-modal-title">Call Detail</div>
              </div>
              <button className="db-modal-close" onClick={() => setSelectedCall(null)}>✕</button>
            </div>
            <div className="db-modal-body">
              <div className="db-modal-section">
                <div className="db-modal-label">Summary</div>
                <div className="db-modal-text">{selectedCall.call_summary ?? 'No summary available'}</div>
              </div>
              <div className="db-modal-grid">
                <div><div className="db-modal-label">From</div><div className="db-modal-val">{selectedCall.from_number}</div></div>
                <div><div className="db-modal-label">Duration</div><div className="db-modal-val">{selectedCall.duration_ms ? formatTime(selectedCall.duration_ms) : '—'}</div></div>
                <div><div className="db-modal-label">Sentiment</div><div className={`db-modal-val sent-${(selectedCall.user_sentiment ?? '').toLowerCase()}`}>{selectedCall.user_sentiment ?? '—'}</div></div>
                <div><div className="db-modal-label">Status</div><div className="db-modal-val">{selectedCall.call_status ?? '—'}</div></div>
                <div><div className="db-modal-label">Time</div><div className="db-modal-val">{formatDate(selectedCall.started_at)}</div></div>
                <div><div className="db-modal-label">Direction</div><div className="db-modal-val">{selectedCall.direction ?? '—'}</div></div>
              </div>
              {selectedCall.recording_url && (
                <div className="db-modal-section">
                  <div className="db-modal-label">Recording</div>
                  <audio controls src={selectedCall.recording_url} className="db-audio" preload="none" />
                </div>
              )}
              <div className="db-modal-flags">
                {selectedCall.emergency_call && <span className="db-flag flag-red">Emergency</span>}
                {selectedCall.high_value_lead_ai && <span className="db-flag flag-purple">High Value Lead</span>}
                {selectedCall.appointment_booked_ai && <span className="db-flag flag-green">Appointment Booked</span>}
                {selectedCall.callback_requested && <span className="db-flag flag-yellow">Callback Requested</span>}
                {selectedCall.faq_only && <span className="db-flag flag-blue">FAQ Only</span>}
                {selectedCall.new_patient && <span className="db-flag flag-blue">New Patient</span>}
                {selectedCall.wrong_number && <span className="db-flag flag-gray">Wrong Number</span>}
                {selectedCall.complaint && <span className="db-flag flag-red">Complaint</span>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}