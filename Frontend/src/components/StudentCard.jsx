import { useState } from 'react'
import Avatar from './ui/Avatar'
import CodingProfilePanel from './CodingProfilePanel'
import AttachmentsPanel from './AttachmentsPanel'
import EditProfileModal from './EditProfileModal'

export default function StudentCard({ student, token, isAdmin = false, isOwnProfile = false, onRefresh, showToast }) {
  const [editOpen, setEditOpen] = useState(false)
  const canEdit = isAdmin || isOwnProfile

  return (
    <div className="anim-fade">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="student-card-header">
          <Avatar name={student.name} size="lg" />
          <div className="student-card-info">
            <div className="student-card-name">{student.name}</div>

            <div className="student-info-grid" style={{ marginTop: 12 }}>
              <div className="info-row">
                <span className="label">Roll Number</span>
                <span className="value" style={{ fontFamily: 'monospace', letterSpacing: '0.04em' }}>
                  {student.rollNumber}
                </span>
              </div>
              <div className="info-row">
                <span className="label">Email</span>
                <span className="value">
                  <a href={`mailto:${student.email}`}>{student.email}</a>
                </span>
              </div>
              <div className="info-row">
                <span className="label">Mobile</span>
                <span className="value">
                  <a href={`tel:${student.mobile}`}>{student.mobile}</a>
                </span>
              </div>
            </div>
          </div>

          {canEdit && (
            <div>
              <button
                id="edit-profile-btn"
                className="btn btn-secondary btn-sm"
                onClick={() => setEditOpen(true)}
              >
                ✏️ Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <CodingProfilePanel
        profile={student.codingProfile ?? null}
        rollNumber={student.rollNumber}
        token={token}
        onRefresh={onRefresh}
        canEdit={canEdit}
        showToast={showToast}
      />

      <div className="grid-2" style={{ marginTop: 20 }}>
        <AttachmentsPanel
          type="achievement"
          files={student.achievements ?? []}
          rollNumber={student.rollNumber}
          token={token}
          onRefresh={onRefresh}
          canEdit={canEdit}
          showToast={showToast}
        />
        <AttachmentsPanel
          type="certificate"
          files={student.certificates ?? []}
          rollNumber={student.rollNumber}
          token={token}
          onRefresh={onRefresh}
          canEdit={canEdit}
          showToast={showToast}
        />
      </div>

      {editOpen && (
        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          student={student}
          token={token}
          onSaved={onRefresh}
          showToast={showToast}
        />
      )}
    </div>
  )
}
