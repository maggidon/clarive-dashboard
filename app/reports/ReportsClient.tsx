'use client'

import { useState, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Printer, TrendingUp, Phone, Calendar, AlertCircle, RefreshCw, Star } from 'lucide-react'

const SUBMARK = `M34.4958 0.0112218H34.4509C15.3486 0.0112218 0 15.6376 0 34.406C0 35.0092 0.0224436 35.6067 0.0589144 36.2071C6.56755 33.4999 11.7127 32.4282 17.9941 31.5304L18.0671 31.6062C12.8714 35.0288 6.27579 41.4449 3.31043 49.9482C5.95036 54.8072 9.05599 58.5385 13.0594 61.5459C13.8814 45.8915 26.6293 30.1249 45.2659 26.7303L45.2379 26.6125H3.54889C8.43598 18.3196 16.4343 12.4169 27.5804 12.4169C41.5515 12.4169 52.7508 23.7874 52.7508 37.997C52.7508 51.8391 40.968 65.179 25.2462 64.9938C21.7198 64.9489 19.1332 64.5478 15.4019 63.2011C21.097 67.2831 26.8089 68.9579 33.8758 68.9579C52.4787 68.9579 69 53.7075 69 34.2826C69 15.5282 53.3119 0 34.521 0L34.4958 0.0112218Z`

function formatCurrency(n: number) {
  return `£${n.toLocaleString()}`
}

function getMonthRange(offset: number) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59)
  return { start, end }
}

function getMonthLabel(offset: number) {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  return d.toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

function inRange(ts: string | number, start: Date, end: Date) {
  const t = typeof ts === 'number' ? ts : new Date(ts).getTime()
  return t >= start.getTime() && t <= end.getTime()
}

function generateNarrative(
  monthLabel: string,
  clinicName: string,
  totalCalls: number,
  resolvedCalls: number,
  missedCalls: number,
  bookedCalls: number,
  estimatedRevenue: number,
  recoveryAttempts: number,
  recoveryRate: number,
  highValueCalls: number,
  emergencyCalls: number,
  complaints: number
) {
  const resRate = totalCalls ? Math.round(resolvedCalls / totalCalls * 100) : 0
  const para1 = `During ${monthLabel}, Clara handled ${totalCalls} inbound patient calls on behalf of ${clinicName}. Of these, ${resolvedCalls} were successfully resolved (${resRate}% resolution rate), with ${missedCalls} calls not completing. Clara booked ${bookedCalls} appointments directly, generating an estimated ${formatCurrency(estimatedRevenue)} in captured revenue at the average booking value.`

  const parts: string[] = []
  if (recoveryAttempts > 0) parts.push(`The missed call recovery system triggered ${recoveryAttempts} outbound recovery calls, achieving a ${recoveryRate}% booking rate on those attempts.`)
  if (highValueCalls > 0) parts.push(`${highValueCalls} high-value treatment ${highValueCalls === 1 ? 'enquiry was' : 'enquiries were'} detected and flagged for priority follow-up.`)
  if (emergencyCalls > 0) parts.push(`${emergencyCalls} emergency ${emergencyCalls === 1 ? 'call was' : 'calls were'} identified and escalated during this period.`)
  if (complaints > 0) {
    parts.push(`${complaints} complaint${complaints > 1 ? 's were' : ' was'} logged and should be reviewed with the practice manager.`)
  } else {
    parts.push(`No complaints were recorded this period.`)
  }

  return [para1, parts.join(' ')]
}

export default function ReportsClient({ calls, recoveries, clinic }: {
  calls: any[]
  recoveries: any[]
  clinic: any
}) {
  const pathname = usePathname()
  const [monthOffset, setMonthOffset] = useState(0)
  const supabaseClient = createBrowserSupabaseClient()

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = '/login'
  }

  const { start, end } = useMemo(() => getMonthRange(monthOffset), [monthOffset])

  const inboundCalls = useMemo(() =>
    calls.filter(c => c.direction !== 'outbound' && inRange(c.started_at ?? c.created_at, start, end)),
    [calls, start, end]
  )

  const outboundCalls = useMemo(() =>
    calls.filter(c => c.direction === 'outbound' && inRange(c.started_at ?? c.created_at, start, end)),
    [calls, start, end]
  )

  const monthRecoveries = useMemo(() =>
    recoveries.filter(r => inRange(r.recovery_triggered_at, start, end)),
    [recoveries, start, end]
  )

  const totalCalls = inboundCalls.length
  const resolvedCalls = inboundCalls.filter(c => c.call_successful === true).length
  const missedCalls = inboundCalls.filter(c => c.call_successful === false).length
  const bookedCalls = calls.filter(c => c.appointment_booked_ai === true && inRange(c.started_at ?? c.created_at, start, end)).length
  const emergencyCalls = inboundCalls.filter(c => c.emergency_call === true).length
  const highValueCalls = inboundCalls.filter(c => c.high_value_lead_ai === true).length
  const newPatients = inboundCalls.filter(c => c.new_patient === true).length
  const complaints = inboundCalls.filter(c => c.complaint === true).length
  const callbacksNeeded = inboundCalls.filter(c => c.callback_requested === true).length
  const avgBookingValue = clinic?.avg_booking_value ?? 135
  const estimatedRevenue = bookedCalls * avgBookingValue
  const resolutionRate = totalCalls ? Math.round(resolvedCalls / totalCalls * 100) : 0
  const recoveryRate = monthRecoveries.length > 0
    ? Math.round(outboundCalls.filter(c => c.appointment_booked_ai === true).length / monthRecoveries.length * 100)
    : 0

  const narrative = useMemo(() => generateNarrative(
    getMonthLabel(monthOffset),
    clinic?.name ?? 'the practice',
    totalCalls,
    resolvedCalls,
    missedCalls,
    bookedCalls,
    estimatedRevenue,
    monthRecoveries.length,
    recoveryRate,
    highValueCalls,
    emergencyCalls,
    complaints
  ), [monthOffset, clinic, totalCalls, resolvedCalls, missedCalls, bookedCalls,
      estimatedRevenue, monthRecoveries.length, recoveryRate, highValueCalls,
      emergencyCalls, complaints])

  const weeklyData = useMemo(() => {
    const weeks: { week: string; calls: number; booked: number; missed: number }[] = []
    const startCopy = new Date(start)
    let weekNum = 1
    while (startCopy <= end) {
      const weekEnd = new Date(startCopy)
      weekEnd.setDate(weekEnd.getDate() + 6)
      if (weekEnd > end) weekEnd.setTime(end.getTime())
      const weekCalls = inboundCalls.filter(c => {
        const t = c.started_at ?? new Date(c.created_at).getTime()
        return t >= startCopy.getTime() && t <= weekEnd.getTime()
      })
      weeks.push({
        week: `Wk ${weekNum}`,
        calls: weekCalls.length,
        booked: weekCalls.filter(c => c.appointment_booked_ai === true).length,
        missed: weekCalls.filter(c => c.call_successful === false).length,
      })
      startCopy.setDate(startCopy.getDate() + 7)
      weekNum++
    }
    return weeks
  }, [inboundCalls, start, end])

  const callTypes = [
    { label: 'Resolved', count: resolvedCalls, color: '#4ade80' },
    { label: 'Missed', count: missedCalls, color: '#f87171' },
    { label: 'High Value', count: highValueCalls, color: '#a855f7' },
    { label: 'Emergency', count: emergencyCalls, color: '#f87171' },
    { label: 'FAQ', count: inboundCalls.filter(c => c.faq_only).length, color: '#60a5fa' },
    { label: 'Callback', count: callbacksNeeded, color: '#fbbf24' },
    { label: 'Recovery', count: monthRecoveries.length, color: '#22d3ee' },
  ].filter(t => t.count > 0)

  return (
    <div className="db-root">
      <nav className="db-topnav no-print">
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

      <div className="db-subnav no-print">
        <div className="db-page-title">Reports</div>
        <div className="db-controls">
          <button className="db-btn" onClick={() => setMonthOffset(o => o - 1)}>← Previous</button>
          <span className="rep-month-label">{getMonthLabel(monthOffset)}</span>
          <button className="db-btn" onClick={() => setMonthOffset(o => Math.min(0, o + 1))} disabled={monthOffset === 0}>Next →</button>
          <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', margin: '0 6px' }} />
          <button className="db-btn rep-export-btn" onClick={() => window.print()}>
            <Printer size={13} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="db-content rep-content">

        <div className="print-header">
          <div className="print-header-logo">CLARIVE AI</div>
          <div className="print-header-meta">
            <div className="print-header-clinic">{clinic?.name}</div>
            <div className="print-header-period">{getMonthLabel(monthOffset)} — Performance Report</div>
          </div>
        </div>

        <div className="rep-headline">
          <div className="rep-headline-val">{formatCurrency(estimatedRevenue)}</div>
          <div className="rep-headline-label">Estimated revenue captured by Clara</div>
          <div className="rep-headline-sub">{bookedCalls} appointments booked × {formatCurrency(avgBookingValue)} average booking value</div>
        </div>

        <div className="rep-narrative">
          <div className="rep-section-title">Monthly Performance Summary</div>
          {narrative.map((para, i) => (
            <p key={i} className="rep-narrative-para">{para}</p>
          ))}
        </div>

        <div className="rep-kpi-grid">
          <div className="rep-kpi">
            <div className="rep-kpi-icon"><Phone size={16} color="#a855f7" /></div>
            <div className="rep-kpi-val">{totalCalls}</div>
            <div className="rep-kpi-label">Calls Handled</div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon"><TrendingUp size={16} color="#4ade80" /></div>
            <div className="rep-kpi-val">{resolutionRate}%</div>
            <div className="rep-kpi-label">Resolution Rate</div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon"><Calendar size={16} color="#4ade80" /></div>
            <div className="rep-kpi-val">{bookedCalls}</div>
            <div className="rep-kpi-label">Appointments Booked</div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon"><RefreshCw size={16} color="#22d3ee" /></div>
            <div className="rep-kpi-val">{monthRecoveries.length}</div>
            <div className="rep-kpi-label">Recovery Attempts</div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon"><RefreshCw size={16} color="#22d3ee" /></div>
            <div className="rep-kpi-val">{recoveryRate}%</div>
            <div className="rep-kpi-label">Recovery Rate</div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon"><Star size={16} color="#a855f7" /></div>
            <div className="rep-kpi-val">{highValueCalls}</div>
            <div className="rep-kpi-label">High Value Leads</div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon"><AlertCircle size={16} color="#f87171" /></div>
            <div className="rep-kpi-val">{emergencyCalls}</div>
            <div className="rep-kpi-label">Emergencies</div>
          </div>
          <div className="rep-kpi">
            <div className="rep-kpi-icon"><Phone size={16} color="#94a3b8" /></div>
            <div className="rep-kpi-val">{newPatients}</div>
            <div className="rep-kpi-label">New Patients</div>
          </div>
        </div>

        <div className="rep-section">
          <div className="rep-section-title">Weekly Call Volume</div>
          <div className="rep-chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e1630', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f8f7ff' }}
                />
                <Bar dataKey="calls" name="Total Calls" fill="#7c3aed" radius={[4,4,0,0]} />
                <Bar dataKey="booked" name="Booked" fill="#4ade80" radius={[4,4,0,0]} />
                <Bar dataKey="missed" name="Missed" fill="#f87171" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rep-two-col">
          <div className="rep-section">
            <div className="rep-section-title">Call Type Breakdown</div>
            {callTypes.length === 0 ? (
              <div className="db-empty">No data for this period</div>
            ) : callTypes.map(t => (
              <div key={t.label} className="rep-breakdown-row">
                <div className="rep-breakdown-label">{t.label}</div>
                <div className="rep-breakdown-bar-wrap">
                  <div
                    className="rep-breakdown-bar"
                    style={{ width: `${Math.round(t.count / Math.max(...callTypes.map(x => x.count)) * 100)}%`, background: t.color }}
                  />
                </div>
                <div className="rep-breakdown-count">{t.count}</div>
              </div>
            ))}
          </div>

          <div className="rep-section">
            <div className="rep-section-title">Items Requiring Attention</div>
            <div className="rep-attention-row">
              <span className="rep-attention-label">Complaints</span>
              <span className="rep-attention-val" style={{ color: complaints > 0 ? '#f87171' : '#4ade80' }}>{complaints}</span>
            </div>
            <div className="rep-attention-row">
              <span className="rep-attention-label">Pending Callbacks</span>
              <span className="rep-attention-val" style={{ color: callbacksNeeded > 0 ? '#fbbf24' : '#4ade80' }}>{callbacksNeeded}</span>
            </div>
            <div className="rep-attention-row">
              <span className="rep-attention-label">Missed Calls</span>
              <span className="rep-attention-val" style={{ color: missedCalls > 0 ? '#f87171' : '#4ade80' }}>{missedCalls}</span>
            </div>
            <div className="rep-attention-row">
              <span className="rep-attention-label">Emergency Calls</span>
              <span className="rep-attention-val" style={{ color: emergencyCalls > 0 ? '#f87171' : '#4ade80' }}>{emergencyCalls}</span>
            </div>
            <div className="rep-attention-row">
              <span className="rep-attention-label">High Value Leads</span>
              <span className="rep-attention-val" style={{ color: '#a855f7' }}>{highValueCalls}</span>
            </div>
            <div className="rep-attention-row">
              <span className="rep-attention-label">New Patients</span>
              <span className="rep-attention-val" style={{ color: '#60a5fa' }}>{newPatients}</span>
            </div>
          </div>
        </div>

        <div className="print-footer">
          <span>Generated by Clarive AI</span>
          <span>{clinic?.name} · {getMonthLabel(monthOffset)}</span>
          <span>dashboard.clariveai.com</span>
        </div>

      </div>
    </div>
  )
}