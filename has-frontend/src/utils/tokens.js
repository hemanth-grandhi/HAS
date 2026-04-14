export function makeToken(prefix = 'HMS') {
  const rand = Math.floor(Math.random() * 900000 + 100000)
  return `${prefix}-${rand}`
}

export function makeGuestId() {
  const rand = Math.floor(Math.random() * 9000 + 1000)
  return `FG-${rand}`
}

