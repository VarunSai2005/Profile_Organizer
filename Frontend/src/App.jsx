import { useState } from 'react'
import './index.css'
import './App.css'
import Header from './components/Header'
import Login from './components/Login'
import AdminDashboard from './components/AdminDashboard'
import StudentDashboard from './components/StudentDashboard'
import { useToast } from './components/ui/Toast'

function readSession() {
  try {
    return JSON.parse(localStorage.getItem('spo_session')) ?? null
  } catch {
    return null
  }
}

export default function App() {
  const [session, setSession] = useState(readSession)
  const { showToast, ToastContainer } = useToast()

  function handleLogin(data) {
    localStorage.setItem('spo_session', JSON.stringify(data))
    setSession(data)
  }

  function handleLogout() {
    localStorage.removeItem('spo_session')
    setSession(null)
  }

  if (!session) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer />
      </>
    )
  }

  return (
    <div className="app-shell">
      <Header session={session} onLogout={handleLogout} />

      {session.role === 'Admin' ? (
        <AdminDashboard session={session} showToast={showToast} />
      ) : (
        <StudentDashboard session={session} showToast={showToast} />
      )}

      <ToastContainer />
    </div>
  )
}
