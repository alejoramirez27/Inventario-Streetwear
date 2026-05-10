'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#09090b',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: '380px', backgroundColor: '#18181b',
        border: '1px solid #27272a', borderRadius: '16px', padding: '40px',
      }}>

        {/* Marca */}
        <div style={{ marginBottom: '36px', textAlign: 'center' }}>
          <p style={{ fontSize: '11px', color: '#52525b', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px' }}>
            Sistema de
          </p>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', letterSpacing: '3px', marginBottom: '4px' }}>
            INVENTARIO
          </h1>
          <p style={{ fontSize: '11px', color: '#52525b', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Streetwear
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>Correo electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: '#1c0a0a', border: '1px solid #7f1d1d',
              borderRadius: '8px', padding: '12px 16px', marginBottom: '20px',
              color: '#ef4444', fontSize: '13px',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', backgroundColor: '#ffffff', color: '#09090b',
              border: 'none', borderRadius: '8px', padding: '13px',
              fontSize: '13px', fontWeight: '700', letterSpacing: '2px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>
        </form>

        <p style={{ fontSize: '11px', color: '#3f3f46', textAlign: 'center', marginTop: '24px' }}>
          Plataforma Inventario v1.0
        </p>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: '11px', color: '#71717a', textTransform: 'uppercase',
  letterSpacing: '1px', display: 'block', marginBottom: '8px',
}

const inputStyle: React.CSSProperties = {
  width: '100%', backgroundColor: '#09090b',
  border: '1px solid #27272a', borderRadius: '8px',
  padding: '12px 14px', fontSize: '14px', color: '#ffffff',
  outline: 'none', boxSizing: 'border-box',
}
