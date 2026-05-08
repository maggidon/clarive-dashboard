'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '../lib/supabase'

const SUBMARK = `M34.4958 0.0112218H34.4509C15.3486 0.0112218 0 15.6376 0 34.406C0 35.0092 0.0224436 35.6067 0.0589144 36.2071C6.56755 33.4999 11.7127 32.4282 17.9941 31.5304L18.0671 31.6062C12.8714 35.0288 6.27579 41.4449 3.31043 49.9482C5.95036 54.8072 9.05599 58.5385 13.0594 61.5459C13.8814 45.8915 26.6293 30.1249 45.2659 26.7303L45.2379 26.6125H3.54889C8.43598 18.3196 16.4343 12.4169 27.5804 12.4169C41.5515 12.4169 52.7508 23.7874 52.7508 37.997C52.7508 51.8391 40.968 65.179 25.2462 64.9938C21.7198 64.9489 19.1332 64.5478 15.4019 63.2011C21.097 67.2831 26.8089 68.9579 33.8758 68.9579C52.4787 68.9579 69 53.7075 69 34.2826C69 15.5282 53.3119 0 34.521 0L34.4958 0.0112218Z`

export default function LoginPage() {
  const router = useRouter()
  const supabase = createBrowserSupabaseClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Incorrect email or password.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0a14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'linear-gradient(135deg, #1a1525, #150f20)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px 36px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.4), transparent)',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
          <svg width="24" height="24" viewBox="0 0 69 69" fill="none">
            <path d={SUBMARK} fill="#8942F0" />
          </svg>
          <span style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#f8f7ff',
          }}>CLARIVE AI</span>
        </div>

        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: '22px',
            fontWeight: 700,
            color: '#f8f7ff',
            marginBottom: '6px',
            letterSpacing: '-0.5px',
          }}>Sign in</div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            Access your clinic dashboard
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              letterSpacing: '1px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)', marginBottom: '7px',
            }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '10px', color: '#f8f7ff', fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif", outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{
              display: 'block', fontSize: '11px', fontWeight: 600,
              letterSpacing: '1px', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)', marginBottom: '7px',
            }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '11px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '10px', color: '#f8f7ff', fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif", outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              fontSize: '13px', color: '#f87171',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.2)',
              borderRadius: '8px', padding: '10px 14px',
            }}>{error}</div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              marginTop: '6px', width: '100%', padding: '12px',
              background: loading ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', borderRadius: '10px', color: '#f8f7ff',
              fontSize: '14px', fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: loading ? 'not-allowed' : 'pointer',
              letterSpacing: '0.3px',
            }}
          >{loading ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </div>
    </div>
  )
}