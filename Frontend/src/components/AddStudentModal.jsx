import { useState } from 'react'
import Modal from './ui/Modal'
import { addStudent } from '../api'

export default function AddStudentModal({ isOpen, onClose, token, onAdded, showToast }) {
  const initial = { rollNumber: '', name: '', email: '', mobile: '', password: '' }
  const [form, setForm] = useState(initial)
  const [pfpFile, setPfpFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function reset() { setForm(initial); setPfpFile(null); setError('') }

  async function handleSave(e) {
    e.preventDefault()
    const { rollNumber, name, email, mobile, password } = form
    if (!rollNumber.trim() || !name.trim() || !email.trim() || !mobile.trim() || !password.trim()) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('rollNumber', rollNumber.trim())
      fd.append('name', name.trim())
      fd.append('email', email.trim())
      fd.append('mobile', mobile.trim())
      fd.append('password', password.trim())
      if (pfpFile) fd.append('pfp', pfpFile)

      await addStudent(token, fd)
      showToast(`Student ${name} added successfully!`, 'success')
      reset()
      onAdded()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add student.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { reset(); onClose() }}
      title="➕ Add New Student"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose() }} type="button">
            Cancel
          </button>
          <button id="add-student-submit-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Adding…</>
              : '➕ Add Student'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error" role="alert"><span>⚠️</span> {error}</div>}

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="add-rn">Roll Number</label>
          <input
            id="add-rn"
            className="form-input"
            value={form.rollNumber}
            onChange={(e) => handleChange('rollNumber', e.target.value)}
            placeholder="e.g. 22CS001"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="add-name">Full Name</label>
          <input
            id="add-name"
            className="form-input"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Student's full name"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="add-email">Email Address</label>
        <input
          id="add-email"
          className="form-input"
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="student@example.com"
          required
        />
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label" htmlFor="add-mobile">Mobile Number</label>
          <input
            id="add-mobile"
            className="form-input"
            type="tel"
            value={form.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
            placeholder="+91 98765 43210"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="add-password">Initial Password</label>
          <input
            id="add-password"
            className="form-input"
            type="password"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Set a password"
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Profile Picture <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
        <label className="file-input-label" htmlFor="add-pfp-input">
          <input
            id="add-pfp-input"
            type="file"
            accept="image/*"
            onChange={(e) => setPfpFile(e.target.files?.[0] ?? null)}
          />
          {pfpFile ? (
            <>
              <span style={{ fontSize: '1.8rem' }}>🖼️</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pfpFile.name}</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '1.8rem' }}>📷</span>
              <span>Click to upload a photo</span>
            </>
          )}
        </label>
      </div>
    </Modal>
  )
}
