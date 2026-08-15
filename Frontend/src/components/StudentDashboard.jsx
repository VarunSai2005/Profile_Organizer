import { useCallback, useEffect, useState } from 'react'
import { getStudent } from '../api'
import StudentCard from './StudentCard'

export default function StudentDashboard({ session, showToast }) {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getStudent(session.token, session.username)
      setStudent(data)
    } catch (err) {
      setError(err.message || 'Failed to load your profile.')
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="loading-center" aria-busy="true">
        <span className="spinner spinner-lg" />
        <span>Loading your profile…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error" style={{ maxWidth: 500, margin: '48px auto' }} role="alert">
        <span>⚠️</span> {error}
      </div>
    )
  }

  if (!student) return null

  return (
    <div className="page-content">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
          👋 Welcome back, <span className="gradient-text">{student.name.split(' ')[0]}</span>
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Manage your profile, coding handles, achievements, and certificates below.
        </p>
      </div>

      <StudentCard
        student={student}
        token={session.token}
        isOwnProfile
        onRefresh={load}
        showToast={showToast}
      />
    </div>
  )
}
