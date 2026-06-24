import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { password })
      localStorage.setItem('hb_token', res.data.token)
      navigate('/monitoring')
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--paper)'
    }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: 340 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>
          Hallo Bunda
        </div>
        <div className="page-eyebrow" style={{ marginBottom: 20 }}>Content Ops · Internal</div>

        {error && <div style={{ color: '#B91C1C', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div className="field">
          <label>Password Tim</label>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Masukkan password"
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 8 }}>
          {loading ? 'Masuk...' : 'Masuk'}
        </button>
      </form>
    </div>
  )
}
