'use client'

import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { createBrowserSupabaseClient } from '../lib/supabase'
import { Building2, Clock, DollarSign, Bell, Mic, Plus, MessageCircle, AlertTriangle, Calendar, CheckCircle, Send } from 'lucide-react'

const SUBMARK = `M34.4958 0.0112218H34.4509C15.3486 0.0112218 0 15.6376 0 34.406C0 35.0092 0.0224436 35.6067 0.0589144 36.2071C6.56755 33.4999 11.7127 32.4282 17.9941 31.5304L18.0671 31.6062C12.8714 35.0288 6.27579 41.4449 3.31043 49.9482C5.95036 54.8072 9.05599 58.5385 13.0594 61.5459C13.8814 45.8915 26.6293 30.1249 45.2659 26.7303L45.2379 26.6125H3.54889C8.43598 18.3196 16.4343 12.4169 27.5804 12.4169C41.5515 12.4169 52.7508 23.7874 52.7508 37.997C52.7508 51.8391 40.968 65.179 25.2462 64.9938C21.7198 64.9489 19.1332 64.5478 15.4019 63.2011C21.097 67.2831 26.8089 68.9579 33.8758 68.9579C52.4787 68.9579 69 53.7075 69 34.2826C69 15.5282 53.3119 0 34.521 0L34.4958 0.0112218Z`

const FORMSPREE_ID = 'xbdzwkqq'

const VOICES = [
  { id: 'clara', name: 'Clara', accent: 'British · Female' },
  { id: 'willa', name: 'Willa', accent: 'British · Female' },
  { id: 'liam', name: 'Liam', accent: 'British · Male' },
  { id: 'niall', name: 'Niall', accent: 'Northern Irish · Male' },
]

const TONES = [
  { id: 'warm', label: 'Warm & Friendly' },
  { id: 'professional', label: 'Professional & Formal' },
  { id: 'concise', label: 'Concise & Efficient' },
]

type FAQ = { question: string; answer: string }

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

function CheckMark() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export default function SettingsClient({ clinic }: { clinic: ClinicData | null }) {
  const pathname = usePathname()
  const supabaseClient = createBrowserSupabaseClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)

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
    clara_tone: 'warm',
    clara_voice: 'clara',
    treatments: '',
    high_value_treatments: '',
    not_offered: '',
    emergency_definition: '',
    emergency_number: '',
    booking_preference: 'direct',
  })

  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }])
  const [faqsChanged, setFaqsChanged] = useState(false)

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

  function handlePlayVoice(voiceId: string) {
    if (playingVoice === voiceId) {
      audioRef.current?.pause()
      setPlayingVoice(null)
      return
    }
    audioRef.current?.pause()
    const audio = new Audio(`/voices/${voiceId}.mp3`)
    audio.play()
    audio.onended = () => setPlayingVoice(null)
    audioRef.current = audio
    setPlayingVoice(voiceId)
  }

  function addFaq() {
    if (faqs.length < 5) {
      setFaqs(prev => [...prev, { question: '', answer: '' }])
      setFaqsChanged(true)
    }
  }

  function removeFaq(i: number) {
    setFaqs(prev => prev.filter((_, idx) => idx !== i))
    setFaqsChanged(true)
  }

  function updateFaq(i: number, field: keyof FAQ, value: string) {
    setFaqs(prev => prev.map((faq, idx) => idx === i ? { ...faq, [field]: value } : faq))
    setFaqsChanged(true)
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
      clara_tone: 'Tone',
      clara_voice: 'Voice',
      treatments: 'Treatments Offered',
      high_value_treatments: 'High Value Treatments',
      not_offered: 'Treatments Not Offered',
      emergency_definition: 'Emergency Definition',
      emergency_number: 'Emergency Number',
      booking_preference: 'Booking Preference',
    }
    const lines = changedFields.map(f => {
      const original = (clinic as unknown as Record<string, unknown>)?.[f] ?? '(not set)'
      const updated = form[f as keyof typeof form]
      return `${labels[f] ?? f}: "${original}" → "${updated}"`
    })
    if (faqsChanged) {
      lines.push(`Patient FAQs: updated (${faqs.length} question${faqs.length !== 1 ? 's' : ''})`)
    }
    return lines.join('\n')
  }

  async function handleSubmit() {
    if (changedFields.length === 0 && !faqsChanged) return
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
          full_form: JSON.stringify({
            ...form,
            faqs: faqs.map((fq, i) => `Q${i + 1}: ${fq.question}\nA: ${fq.answer}`).join('\n\n'),
          }, null, 2),
        }),
      })

      if (response.ok) {
        setStatus('sent')
        setChangedFields([])
        setFaqsChanged(false)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  const hasChanges = changedFields.length > 0 || faqsChanged
  const totalChanges = changedFields.length + (faqsChanged ? 1 : 0)

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
            <span className="set-changes-note">{totalChanges} unsaved change{totalChanges > 1 ? 's' : ''}</span>
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

        {/* Clara Configuration */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><Mic size={16} color="#a855f7" /></div>
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
          </div>

          <div className="set-field">
            <label className="set-label">Tone</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {TONES.map(t => {
                const active = form.clara_tone === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => handleChange('clara_tone', t.id)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '100px',
                      border: `1px solid ${active ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
                      background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                      color: active ? '#a855f7' : 'rgba(255,255,255,0.45)',
                      fontSize: '13px',
                      fontWeight: active ? 600 : 400,
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >{t.label}</button>
                )
              })}
            </div>
          </div>

          <div className="set-field">
            <label className="set-label">Voice</label>
            <div className="set-voice-grid">
              {VOICES.map(voice => {
                const isSelected = form.clara_voice === voice.id
                const isPlaying = playingVoice === voice.id
                return (
                  <div
                    key={voice.id}
                    onClick={() => handleChange('clara_voice', voice.id)}
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.09)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isSelected ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={`/voices/${voice.id}.png`}
                        alt={voice.name}
                        width={64}
                        height={64}
                        style={{ borderRadius: '50%', display: 'block', objectFit: 'cover', width: '64px', height: '64px' }}
                      />
                      <button
                        onClick={e => { e.stopPropagation(); handlePlayVoice(voice.id) }}
                        aria-label={isPlaying ? `Pause ${voice.name}` : `Play ${voice.name}`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '50%',
                          background: isPlaying ? 'rgba(124,58,237,0.55)' : 'rgba(0,0,0,0.42)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        {isPlaying ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <rect x="6" y="5" width="4" height="14" rx="1" />
                            <rect x="14" y="5" width="4" height="14" rx="1" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        )}
                      </button>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: -4, right: -4,
                          width: '20px', height: '20px',
                          borderRadius: '50%',
                          background: '#7c3aed',
                          border: '2px solid #0d0a14',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <CheckMark />
                        </div>
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px', fontWeight: 700, color: '#f8f7ff', marginBottom: '6px' }}>{voice.name}</div>
                      <div style={{
                        display: 'inline-block',
                        background: 'rgba(124,58,237,0.15)',
                        border: '1px solid rgba(124,58,237,0.25)',
                        color: '#a855f7',
                        fontSize: '11px',
                        padding: '2px 9px',
                        borderRadius: '100px',
                        fontWeight: 500,
                        letterSpacing: '0.2px',
                      }}>{voice.accent}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Treatments & Services */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><Plus size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Treatments & Services</div>
              <div className="set-section-sub">Help Clara understand what your practice offers</div>
            </div>
          </div>
          <div className="set-field">
            <label className="set-label">Treatments offered</label>
            <textarea
              className="set-textarea"
              value={form.treatments}
              onChange={e => handleChange('treatments', e.target.value)}
              placeholder="e.g. General dentistry, Invisalign, implants, composite bonding, whitening..."
            />
          </div>
          <div className="set-field">
            <label className="set-label">High value treatments to flag</label>
            <textarea
              className="set-textarea"
              value={form.high_value_treatments}
              onChange={e => handleChange('high_value_treatments', e.target.value)}
              placeholder="e.g. Dental implants, Invisalign, full smile makeovers"
            />
          </div>
          <div className="set-field">
            <label className="set-label">Treatments not offered</label>
            <textarea
              className="set-textarea"
              value={form.not_offered}
              onChange={e => handleChange('not_offered', e.target.value)}
              placeholder="e.g. Orthodontics, oral surgery, NHS treatments"
            />
          </div>
        </div>

        {/* Common Patient Questions */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><MessageCircle size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Common Patient Questions</div>
              <div className="set-section-sub">Add up to 5 questions Clara should know how to answer</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '18px', position: 'relative' }}>
                {i > 0 && (
                  <button
                    onClick={() => removeFaq(i)}
                    aria-label="Remove question"
                    style={{
                      position: 'absolute', top: '14px', right: '14px',
                      width: '26px', height: '26px', borderRadius: '6px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.4)', fontSize: '16px', lineHeight: '1',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >×</button>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="set-field">
                    <label className="set-label">Question {i + 1}</label>
                    <input
                      className="set-input"
                      value={faq.question}
                      onChange={e => updateFaq(i, 'question', e.target.value)}
                      placeholder="e.g. Do you offer payment plans?"
                    />
                  </div>
                  <div className="set-field">
                    <label className="set-label">Answer</label>
                    <textarea
                      className="set-textarea"
                      value={faq.answer}
                      onChange={e => updateFaq(i, 'answer', e.target.value)}
                      placeholder="e.g. Yes, we offer 0% finance through Tabeo for treatments over £500."
                    />
                  </div>
                </div>
              </div>
            ))}
            {faqs.length < 5 && (
              <button
                onClick={addFaq}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px dashed rgba(124,58,237,0.35)',
                  background: 'rgba(124,58,237,0.04)',
                  color: '#a855f7',
                  fontSize: '13px',
                  fontWeight: 500,
                  fontFamily: "'DM Sans', sans-serif",
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '7px',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add another question
              </button>
            )}
          </div>
        </div>

        {/* Emergency Handling */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><AlertTriangle size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Emergency Handling</div>
              <div className="set-section-sub">How Clara should respond to dental emergencies</div>
            </div>
          </div>
          <div className="set-field">
            <label className="set-label">What counts as a dental emergency</label>
            <textarea
              className="set-textarea"
              value={form.emergency_definition}
              onChange={e => handleChange('emergency_definition', e.target.value)}
              placeholder="e.g. Severe toothache, dental trauma, lost crown, facial swelling, bleeding that won't stop"
            />
          </div>
          <div className="set-field">
            <label className="set-label">Out of hours emergency number</label>
            <input
              className="set-input"
              value={form.emergency_number}
              onChange={e => handleChange('emergency_number', e.target.value)}
              placeholder="e.g. 07700 900000"
            />
          </div>
        </div>

        {/* Booking Preference */}
        <div className="set-section">
          <div className="set-section-head">
            <div className="set-section-icon"><Calendar size={16} color="#a855f7" /></div>
            <div>
              <div className="set-section-title">Booking Preference</div>
              <div className="set-section-sub">How should Clara handle bookings?</div>
            </div>
          </div>
          <div className="set-booking-grid">
            {[
              { id: 'direct', label: 'Book directly during the call', desc: 'Clara books appointments in real time using your calendar integration' },
              { id: 'callback', label: 'Take a callback request', desc: "Clara collects the patient's details and your team calls back to confirm" },
            ].map(opt => {
              const isSelected = form.booking_preference === opt.id
              return (
                <div
                  key={opt.id}
                  onClick={() => handleChange('booking_preference', opt.id)}
                  style={{
                    background: isSelected ? 'rgba(124,58,237,0.09)' : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${isSelected ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '14px',
                    padding: '22px 20px',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                    position: 'relative',
                  }}
                >
                  {isSelected && (
                    <div style={{
                      position: 'absolute', top: '16px', right: '16px',
                      width: '22px', height: '22px', borderRadius: '50%',
                      background: '#7c3aed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckMark />
                    </div>
                  )}
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '14px', fontWeight: 700, color: '#f8f7ff', marginBottom: '8px', paddingRight: '28px' }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.55 }}>{opt.desc}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom submit */}
        {hasChanges && (
          <div className="set-bottom-bar">
            <span className="set-changes-note">{totalChanges} unsaved change{totalChanges > 1 ? 's' : ''}</span>
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
