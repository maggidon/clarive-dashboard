'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '../lib/supabase'
import { Building2, Phone, Clock, DollarSign, Bell, Bot, CheckCircle, Send } from 'lucide-react'

const SUBMARK = `M34.4958 0.0112218H34.4509C15.3486 0.0112218 0 15.6376 0 34.406C0 35.0092 0.0224436 35.6067 0.0589144 36.2071C6.56755 33.4999 11.7127 32.4282 17.9941 31.5304L18.0671 31.6062C12.8714 35.0288 6.27579 41.4449 3.31043 49.9482C5.95036 54.8072 9.05599 58.5385 13.0594 61.5459C13.8814 45.8915 26.6293 30.1249 45.2659 26.7303L45.2379 26.6125H3.54889C8.43598 18.3196 16.4343 12.4169 27.5804 12.4169C41.5515 12.4169 52.7508 23.7874 52.7508 37.997C52.7508 51.8391 40.968 65.179 25.2462 64.9938C21.7198 64.9489 19.1332 64.5478 15.4019 63.2011C21.097 67.2831 26.8089 68.9579 33.8758 68.9579C52.4787 68.9579 69 53.7075 69 34.2826C69 15.5282 53.3119 0 34.521 0L34.4958 0.0112218Z`

const FORMSPREE_ID = 'xbdzwkqq'

interface ClinicData {
  id: string
  name: string
  address?: string
  city?: string
  phone?: string
  hours?: string
  avg_booking_value?: number
  alert_sms?: string
  alert_email?: string
  clara_name?: string
}

export default function SettingsClient({ clinic }: { clinic: ClinicData | null }) {
  const pathname = usePathname()
  const supabaseClient = createBrowserSupabaseClient()

  const [form, setForm] = useState({
    name: clinic?.name ?? '',
    address: clinic?.address ?? '',
    city: clinic?.city ?? '',
    phone: clinic?.phone ?? '',
    hours: clinic?.hours ?? '',
    avg_booking_value: clinic?.avg_booking_value ?? 135,
    alert_sms: clinic?.alert_sms ?? '',
    alert_email: clinic?.alert_email ?? '',
    clara_name: clinic?.clara_name ?? 'Clara',
  })

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [changedFields, setChangedFields] = useState<string[]>([])
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await supabaseClient.auth.signOut()
    window.location.href = '/login'
  }

  function handleChange(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (!changedFields.includes(field)) {
      setChangedFields(prev => [...prev, field])
    }
  }

  function buildChangeLog() {
    const labels: Record<string, string> = {
      name: 'Practice Name',
      address: 'Address',
      city: 'City',
      phone: 'Phone Number',
      hours: 'Opening Hours',
      avg_booking_value: 'Average Booking Value',
      alert_sms: 'SMS Alert Number',
      alert_email: 'Alert Email',
      clara_name: 'Clara Display Name',
    }
    return changedFields.map(f => {
      const original = clinic?.[f as keyof ClinicData] ?? '(not set)'
      const updated = form[f as keyof typeof form]
      return `${labels[f]}: "${original}" → "${updated}"`
    }).join('\n')
  }

  async function handleSubmit() {
    if (changedFields.length === 0) return
    setStatus('sending')

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `Settings Change Request — ${clinic?.name ?? 'Unknown Clinic'}`,
          clinic_id: clinic?.id,
          clinic_name: clinic?.name,
          requested_by: 'Practice Manager',
          changes: buildChangeLog(),
          full_form: JSON.stringify(form, null, 2),
        }),
      })

      if (response.ok) {
        setStatus('sent')
        setChangedFields([])
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const hasChanges = changedFields.length > 0

  return (
    <div className="db-root">
      <div className="page-bg"><div className="page-bg-mid" /></div>
      <div className="page-texture" />
      <nav className="db-topnav">
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="db-logo">
            <svg width="20" height="20" viewBox="0 0 69 69" fill="none">
              <path d={SUBMARK} fill="#8942F0" />
            </svg>
            <span className="db-logo-text">CLARIVE AI</span>
          </div>
        </a>
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
          <a className="db-nav-btn" href="/settings" style={{ textDecoration: 'none', color: '#a855f7', borderColor: 'rgba(168,85,247,0.3)' }}>Settings</a>
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
        <div className="db-page-title">Settings</div>
        {hasChanges && (
          <div className="db-controls">
            <span className="set-changes-note">{changedFields.length} unsaved change{changedFields.length > 1 ? 's' : ''}</span>
            <button
              className="set-submit-btn"
              onClick={handleSubmit}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? (
                'Sending...'
              ) : (
                <><Send size={13} /> Request Changes</>
              )}
            </button>
          </div>
        )}
        {status === 'sent' && (
          <div className="set-success">
            <CheckCircle size={14} />
            Change request sent — we'll update your settings shortly.
          </div>
        )}
        {status === 'error' && (
          <div className="set-error">Failed to send — please try again or email us directly.</div>
        )}
      </div>

      <div className="db-content set-content">

        {/* Clinic Details */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><Building2 size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Clinic Details</div>
              <div className="set-section-sub">Basic information about your practice</div>
            </div>
          </div>
          <div className="set-grid">
            <div className="set-field">
              <label className="set-label">Practice Name</label>
              <input
                className="set-input"
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. Pinehurst Dental"
              />
            </div>
            <div className="set-field">
              <label className="set-label">Phone Number</label>
              <input
                className="set-input"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="e.g. 02890 000 111"
              />
            </div>
            <div className="set-field">
              <label className="set-label">Address</label>
              <input
                className="set-input"
                value={form.address}
                onChange={e => handleChange('address', e.target.value)}
                placeholder="e.g. 15b High Street"
              />
            </div>
            <div className="set-field">
              <label className="set-label">City & Postcode</label>
              <input
                className="set-input"
                value={form.city}
                onChange={e => handleChange('city', e.target.value)}
                placeholder="e.g. Belfast, BT2 5XZ"
              />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><Clock size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Opening Hours</div>
              <div className="set-section-sub">When your practice is open — Clara uses this to handle after-hours calls</div>
            </div>
          </div>
          <div className="set-field set-field-full">
            <label className="set-label">Hours</label>
            <input
              className="set-input"
              value={form.hours}
              onChange={e => handleChange('hours', e.target.value)}
              placeholder="e.g. Mon–Fri 9:00am–5:30pm, Sat 9:00am–1:00pm"
            />
          </div>
        </div>

        {/* Reporting */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><DollarSign size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Reporting</div>
              <div className="set-section-sub">Used to calculate estimated revenue in your reports</div>
            </div>
          </div>
          <div className="set-field">
            <label className="set-label">Average Booking Value (£)</label>
            <input
              className="set-input"
              type="number"
              value={form.avg_booking_value}
              onChange={e => handleChange('avg_booking_value', Number(e.target.value))}
              placeholder="e.g. 135"
            />
            <div className="set-hint">This is the average value of an appointment at your practice. Used to estimate revenue captured by Clara each month.</div>
          </div>
        </div>

        {/* Alert Contacts */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><Bell size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Alert Contacts</div>
              <div className="set-section-sub">Who receives SMS and email alerts for important calls</div>
            </div>
          </div>
          <div className="set-grid">
            <div className="set-field">
              <label className="set-label">SMS Alert Number</label>
              <input
                className="set-input"
                value={form.alert_sms}
                onChange={e => handleChange('alert_sms', e.target.value)}
                placeholder="e.g. +447700000000"
              />
              <div className="set-hint">Receives SMS alerts for emergency calls, high value leads, and callback requests.</div>
            </div>
            <div className="set-field">
              <label className="set-label">Alert Email</label>
              <input
                className="set-input"
                type="email"
                value={form.alert_email}
                onChange={e => handleChange('alert_email', e.target.value)}
                placeholder="e.g. manager@yourpractice.com"
              />
              <div className="set-hint">Receives email alerts for patient complaints.</div>
            </div>
          </div>
        </div>

        {/* Clara Config */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><Bot size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Clara Configuration</div>
              <div className="set-section-sub">How your AI receptionist presents itself to patients</div>
            </div>
          </div>
          <div className="set-field">
            <label className="set-label">AI Receptionist Name</label>
            <input
              className="set-input"
              value={form.clara_name}
              onChange={e => handleChange('clara_name', e.target.value)}
              placeholder="e.g. Clara"
            />
            <div className="set-hint">The name your AI receptionist uses when answering calls. Default is Clara.</div>
          </div>
        </div>

        {/* Bottom submit */}
        {hasChanges && (
          <div className="set-bottom-bar">
            <span className="set-changes-note">{changedFields.length} unsaved change{changedFields.length > 1 ? 's' : ''}</span>
            <button
              className="set-submit-btn"
              onClick={handleSubmit}
              disabled={status === 'sending'}
            >
              {status === 'sending' ? 'Sending...' : <><Send size={13} /> Request Changes</>}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}