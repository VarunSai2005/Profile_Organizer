import Avatar from './ui/Avatar'

export default function Header({ session, onLogout }) {
  const isAdmin = session?.role === 'Admin'

  return (
    <header className="app-header" role="banner">
      <div className="app-header-brand">
        <div className="app-header-logo" aria-hidden="true">🎓</div>
        <span className="app-header-brand-name">Student Profile Organizer</span>
      </div>

      <div className="app-header-right">
        <div className="app-header-user">
          <div className="user-info-text" aria-label="Signed in user">
            <span className="name">{session?.username}</span>
            <span className="role">{session?.role}</span>
          </div>
          <Avatar name={session?.username ?? '?'} size="sm" />
        </div>

        <span
          className={`badge ${isAdmin ? 'badge-accent' : 'badge-primary'}`}
          aria-label={`Role: ${session?.role}`}
        >
          {isAdmin ? '🔑' : '🧑‍🎓'} {session?.role}
        </span>

        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={onLogout}
          aria-label="Sign out"
        >
          Sign out
        </button>
      </div>
    </header>
  )
}
