'use client'

import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '../lib/supabase'
import {
  AlertCircle, Star, CalendarCheck, PhoneCall, MessageCircle,
  RefreshCw, PhoneMissed, PhoneIncoming, PhoneOff, HelpCircle
} from 'lucide-react'

const SUBMARK = `M34.4958 0.0112218H34.4509C15.3486 0.0112218 0 15.6376 0 34.406C0 35.0092 0.0224436 35.6067 0.0589144 36.2071C6.56755 33.4999 11.7127 32.4282 17.9941 31.5304L18.0671 31.6062C12.8714 35.0288 6.27579 41.4449 3.31043 49.9482C5.95036 54.8072 9.05599 58.5385 13.0594 61.5459C13.8814 45.8915 26.6293 30.1249 45.2659 26.7303L45.2379 26.6125H3.54889C8.43598 18.3196 16.4343 12.4169 27.5804 12.4169C41.5515 12.4169 52.7508 23.7874 52.7508 37.997C52.7508 51.8391 40.968 65.179 25.2462 64.9938C21.7198 64.9489 19.1332 64.5478 15.4019 63.2011C21.097 67.2831 26.8089 68.9579 33.8758 68.9579C52.4787 68.9579 69 53.7075 69 34.2826C69 15.5282 53.3119 0 34.521 0L34.4958 0.0112218Z`

const PAGE_SIZE = 20

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

const DATE_FILTERS = ['Today', '7 days', '28 days', 'All time']

const DATE_MS: Record<string, number> = {
  'Today': 86400000,
  '7 days': 7 * 86400000,
  '28 days': 28 * 86400000,
  'All time': Infinity,
}

export default function CallsClient({ calls, clinic }: { calls: any[], clinic: any }) {
  const pathname = usePathname()
  const [callFilter, setCallFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('All time')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedCall, setSelectedCall] = useState<any>(null)
  const [now] = useState(() => Date.now())

  const supabaseClient = createBrowserSupabaseClient()

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = '/login'
  }

  const filteredCalls = useMemo(() => {
    const dateCutoff = now - (DATE_MS[dateFilter] ?? Infinity)
    return calls.filter(c => {
      const ts = c.started_at ?? (c.created_at ? new Date(c.created_at).getTime() : 0)
      const passDate = dateFilter === 'All time' || ts >= dateCutoff
      const classification = classifyCall(c)
      const passType = callFilter === 'all' || classification.filter === callFilter
      const passSearch = search === '' ||
        (c.call_summary ?? '').toLowerCase().includes(search.toLowerCase()) ||
        (c.from_number ?? '').includes(search)
      return passDate && passType && passSearch
    })
  }, [calls, callFilter, dateFilter, search, now])

  const totalPages = Math.ceil(filteredCalls.length / PAGE_SIZE)
  const paginated = filteredCalls.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleFilterChange(key: string) { setCallFilter(key); setPage(1) }
  function handleDateChange(f: string) { setDateFilter(f); setPage(1) }
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) { setSearch(e.target.value); setPage(1) }

  return (
    <div className="db-root">
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
          <button className="db-nav-btn">Settings</button>
          <button className="db-nav-btn logout" onClick={handleLogout}>Log out</button>
        </div>
      </nav>

      <div className="db-subnav">
        <div className="db-page-title">Calls</div>
        <div className="db-controls">
          {DATE_FILTERS.map(f => (
            <button
              key={f}
              className={`db-btn ${dateFilter === f ? 'active' : ''}`}
              onClick={() => handleDateChange(f)}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="db-content">
        <div className="calls-toolbar">
          <div className="db-tabs">
            {CALL_FILTERS.map(f => (
              <button
                key={f.key}
                className={`db-tab ${callFilter === f.key ? 'active' : ''}`}
                onClick={() => handleFilterChange(f.key)}
              >{f.label}</button>
            ))}
          </div>
          <div className="calls-search-wrap">
            <input
              type="text"
              className="calls-search"
              placeholder="Search by number or summary..."
              value={search}
              onChange={handleSearch}
            />
            <span className="calls-count">{filteredCalls.length} calls</span>
          </div>
        </div>

        <div className="db-panel">
          {paginated.length === 0 ? (
            <div className="db-empty">No calls match this filter</div>
          ) : (
            paginated.map((call: any) => {
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

        {totalPages > 1 && (
          <div className="calls-pagination">
            <button className="db-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Previous</button>
            <span className="calls-page-info">Page {page} of {totalPages}</span>
            <button className="db-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next →</button>
          </div>
        )}
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