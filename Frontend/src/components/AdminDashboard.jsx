import { useCallback, useEffect, useState } from 'react'
import { getAllStudents, getStudent, deleteStudent } from '../api'
import Avatar from './ui/Avatar'
import AddStudentModal from './AddStudentModal'
import StudentCard from './StudentCard'

export default function AdminDashboard({ session, showToast }) {
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState(null)
  const [selectedRn, setSelectedRn] = useState(null)
  const [loadingList, setLoadingList] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [deletingRn, setDeletingRn] = useState(null)

  const loadList = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await getAllStudents(session.token)
      setStudents(data ?? [])
    } catch (err) {
      showToast(err.message || 'Failed to load students.', 'error')
    } finally {
      setLoadingList(false)
    }
  }, [session.token, showToast])

  useEffect(() => { loadList() }, [loadList])

  const loadDetail = useCallback(async (rn) => {
    setLoadingDetail(true)
    setSelectedRn(rn)
    try {
      const data = await getStudent(session.token, rn)
      setSelected(data)
    } catch (err) {
      showToast(err.message || 'Failed to load student details.', 'error')
    } finally {
      setLoadingDetail(false)
    }
  }, [session.token, showToast])

  const refreshDetail = useCallback(() => {
    if (selectedRn) loadDetail(selectedRn)
  }, [selectedRn, loadDetail])

  async function handleDelete(rn, name, e) {
    e.stopPropagation()
    if (!window.confirm(`Delete student "${name}" (${rn})? This cannot be undone.`)) return
    setDeletingRn(rn)
    try {
      await deleteStudent(session.token, rn)
      showToast(`Student ${name} deleted.`, 'success')
      if (selectedRn === rn) { setSelected(null); setSelectedRn(null) }
      await loadList()
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error')
    } finally {
      setDeletingRn(null)
    }
  }

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-content">
      { }
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
            🔑 <span className="gradient-text">Admin Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <button id="add-student-btn" className="btn btn-primary" onClick={() => setAddOpen(true)}>
          ➕ Add Student
        </button>
      </div>

      <div className="admin-layout">
        { }
        <aside className="student-list-panel">
          <div className="student-list-header">
            <h3 style={{ margin: 0 }}>Students</h3>
            <div className="student-list-search">
              <span className="search-icon">🔍</span>
              <input
                id="student-search"
                className="form-input"
                placeholder="Search by name or roll no…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search students"
              />
            </div>
          </div>

          <div className="student-list-items" role="list">
            {loadingList ? (
              <div className="loading-center" style={{ padding: '32px 16px' }}>
                <span className="spinner" /> Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <span className="empty-state-icon">🔍</span>
                <p>{search ? 'No results found.' : 'No students yet.'}</p>
              </div>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.rollNumber}
                  className={`student-list-item${selectedRn === s.rollNumber ? ' active' : ''}`}
                  onClick={() => loadDetail(s.rollNumber)}
                  role="listitem"
                  aria-selected={selectedRn === s.rollNumber}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && loadDetail(s.rollNumber)}
                >
                  <Avatar name={s.name} size="sm" />
                  <div className="student-list-item-info">
                    <div className="student-list-item-name">{s.name}</div>
                    <div className="student-list-item-rn">{s.rollNumber}</div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm student-list-item-del"
                    onClick={(e) => handleDelete(s.rollNumber, s.name, e)}
                    disabled={deletingRn === s.rollNumber}
                    aria-label={`Delete ${s.name}`}
                  >
                    {deletingRn === s.rollNumber ? '…' : '🗑️'}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        { }
        <main>
          {loadingDetail ? (
            <div className="loading-center" style={{ minHeight: 300 }} aria-busy="true">
              <span className="spinner spinner-lg" />
              <span>Loading student details…</span>
            </div>
          ) : selected ? (
            <StudentCard
              student={selected}
              token={session.token}
              isAdmin
              onRefresh={refreshDetail}
              showToast={showToast}
            />
          ) : (
            <div className="no-data-panel" style={{ minHeight: 300 }}>
              <span className="icon">👈</span>
              <h3>Select a Student</h3>
              <p>Click a student from the list to view their full profile.</p>
            </div>
          )}
        </main>
      </div>

      { }
      <AddStudentModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        token={session.token}
        onAdded={loadList}
        showToast={showToast}
      />
    </div>
  )
}
