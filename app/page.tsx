import { supabase } from './lib/supabase'

async function getDashboardData() {
  const clinicId = 'pinehurst_dental'

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })

  const { data: clinic } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', clinicId)
    .single()

  const totalCalls = calls?.length ?? 0
  const resolvedCalls = calls?.filter((c) => c.call_successful === true).length ?? 0
  const bookedCalls = calls?.filter((c) => c.appointment_booked_ai === true).length ?? 0
  const estimatedRevenue = bookedCalls * (clinic?.avg_booking_value ?? 135)
  const recentCalls = calls?.slice(0, 10) ?? []

  return { totalCalls, resolvedCalls, bookedCalls, estimatedRevenue, recentCalls, clinic }
}

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
  if (call.emergency_call === true) return { label: '🚨 Emergency', cls: 'emergency' }
  if (call.high_value_lead_ai === true) return { label: '💜 High Value Lead', cls: 'high-value' }
  if (call.appointment_booked_ai === true) return { label: '✅ Booked', cls: 'booked' }
  if (call.callback_requested === true) return { label: '📞 Callback Needed', cls: 'callback' }
  if (call.faq_only === true) return { label: '💬 FAQ', cls: 'faq' }
  if (call.wrong_number === true) return { label: 'Wrong Number', cls: 'unknown' }
  if (call.call_successful === true) return { label: 'Resolved', cls: 'success' }
  if (call.call_successful === false) return { label: 'Missed', cls: 'missed' }
  return { label: 'Unclassified', cls: 'unknown' }
}

export default async function Dashboard() {
  const { totalCalls, resolvedCalls, bookedCalls, estimatedRevenue, recentCalls, clinic } = await getDashboardData()

  return (
    <main className="dashboard">
      <header className="header">
        <div>
          <p className="logo-label">Clarive AI</p>
          <h1 className="clinic-name">{clinic?.name ?? 'Dashboard'}</h1>
        </div>
        <div className="status-badge">
          <span className="status-dot" />
          Clara is active
        </div>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-label">Calls Answered</p>
          <p className="kpi-value">{totalCalls}</p>
          <p className="kpi-sub">Total calls handled</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Calls Resolved</p>
          <p className="kpi-value">{resolvedCalls}</p>
          <p className="kpi-sub">Completed calls</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Appointments</p>
          <p className="kpi-value">{bookedCalls}</p>
          <p className="kpi-sub">Bookings confirmed</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Est. Revenue</p>
          <p className="kpi-value accent">£{estimatedRevenue.toLocaleString()}</p>
          <p className="kpi-sub">{bookedCalls} bookings × £{clinic?.avg_booking_value ?? 135}</p>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Recent Calls</h2>
          <span className="section-count">{recentCalls.length} shown</span>
        </div>
        {recentCalls.length === 0 ? (
          <div className="empty-state">No calls recorded yet</div>
        ) : (
          recentCalls.map((call: any) => (
            <div key={call.id} className="call-row">
              <div>
                <p className="call-summary">{call.call_summary ?? 'No summary available'}</p>
                <div className="call-meta">
                  <span>{call.from_number}</span>
                  <span className="call-meta-dot" />
                  <span className={`sentiment ${(call.user_sentiment ?? '').toLowerCase()}`}>
                    {call.user_sentiment ?? '—'}
                  </span>
                  <span className="call-meta-dot" />
                  <span>{call.duration_ms ? formatTime(call.duration_ms) : '—'}</span>
                  <span className="call-meta-dot" />
                  <span>{formatDate(call.started_at)}</span>
                </div>
              </div>
              <span className={`badge ${classifyCall(call).cls}`}>
                {classifyCall(call).label}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  )
}