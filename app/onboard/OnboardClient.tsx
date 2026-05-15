'use client'

import { useState, useRef } from 'react'

const SUBMARK = `M34.4958 0.0112218H34.4509C15.3486 0.0112218 0 15.6376 0 34.406C0 35.0092 0.0224436 35.6067 0.0589144 36.2071C6.56755 33.4999 11.7127 32.4282 17.9941 31.5304L18.0671 31.6062C12.8714 35.0288 6.27579 41.4449 3.31043 49.9482C5.95036 54.8072 9.05599 58.5385 13.0594 61.5459C13.8814 45.8915 26.6293 30.1249 45.2659 26.7303L45.2379 26.6125H3.54889C8.43598 18.3196 16.4343 12.4169 27.5804 12.4169C41.5515 12.4169 52.7508 23.7874 52.7508 37.997C52.7508 51.8391 40.968 65.179 25.2462 64.9938C21.7198 64.9489 19.1332 64.5478 15.4019 63.2011C21.097 67.2831 26.8089 68.9579 33.8758 68.9579C52.4787 68.9579 69 53.7075 69 34.2826C69 15.5282 53.3119 0 34.521 0L34.4958 0.0112218Z`

const VOICES = [
  { id: 'clara', name: 'Clara', accent: 'British · Female', description: 'Warm, clear and natural — the default Clarive AI voice' },
  { id: 'willa', name: 'Willa', accent: 'British · Female', description: 'Calm, polished and reassuring' },
  { id: 'liam', name: 'Liam', accent: 'British · Male', description: 'Confident, friendly and approachable' },
  { id: 'niall', name: 'Niall', accent: 'Northern Irish · Male', description: 'Warm, natural Northern Irish tone' },
]

const TONES = [
  { id: 'warm', label: 'Warm & Friendly' },
  { id: 'professional', label: 'Professional & Formal' },
  { id: 'concise', label: 'Concise & Efficient' },
]

type FAQ = { question: string; answer: string }

const INPUT: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '10px',
  padding: '11px 14px',
  color: '#f8f7ff',
  fontSize: '14px',
  fontFamily: "'DM Sans', sans-serif",
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s, background 0.15s',
}

const TEXTAREA: React.CSSProperties = {
  ...INPUT,
  resize: 'vertical' as const,
  minHeight: '90px',
  lineHeight: '1.6',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: 'rgba(255,255,255,0.5)',
  marginBottom: '7px',
  letterSpacing: '0.3px',
}

const HINT: React.CSSProperties = {
  fontSize: '12px',
  color: 'rgba(255,255,255,0.25)',
  marginTop: '5px',
  lineHeight: '1.5',
}

const CARD: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '28px',
}

const SECTION_ICON: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: 'rgba(168,85,247,0.1)',
  border: '1px solid rgba(168,85,247,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

function focusStyle(active: boolean): React.CSSProperties {
  return active ? { border: '1px solid rgba(124,58,237,0.6)', background: 'rgba(124,58,237,0.05)' } : {}
}

function SectionCard({ icon, title, subtitle, children }: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div style={CARD}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={SECTION_ICON}>{icon}</div>
        <div>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '16px', fontWeight: 700, color: '#f8f7ff', marginBottom: subtitle ? '4px' : 0 }}>
            {title}
          </div>
          {subtitle && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      {children}
      {hint && <div style={HINT}>{hint}</div>}
    </div>
  )
}

// Icon SVGs
const Icons = {
  Building: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18M9 21V7l3-4 3 4v14M3 7l6-4M21 7l-6-4" />
      <rect x="9" y="12" width="2" height="3" /><rect x="13" y="12" width="2" height="3" />
    </svg>
  ),
  Mic: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  ),
  Cross: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Chat: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Alert: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Calendar: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Bell: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Check: ({ size = 10, color = 'white' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  Play: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Pause: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
}

export default function OnboardClient() {
  const [focused, setFocused] = useState<string | null>(null)
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Form state — Your Details
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [bestTimeToCall, setBestTimeToCall] = useState('anytime')

  // Form state
  const [practiceName, setPracticeName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [cityPostcode, setCityPostcode] = useState('')
  const [website, setWebsite] = useState('')
  const [openingHours, setOpeningHours] = useState('')
  const [avgBookingValue, setAvgBookingValue] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('clara')
  const [aiName, setAiName] = useState('Clara')
  const [tone, setTone] = useState('warm')
  const [treatments, setTreatments] = useState('')
  const [highValueTreatments, setHighValueTreatments] = useState('')
  const [notOffered, setNotOffered] = useState('')
  const [faqs, setFaqs] = useState<FAQ[]>([{ question: '', answer: '' }])
  const [emergencyDefinition, setEmergencyDefinition] = useState('')
  const [emergencyNumber, setEmergencyNumber] = useState('')
  const [bookingPreference, setBookingPreference] = useState('direct')
  const [smsAlertNumber, setSmsAlertNumber] = useState('')
  const [alertEmail, setAlertEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function f(id: string) { return { onFocus: () => setFocused(id), onBlur: () => setFocused(null) } }
  function inputStyle(id: string): React.CSSProperties { return { ...INPUT, ...focusStyle(focused === id) } }
  function textareaStyle(id: string): React.CSSProperties { return { ...TEXTAREA, ...focusStyle(focused === id) } }

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
    if (faqs.length < 5) setFaqs([...faqs, { question: '', answer: '' }])
  }

  function removeFaq(i: number) {
    setFaqs(faqs.filter((_, idx) => idx !== i))
  }

  function updateFaq(i: number, field: keyof FAQ, value: string) {
    setFaqs(faqs.map((faq, idx) => idx === i ? { ...faq, [field]: value } : faq))
  }

  async function handleSubmit() {
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('https://formspree.io/f/xbdzwkqq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          fullName, jobTitle, contactEmail, contactPhone, bestTimeToCall,
          practiceName, phone, address, cityPostcode, website, openingHours, avgBookingValue,
          selectedVoice, aiName, tone,
          treatments, highValueTreatments, notOffered,
          faqs: faqs.map((fq, i) => `Q${i + 1}: ${fq.question}\nA: ${fq.answer}`).join('\n\n'),
          emergencyDefinition, emergencyNumber, bookingPreference,
          smsAlertNumber, alertEmail,
        }),
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0d0a14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif",
        padding: '40px 24px',
        position: 'relative',
      }}>
        <div className="page-bg"><div className="page-bg-mid" /></div>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', textAlign: 'center', maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="26" height="26" viewBox="0 0 69 69" fill="none">
              <path d={SUBMARK} fill="#8942F0" />
            </svg>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#f8f7ff' }}>CLARIVE AI</span>
          </div>
          <div style={{
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'rgba(74,222,128,0.1)',
            border: '2px solid rgba(74,222,128,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: '36px', fontWeight: 700, color: '#f8f7ff', letterSpacing: '-1px', marginBottom: '14px' }}>
              You're all set.
            </div>
            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              We'll review your setup and have Clara live within 24 hours. You'll receive your dashboard login by email.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0a14', fontFamily: "'DM Sans', sans-serif", position: 'relative' }}>
      <div className="page-texture" />
      <div className="page-bg"><div className="page-bg-mid" /></div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto', padding: '52px 24px 96px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '44px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
            <svg width="26" height="26" viewBox="0 0 69 69" fill="none">
              <path d={SUBMARK} fill="#8942F0" />
            </svg>
            <span style={{ fontFamily: "'Sora', sans-serif", fontSize: '12px', fontWeight: 700, letterSpacing: '2px', color: '#f8f7ff' }}>CLARIVE AI</span>
          </div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: '38px', fontWeight: 700, color: '#f8f7ff', letterSpacing: '-1.5px', lineHeight: 1.15, marginBottom: '14px' }}>
            Set up your practice
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.65, maxWidth: '540px', margin: 0 }}>
            Tell us about your clinic and how you'd like Clara to work. We'll have you live within 24 hours.
          </p>
          <div style={{ marginTop: '30px', height: '1px', background: 'linear-gradient(90deg, #7c3aed 0%, rgba(124,58,237,0.15) 60%, transparent 100%)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── Section 0: Your Details ── */}
          <SectionCard icon={<Icons.User />} title="Your Details">
            <div className="ob-two-col">
              <Field label="Full Name">
                <input style={inputStyle('fullName')} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Sarah Johnson" {...f('fullName')} />
              </Field>
              <Field label="Job Title">
                <input style={inputStyle('jobTitle')} value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Practice Manager" {...f('jobTitle')} />
              </Field>
            </div>
            <div className="ob-two-col">
              <Field label="Email Address">
                <input type="email" style={inputStyle('contactEmail')} value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="e.g. sarah@yourpractice.co.uk" {...f('contactEmail')} />
              </Field>
              <Field label="Phone Number">
                <input style={inputStyle('contactPhone')} value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="e.g. 07700 900123" {...f('contactPhone')} />
              </Field>
            </div>
            <Field label="Best time to call">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'morning', label: 'Morning (9am–12pm)' },
                  { id: 'afternoon', label: 'Afternoon (12pm–5pm)' },
                  { id: 'anytime', label: 'Anytime' },
                ].map(opt => {
                  const active = bestTimeToCall === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setBestTimeToCall(opt.id)}
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
                    >{opt.label}</button>
                  )
                })}
              </div>
            </Field>
          </SectionCard>

          {/* ── Section 1: Clinic Details ── */}
          <SectionCard icon={<Icons.Building />} title="Clinic Details">
            <div className="ob-two-col">
              <Field label="Practice Name">
                <input style={inputStyle('practiceName')} value={practiceName} onChange={e => setPracticeName(e.target.value)} placeholder="e.g. Pinehurst Dental" {...f('practiceName')} />
              </Field>
              <Field label="Phone Number">
                <input style={inputStyle('phone')} value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 01234 567890" {...f('phone')} />
              </Field>
            </div>
            <div className="ob-two-col">
              <Field label="Address">
                <input style={inputStyle('address')} value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 12 High Street" {...f('address')} />
              </Field>
              <Field label="City & Postcode">
                <input style={inputStyle('cityPostcode')} value={cityPostcode} onChange={e => setCityPostcode(e.target.value)} placeholder="e.g. London, SW1A 1AA" {...f('cityPostcode')} />
              </Field>
            </div>
            <div className="ob-two-col">
              <Field label="Website URL">
                <input style={inputStyle('website')} value={website} onChange={e => setWebsite(e.target.value)} placeholder="e.g. https://yourpractice.co.uk" {...f('website')} />
              </Field>
              <Field label="Opening Hours">
                <input style={inputStyle('openingHours')} value={openingHours} onChange={e => setOpeningHours(e.target.value)} placeholder="e.g. Mon–Fri 9am–5pm, Sat 9am–1pm" {...f('openingHours')} />
              </Field>
            </div>
            <Field label="Average Booking Value £" hint="Used to calculate estimated revenue in your monthly report">
              <input style={inputStyle('avgBookingValue')} value={avgBookingValue} onChange={e => setAvgBookingValue(e.target.value)} placeholder="e.g. 250" {...f('avgBookingValue')} />
            </Field>
          </SectionCard>

          {/* ── Section 2: Voice ── */}
          <SectionCard icon={<Icons.Mic />} title="Choose Your AI Receptionist Voice" subtitle="Each voice has a unique accent and personality. Press play to preview before choosing.">
            <div className="ob-voice-grid">
              {VOICES.map(voice => {
                const isSelected = selectedVoice === voice.id
                const isPlaying = playingVoice === voice.id
                return (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    style={{
                      background: isSelected ? 'rgba(124,58,237,0.09)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${isSelected ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '14px',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      display: 'flex',
                      gap: '14px',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Photo + play */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={`/voices/${voice.id}.png`}
                        alt={voice.name}
                        width={80}
                        height={80}
                        style={{ borderRadius: '50%', display: 'block', objectFit: 'cover', width: '80px', height: '80px' }}
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
                        {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                      </button>
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: -4, right: -4,
                          width: '22px', height: '22px',
                          borderRadius: '50%',
                          background: '#7c3aed',
                          border: '2px solid #0d0a14',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Icons.Check size={10} color="white" />
                        </div>
                      )}
                    </div>
                    {/* Info */}
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
                        marginBottom: '8px',
                        letterSpacing: '0.2px',
                      }}>{voice.accent}</div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)', lineHeight: 1.55 }}>{voice.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* ── Section 3: Personality ── */}
          <SectionCard icon={<Icons.Sparkles />} title="Clara's Personality">
            <Field label="What would you like to name your AI receptionist?" hint="Most clinics keep the name Clara">
              <input style={inputStyle('aiName')} value={aiName} onChange={e => setAiName(e.target.value)} placeholder="e.g. Clara" {...f('aiName')} />
            </Field>
            <Field label="Tone">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {TONES.map(t => {
                  const active = tone === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
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
            </Field>
          </SectionCard>

          {/* ── Section 4: Treatments ── */}
          <SectionCard icon={<Icons.Cross />} title="Treatments & Services">
            <Field label="What treatments do you offer?">
              <textarea style={textareaStyle('treatments')} value={treatments} onChange={e => setTreatments(e.target.value)} placeholder="e.g. General dentistry, Invisalign, implants, composite bonding, whitening..." {...f('treatments')} />
            </Field>
            <Field label="Which treatments should Clara prioritise and flag to your team?">
              <textarea style={textareaStyle('highValue')} value={highValueTreatments} onChange={e => setHighValueTreatments(e.target.value)} placeholder="e.g. Dental implants, Invisalign, full smile makeovers" {...f('highValue')} />
            </Field>
            <Field label="Are there any treatments you don't offer that callers might ask about?">
              <textarea style={textareaStyle('notOffered')} value={notOffered} onChange={e => setNotOffered(e.target.value)} placeholder="e.g. Orthodontics, oral surgery, NHS treatments" {...f('notOffered')} />
            </Field>
          </SectionCard>

          {/* ── Section 5: FAQs ── */}
          <SectionCard icon={<Icons.Chat />} title="Common Patient Questions" subtitle="Add up to 5 questions your patients ask most often, with the answers you'd like Clara to give.">
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
                    <Field label={`Question ${i + 1}`}>
                      <input
                        style={inputStyle(`fq${i}`)}
                        value={faq.question}
                        onChange={e => updateFaq(i, 'question', e.target.value)}
                        placeholder="e.g. Do you offer payment plans?"
                        {...f(`fq${i}`)}
                      />
                    </Field>
                    <Field label="Answer">
                      <textarea
                        style={textareaStyle(`fa${i}`)}
                        value={faq.answer}
                        onChange={e => updateFaq(i, 'answer', e.target.value)}
                        placeholder="e.g. Yes, we offer 0% finance through Tabeo for treatments over £500."
                        {...f(`fa${i}`)}
                      />
                    </Field>
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
          </SectionCard>

          {/* ── Section 6: Emergency ── */}
          <SectionCard icon={<Icons.Alert />} title="Emergency Handling">
            <Field label="What counts as a dental emergency?">
              <textarea style={textareaStyle('emergencyDef')} value={emergencyDefinition} onChange={e => setEmergencyDefinition(e.target.value)} placeholder="e.g. Severe toothache, dental trauma, lost crown, facial swelling, bleeding that won't stop" {...f('emergencyDef')} />
            </Field>
            <Field label="Out of hours emergency number">
              <input style={inputStyle('emergencyNum')} value={emergencyNumber} onChange={e => setEmergencyNumber(e.target.value)} placeholder="e.g. 07700 900000 — given to callers outside opening hours" {...f('emergencyNum')} />
            </Field>
          </SectionCard>

          {/* ── Section 7: Booking Preference ── */}
          <SectionCard icon={<Icons.Calendar />} title="Booking Preference" subtitle="How should Clara handle bookings?">
            <div className="ob-booking-grid">
              {[
                { id: 'direct', label: 'Book directly during the call', desc: 'Clara books appointments in real time using your calendar integration' },
                { id: 'callback', label: 'Take a callback request', desc: "Clara collects the patient's details and your team calls back to confirm" },
              ].map(opt => {
                const isSelected = bookingPreference === opt.id
                return (
                  <div
                    key={opt.id}
                    onClick={() => setBookingPreference(opt.id)}
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
                        <Icons.Check size={10} color="white" />
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
          </SectionCard>

          {/* ── Section 8: Alert Contacts ── */}
          <SectionCard icon={<Icons.Bell />} title="Alert Contacts">
            <div className="ob-two-col">
              <Field label="SMS Alert Number" hint="Receives alerts for emergencies and high-value enquiries">
                <input style={inputStyle('smsAlert')} value={smsAlertNumber} onChange={e => setSmsAlertNumber(e.target.value)} placeholder="e.g. 07700 900123" {...f('smsAlert')} />
              </Field>
              <Field label="Alert Email" hint="Receives notifications for complaints and escalations">
                <input style={inputStyle('alertEmail')} value={alertEmail} onChange={e => setAlertEmail(e.target.value)} placeholder="e.g. alerts@yourpractice.co.uk" {...f('alertEmail')} />
              </Field>
            </div>
          </SectionCard>

          {/* ── Submit ── */}
          {submitError && (
            <div style={{
              fontSize: '13px', color: '#f87171',
              background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '10px', padding: '12px 16px',
            }}>{submitError}</div>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '17px',
              background: submitting ? 'rgba(124,58,237,0.5)' : '#7c3aed',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: submitting ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px',
              transition: 'opacity 0.15s',
            }}
          >
            {submitting ? 'Submitting…' : 'Submit and get started'}
          </button>
        </div>
      </div>

      <style>{`
        .ob-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .ob-voice-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .ob-booking-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 560px) {
          .ob-two-col,
          .ob-voice-grid,
          .ob-booking-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
