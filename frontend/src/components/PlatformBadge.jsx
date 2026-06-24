import { PLATFORMS } from '../api/client.js'

export default function PlatformBadge({ value }) {
  const platform = PLATFORMS.find(p => p.value === value)
  return (
    <span className="badge" style={{ background: `${platform?.color}15`, color: platform?.color }}>
      <span className="badge-dot" />{platform?.label || value}
    </span>
  )
}
