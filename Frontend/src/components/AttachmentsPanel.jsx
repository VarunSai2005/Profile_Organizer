import { useRef, useState } from 'react'
import Modal from './ui/Modal'
import { getCertificateUrl, getCertificateDownloadUrl, getAchievementUrl, getAchievementDownloadUrl, uploadCertificate, deleteCertificate, uploadAchievement, deleteAchievement } from '../api'

function UploadModal({ isOpen, onClose, title, onUpload }) {
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  function reset() { setFile(null); setDesc('') }

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      await onUpload(file, desc || file.name)
      reset()
      onClose()
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0]
    if (f) { setFile(f); if (!desc) setDesc(f.name.replace(/\.[^.]+$/, '')) }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { reset(); onClose() }}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn-secondary" onClick={() => { reset(); onClose() }} type="button">Cancel</button>
          <button className="btn btn-primary" onClick={handleUpload} disabled={!file || uploading}>
            {uploading
              ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Uploading…</>
              : '⬆️ Upload'}
          </button>
        </>
      }
    >
      <label className="file-input-label" htmlFor="attach-file-input">
        <input
          id="attach-file-input"
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
        />
        {file ? (
          <>
            <span style={{ fontSize: '2rem' }}>📄</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{file.name}</span>
            <span style={{ fontSize: '0.75rem' }}>({(file.size / 1024).toFixed(1)} KB) — click to change</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '2rem' }}>📁</span>
            <span>Click to choose a PDF or image</span>
          </>
        )}
      </label>

      <div className="form-group">
        <label className="form-label" htmlFor="attach-desc">Description / Label</label>
        <input
          id="attach-desc"
          className="form-input"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="e.g. HackerRank Gold Certificate"
        />
      </div>
    </Modal>
  )
}

export default function AttachmentsPanel({ type, files = [], rollNumber, token, onRefresh, canEdit = false, showToast }) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deletingDesc, setDeletingDesc] = useState(null)

  const isCert = type === 'certificate'
  const label   = isCert ? 'Certificate' : 'Achievement'
  const labelPl = isCert ? 'Certificates' : 'Achievements'
  const icon    = isCert ? '🏆' : '🥇'
  const getUrl  = isCert ? getCertificateUrl : getAchievementUrl
  const getDownloadUrl = isCert ? getCertificateDownloadUrl : getAchievementDownloadUrl

  async function handleUpload(file, desc) {
    try {
      if (isCert) {
        await uploadCertificate(token, rollNumber, file, desc)
      } else {
        await uploadAchievement(token, rollNumber, file, desc)
      }
      showToast(`${label} uploaded!`, 'success')
      onRefresh()
    } catch (err) {
      showToast(err.message || 'Upload failed.', 'error')
      throw err
    }
  }

  async function handleDelete(desc) {
    if (!window.confirm(`Delete "${desc}"? This cannot be undone.`)) return
    setDeletingDesc(desc)
    try {
      if (isCert) {
        await deleteCertificate(token, rollNumber, desc)
      } else {
        await deleteAchievement(token, rollNumber, desc)
      }
      showToast(`${label} deleted.`, 'success')
      onRefresh()
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error')
    } finally {
      setDeletingDesc(null)
    }
  }

  return (
    <>
      <div className="card anim-up" style={{ animationDelay: '0.15s' }}>
        <div className="section-header">
          <h3>{icon} {labelPl}</h3>
          {canEdit && (
            <button
              id={`upload-${type}-btn`}
              className="btn btn-ghost btn-sm"
              onClick={() => setUploadOpen(true)}
            >
              ⬆️ Upload
            </button>
          )}
        </div>

        {files.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">{icon}</span>
            <p>No {labelPl.toLowerCase()} uploaded yet.</p>
            {canEdit && (
              <button className="btn btn-primary btn-sm" onClick={() => setUploadOpen(true)}>
                Upload {label}
              </button>
            )}
          </div>
        ) : (
          <div className="attachments-grid">
            {files.map((f) => (
              <div className="attachment-item" key={f.id}>
                {f.contentType?.startsWith('image/') && (
                  <img className="attachment-preview" src={getUrl(f.id)} alt="" />
                )}
                <div className="attachment-icon">📄</div>
                <div className="attachment-info">
                  <div className="attachment-desc" title={f.description}>{f.description}</div>
                  <div className="attachment-type">{f.contentType || 'File'}</div>
                </div>
                <div className="attachment-actions">
                  <a
                    href={getUrl(f.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    aria-label={`Open ${f.description}`}
                  >
                    Open
                  </a>
                  <a
                    href={getDownloadUrl(f.id)}
                    className="btn btn-secondary btn-sm"
                    aria-label={`Download ${f.fileName || f.description}`}
                  >
                    Download
                  </a>
                  {canEdit && (
                    <button
                      className="btn btn-danger btn-sm btn-icon"
                      onClick={() => handleDelete(f.description)}
                      disabled={deletingDesc === f.description}
                      aria-label={`Delete ${f.description}`}
                    >
                      {deletingDesc === f.description
                        ? <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                        : '🗑️'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title={`⬆️ Upload ${label}`}
        onUpload={handleUpload}
      />
    </>
  )
}
