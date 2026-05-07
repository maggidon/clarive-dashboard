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
  const successfulCalls = calls?.filter((c) => c.call_successful === true).length ?? 0
  const bookedCalls = calls?.filter((c) => c.appointment_booked === true).length ?? 0
  const estimatedRevenue = bookedCalls * (clinic?.avg_booking_value ?? 135)
  const recentCalls = calls?.slice(0, 8) ?? []

  return { totalCalls, successfulCalls, bookedCalls, estimatedRevenue, recentCalls, clinic }
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

export default async function Dashboard() {
  const { totalCalls, successfulCalls, bookedCalls, estimatedRevenue, recentCalls, clinic } = await getDashboardData()

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
          <p className="kpi-value">{successfulCalls}</p>
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
          <p className="kpi-sub">At £{clinic?.avg_booking_value ?? 135} avg</p>
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
              <span className={`badge ${call.call_successful === true ? 'success' : call.call_successful === false ? 'missed' : 'unknown'}`}>
                {call.call_successful === true ? 'Resolved' : call.call_successful === false ? 'Missed' : 'Unclassified'}
              </span>
            </div>
          ))
        )}
      </div>
    </main>
  )
}