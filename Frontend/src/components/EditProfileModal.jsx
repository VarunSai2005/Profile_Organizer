import { useState } from 'react'
import Modal from './ui/Modal'
import { updateStudent } from '../api'

export default function EditProfileModal({ isOpen, onClose, student, token, onSaved, showToast }) {
  const [form, setForm] = useState({
    name: student?.name ?? '',
    email: student?.email ?? '',
    mobile: student?.mobile ?? '',
    password: '',
  })
  const [pfpFile, setPfpFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.mobile.trim()) {
      setError('Name, Email, and Mobile are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('name', form.name.trim())
      fd.append('email', form.email.trim())
      fd.append('mobile', form.mobile.trim())
      if (form.password) fd.append('password', form.password)
      if (pfpFile) fd.append('pfp', pfpFile)

      await updateStudent(token, student.rollNumber, fd)
      showToast('Profile updated successfully!', 'success')
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="✏️ Edit Profile"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} type="button">Cancel</button>
          <button id="save-profile-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</>
              : '💾 Save Changes'}
          </button>
        </>
      }
    >
      {error && <div className="alert alert-error" role="alert"><span>⚠️</span> {error}</div>}

      <div className="form-group">
        <label className="form-label" htmlFor="edit-name">Full Name</label>
        <input
          id="edit-name"
          className="form-input"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Full name"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-email">Email Address</label>
        <input
          id="edit-email"
          className="form-input"
          type="email"
          value={form.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="student@example.com"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="edit-mobile">Mobile Number</label>
        <input
          id="edit-mobile"
          className="form-input"
          type="tel"
          value={form.mobile}
          onChange={(e) => handleChange('mobile', e.target.value)}
          placeholder="+91 98765 43210"
          required
        />
      </div>

      <div className="divider" />

      <div className="form-group">
        <label className="form-label" htmlFor="edit-password">
          New Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span>
        </label>
        <input
          id="edit-password"
          className="form-input"
          type="password"
          value={form.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="New password"
          autoComplete="new-password"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Profile Picture</label>
        <label className="file-input-label" htmlFor="edit-pfp-input">
          <input
            id="edit-pfp-input"
            type="file"
            accept="image/*"
            onChange={(e) => setPfpFile(e.target.files?.[0] ?? null)}
          />
          {pfpFile ? (
            <>
              <span style={{ fontSize: '1.8rem' }}>🖼️</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pfpFile.name}</span>
              <span style={{ fontSize: '0.75rem' }}>Click to change</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: '1.8rem' }}>🖼️</span>
              <span>Click to upload a new photo</span>
            </>
          )}
        </label>
      </div>
    </Modal>
  )
}
