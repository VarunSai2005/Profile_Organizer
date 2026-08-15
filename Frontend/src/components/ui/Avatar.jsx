export default function Avatar({ name = '', pfpUrl = null, size = 'md' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  return (
    <div className={`avatar avatar-${size}`} aria-label={`Avatar for ${name}`}>
      {pfpUrl ? (
        <img src={pfpUrl} alt={name} />
      ) : (
        <div className="avatar-initials">{initials || '?'}</div>
      )}
    </div>
  )
}
