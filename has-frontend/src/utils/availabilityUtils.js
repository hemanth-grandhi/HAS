/**
 * Room availability checker
 * Checks room availability against existing check-ins
 */

import { datesOverlap } from './dateUtils'

/**
 * Get available rooms for a date range
 * @param {Array} allRooms - All rooms from backend
 * @param {Array} activeCheckIns - All active check-ins
 * @param {String} checkInDate - Selected check-in date (YYYY-MM-DD)
 * @param {String} checkOutDate - Selected check-out date (YYYY-MM-DD)
 * @param {String} roomType - Optional: filter by room type (e.g., "Single AC")
 * @returns {Object} { totalAvailable, byType: {...}, allRooms: [...] }
 */
export const getAvailableRooms = (allRooms = [], activeCheckIns = [], checkInDate, checkOutDate, roomType = null) => {
  if (!checkInDate || !checkOutDate || !allRooms.length) {
    return { totalAvailable: 0, byType: {}, allRooms: [] }
  }

  const bookedRoomIds = new Set()
  
  // Mark rooms as booked if they overlap with requested dates
  activeCheckIns.forEach((checkIn) => {
    if (checkIn.room?.roomId && datesOverlap(checkInDate, checkOutDate, checkIn.checkInDate, checkIn.expectedCheckOutDate)) {
      bookedRoomIds.add(checkIn.room.roomId)
    }
  })

  // Filter rooms
  let available = allRooms.filter((room) => !bookedRoomIds.has(room.id))
  
  if (roomType) {
    available = available.filter((r) => r.roomType === roomType)
  }

  // Group by type
  const byType = {}
  available.forEach((room) => {
    const type = room.roomType || 'Unknown'
    if (!byType[type]) {
      byType[type] = []
    }
    byType[type].push(room)
  })

  return {
    totalAvailable: available.length,
    byType,
    allRooms: available,
  }
}

/**
 * Check if a specific room is available
 */
export const isRoomAvailable = (roomId, checkInDate, checkOutDate, activeCheckIns = []) => {
  return !activeCheckIns.some(
    (checkIn) =>
      checkIn.room?.roomId === roomId &&
      datesOverlap(checkInDate, checkOutDate, checkIn.checkInDate, checkIn.expectedCheckOutDate),
  )
}

/**
 * Get all unique room types
 */
export const getRoomTypes = (rooms = []) => {
  const types = new Set()
  rooms.forEach((room) => {
    if (room.roomType) types.add(room.roomType)
  })
  return Array.from(types).sort()
}

/**
 * Get rooms grouped by floor (if floor info available)
 */
export const getRoomsByFloor = (rooms = []) => {
  const byFloor = {}
  rooms.forEach((room) => {
    const floorNum = parseInt(room.number?.toString().charAt(0)) || 0
    if (!byFloor[floorNum]) {
      byFloor[floorNum] = []
    }
    byFloor[floorNum].push(room)
  })
  return byFloor
}
