/**
 * Date utilities for booking system
 */

export const formatDateISO = (date) => {
  if (!date) return ''
  if (typeof date === 'string') return date
  return date.toISOString().split('T')[0]
}

export const formatDateDisplay = (dateString) => {
  if (!dateString) return '--'
  try {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateString
  }
}

export const calculateDuration = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 0
  const checkIn = new Date(checkInDate + 'T00:00:00')
  const checkOut = new Date(checkOutDate + 'T00:00:00')
  const diff = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const isValidDateRange = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return false
  const checkIn = new Date(checkInDate + 'T00:00:00')
  const checkOut = new Date(checkOutDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return checkIn >= today && checkOut > checkIn
}

export const getMinCheckOutDate = (checkInDate) => {
  if (!checkInDate) return ''
  const checkIn = new Date(checkInDate + 'T00:00:00')
  checkIn.setDate(checkIn.getDate() + 1)
  return checkIn.toISOString().split('T')[0]
}

export const getMinCheckInDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

export const dateIsInRange = (date, startDate, endDate) => {
  const checkDate = new Date(date + 'T00:00:00')
  const start = new Date(startDate + 'T00:00:00')
  const end = new Date(endDate + 'T00:00:00')
  return checkDate >= start && checkDate < end
}

export const datesOverlap = (start1, end1, start2, end2) => {
  const a_start = new Date(start1 + 'T00:00:00').getTime()
  const a_end = new Date(end1 + 'T00:00:00').getTime()
  const b_start = new Date(start2 + 'T00:00:00').getTime()
  const b_end = new Date(end2 + 'T00:00:00').getTime()
  
  return a_start < b_end && b_start < a_end
}
