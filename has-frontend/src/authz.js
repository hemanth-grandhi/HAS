/**
 * Maps Spring Security authorities (ROLE_*) to navigation and route access.
 */

export const ROLES = {
  ADMINISTRATOR: 'ROLE_ADMINISTRATOR',
  RECEPTIONIST: 'ROLE_RECEPTIONIST',
  CATERING_MANAGER: 'ROLE_CATERING_MANAGER',
  HOTEL_MANAGER: 'ROLE_HOTEL_MANAGER',
}

export function hasAnyAuthority(authorities, ...roleConstants) {
  if (!Array.isArray(authorities) || !roleConstants.length) return false
  return roleConstants.some((r) => authorities.includes(r))
}

function isCateringOnly(authorities) {
  return (
    hasAnyAuthority(authorities, ROLES.CATERING_MANAGER) &&
    !hasAnyAuthority(
      authorities,
      ROLES.ADMINISTRATOR,
      ROLES.RECEPTIONIST,
      ROLES.HOTEL_MANAGER,
    )
  )
}

/**
 * Sidebar navigation items for the signed-in user.
 */
export function getNavItems(authorities) {
  const a = authorities ?? []
  const items = []

  if (
    hasAnyAuthority(a, ROLES.ADMINISTRATOR, ROLES.RECEPTIONIST, ROLES.HOTEL_MANAGER) &&
    !isCateringOnly(a)
  ) {
    items.push({ to: '/dashboard', label: 'Dashboard' })
  }

  if (hasAnyAuthority(a, ROLES.ADMINISTRATOR, ROLES.RECEPTIONIST)) {
    items.push(
      { to: '/rooms', label: 'Room Management' },
      { to: '/booking', label: 'Reservations' },
      { to: '/check-in', label: 'Check-In' },
      { to: '/billing', label: 'Billing & Checkout' },
      { to: '/guests', label: 'Guests' },
    )
  }

  if (hasAnyAuthority(a, ROLES.ADMINISTRATOR, ROLES.CATERING_MANAGER)) {
    if (!items.some((it) => it.to === '/catering')) {
      items.push({ to: '/catering', label: 'Catering Services' })
    }
  }

  if (hasAnyAuthority(a, ROLES.ADMINISTRATOR, ROLES.HOTEL_MANAGER)) {
    items.push(
      { to: '/tariff', label: 'Tariff Revision' },
      { to: '/occupancy', label: 'Occupancy Analysis' },
    )
  }

  return items
}

/**
 * First path the user is allowed to open (for default redirect).
 */
export function getDefaultRoute(authorities) {
  const items = getNavItems(authorities)
  return items[0]?.to ?? '/catering'
}

/**
 * Whether the user may open a path (direct URL / bookmark guard).
 */
export function canAccessPath(authorities, path) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  const allowed = getNavItems(authorities).some((it) => it.to === normalized)
  if (allowed) return true
  if (normalized === '/' || normalized === '') return true
  return false
}
