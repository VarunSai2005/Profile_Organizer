import { useState } from 'react'
import { loginAdmin, loginStudent, registerAdmin, registerStudent } from '../api'

export default function Login({ onLogin }) {
  const [role, setRole] = useState('student')
  const [isSignup, setIsSignup] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [pfpFile, setPfpFile] = useState(null)

  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  function switchRole(newRole) {
    setRole(newRole)
    setError('')
    setSuccessMsg('')
  }

  function toggleSignup(signupState) {
    setIsSignup(signupState)
    setError('')
    setSuccessMsg('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (isSignup) {
      if (role === 'admin') {
        if (!username.trim() || !password.trim()) {
          setError('Username and password are required.')
          return
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          return
        }
        setSubmitting(true)
        try {
          await registerAdmin(username.trim(), password)
          setSuccessMsg('Admin account created! You can now sign in.')
          setIsSignup(false)
        } catch (err) {
          setError(err.message || 'Admin registration failed. An admin may already exist.')
        } finally {
          setSubmitting(false)
        }
        return
      } else {
        if (!username.trim() || !name.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
          setError('All student fields are required.')
          return
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          return
        }
        setSubmitting(true)
        try {
          const fd = new FormData()
          fd.append('rollNumber', username.trim())
          fd.append('name', name.trim())
          fd.append('email', email.trim())
          fd.append('mobile', mobile.trim())
          fd.append('password', password.trim())
          if (pfpFile) fd.append('pfp', pfpFile)

          const data = await registerStudent(fd)
          onLogin(data)
        } catch (err) {
          setError(err.message || 'Student registration failed.')
        } finally {
          setSubmitting(false)
        }
        return
      }
    }

    setSubmitting(true)
    try {
      const data =
        role === 'admin'
          ? await loginAdmin(username, password)
          : await loginStudent(username, password)
      onLogin(data)
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please check your credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="login-page">
      <form className="login-panel" style={{ width: isSignup && role === 'student' ? 'min(100%, 540px)' : 'min(100%, 430px)' }} onSubmit={handleSubmit} noValidate>
        <div className="login-panel-header">
          <div className="login-logo" aria-hidden="true">🎓</div>
          <h1>Student Profile<br />Organizer</h1>
          <p>
            {isSignup
              ? role === 'admin'
                ? 'Register initial admin account'
                : 'Create student account'
              : 'Sign in to access your dashboard'}
          </p>
        </div>

        <div className="login-role-tabs" role="group" aria-label="Role selection">
          <button
            id="tab-student"
            type="button"
            className={`role-tab${role === 'student' ? ' active' : ''}`}
            onClick={() => switchRole('student')}
            aria-pressed={role === 'student'}
          >
            🧑‍🎓 Student
          </button>
          <button
            id="tab-admin"
            type="button"
            className={`role-tab${role === 'admin' ? ' active' : ''}`}
            onClick={() => switchRole('admin')}
            aria-pressed={role === 'admin'}
          >
            🔑 Admin
          </button>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-base)', padding: 4, borderRadius: 'var(--radius-md)', gap: 4 }}>
          <button
            type="button"
            className={`btn btn-sm ${!isSignup ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
            onClick={() => toggleSignup(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isSignup ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1 }}
            onClick={() => toggleSignup(true)}
          >
            Sign Up
          </button>
        </div>

        {isSignup && role === 'admin' && (
          <div
            style={{
              background: 'var(--accent-soft)',
              border: '1px solid rgba(34,211,238,0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.8rem',
              color: 'var(--accent)',
            }}
          >
            ℹ️ Admin signup registers the initial administrator when no admin exists yet.
          </div>
        )}

        {isSignup && role === 'student' ? (
          <>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-rn">Roll Number</label>
                <input
                  id="reg-rn"
                  className="form-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. 22CS001"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  className="form-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input
                  id="reg-email"
                  className="form-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-mobile">Mobile Number</label>
                <input
                  id="reg-mobile"
                  className="form-input"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password">Confirm Password</label>
                <input
                  id="reg-confirm-password"
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Photo (optional)</label>
              <label className="file-input-label" htmlFor="reg-pfp-input" style={{ padding: 14 }}>
                <input
                  id="reg-pfp-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPfpFile(e.target.files?.[0] ?? null)}
                />
                {pfpFile ? (
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>🖼️ {pfpFile.name}</span>
                ) : (
                  <span>📷 Click to upload photo</span>
                )}
              </label>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label className="form-label" htmlFor="login-username">
                {role === 'student' ? 'Roll Number' : 'Username'}
              </label>
              <input
                id="login-username"
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'student' ? 'e.g. 22CS001' : 'admin'}
                required
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: '1rem', lineHeight: 1, padding: '4px',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {isSignup && role === 'admin' && (
              <div className="form-group">
                <label className="form-label" htmlFor="admin-confirm-password">Confirm Password</label>
                <input
                  id="admin-confirm-password"
                  className="form-input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            )}
          </>
        )}

        {error && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" role="status">
            <span>✓</span> {successMsg}
          </div>
        )}

        <button id="login-submit" className="login-btn" type="submit" disabled={submitting}>
          {submitting ? (
            <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> {isSignup ? 'Creating account…' : 'Signing in…'}</>
          ) : (
            isSignup
              ? role === 'admin'
                ? 'Create Admin Account →'
                : 'Create Student Account →'
              : 'Sign in →'
          )}
        </button>
      </form>
    </main>
  )
}
