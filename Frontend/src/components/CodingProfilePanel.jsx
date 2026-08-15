import { useState } from 'react'
import Modal from './ui/Modal'
import { addCodingProfile, updateCodingProfile, deleteCodingProfile } from '../api'

const PLATFORMS = [
  { key: 'codeForces', label: 'Codeforces',    icon: '⚡', color: '#f59e0b', urlBase: 'https://codeforces.com/profile/' },
  { key: 'leetCode',   label: 'LeetCode',       icon: '🔥', color: '#f97316', urlBase: 'https://leetcode.com/' },
  { key: 'cses',       label: 'CSES',           icon: '📚', color: '#6366f1', urlBase: 'https://cses.fi/user/' },
  { key: 'gfg',        label: 'GeeksForGeeks',  icon: '🌿', color: '#10b981', urlBase: 'https://www.geeksforgeeks.org/user/' },
]

function EditCodingModal({ isOpen, onClose, profile, rollNumber, token, onSaved, showToast }) {
  const isNew = !profile
  const [form, setForm] = useState(
    profile
      ? { codeForces: profile.codeForces, leetCode: profile.leetCode, cses: profile.cses, gfg: profile.gfg }
      : { codeForces: '', leetCode: '', cses: '', gfg: '' }
  )
  const [saving, setSaving] = useState(false)

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { rollNumber, ...form }
      if (isNew) {
        await addCodingProfile(token, payload)
      } else {
        await updateCodingProfile(token, rollNumber, payload)
      }
      showToast('Coding profiles saved!', 'success')
      onSaved()
      onClose()
    } catch (err) {
      showToast(err.message || 'Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isNew ? '➕ Add Coding Profiles' : '✏️ Edit Coding Profiles'}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</> : 'Save'}
          </button>
        </>
      }
    >
      {PLATFORMS.map((p) => (
        <div className="form-group" key={p.key}>
          <label className="form-label" htmlFor={`cp-${p.key}`}>
            {p.icon} {p.label} — username
          </label>
          <input
            id={`cp-${p.key}`}
            className="form-input"
            value={form[p.key]}
            onChange={(e) => handleChange(p.key, e.target.value)}
            placeholder={`Your ${p.label} username`}
          />
        </div>
      ))}
    </Modal>
  )
}

export default function CodingProfilePanel({ profile, rollNumber, token, onRefresh, canEdit = false, showToast }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm('Remove all coding profiles for this student?')) return
    setDeleting(true)
    try {
      await deleteCodingProfile(token, rollNumber)
      showToast('Coding profiles removed.', 'success')
      onRefresh()
    } catch (err) {
      showToast(err.message || 'Failed to delete.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <div className="card anim-up" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <h3>💻 Coding Profiles</h3>
          {canEdit && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button id="edit-coding-btn" className="btn btn-ghost btn-sm" onClick={() => setEditOpen(true)}>
                {profile ? '✏️ Edit' : '➕ Add'}
              </button>
              {profile && (
                <button className="btn btn-danger btn-sm" onClick={handleDelete} disabled={deleting}>
                  {deleting ? '…' : '🗑️'}
                </button>
              )}
            </div>
          )}
        </div>

        {profile ? (
          <div className="coding-platform-grid">
            {PLATFORMS.map((p) => {
              const username = profile[p.key]
              if (!username) return null
              return (
                <a
                  key={p.key}
                  href={`${p.urlBase}${username}`}
                  target="_blank"
                  rel="noreferrer"
                  className="coding-platform-card"
                  aria-label={`${p.label} profile: ${username}`}
                >
                  <span className="platform-icon">{p.icon}</span>
                  <span className="platform-name">{p.label}</span>
                  <span className="platform-username" style={{ color: p.color }}>
                    {username}
                  </span>
                </a>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-state-icon">💻</span>
            <p>No coding profiles added yet.</p>
            {canEdit && (
              <button className="btn btn-primary btn-sm" onClick={() => setEditOpen(true)}>
                Add Profiles
              </button>
            )}
          </div>
        )}
      </div>

      <EditCodingModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        rollNumber={rollNumber}
        token={token}
        onSaved={onRefresh}
        showToast={showToast}
      />
    </>
  )
}
