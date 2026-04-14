export function calcRoomCharge({ roomRatePerNight, checkInDateISO, durationDays, checkoutDateISO }) {
  const start = new Date(checkInDateISO)
  const end = checkoutDateISO ? new Date(checkoutDateISO) : new Date()
  // Use min of requested duration and actual days elapsed for a realistic invoice.
  const requestedNights = Math.max(1, Math.floor(durationDays))
  const elapsedNights = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)))
  const nights = Math.min(requestedNights, elapsedNights)
  return nights * roomRatePerNight
}

export function calcCateringCharge({ items }) {
  // items: [{ name, qty, unitPrice }]
  return (items ?? []).reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0)
}

