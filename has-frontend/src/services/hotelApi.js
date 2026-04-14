import { api } from './api.js'

const STORAGE_KEY = 'hms.frontend.mock.v3'

const TIER_DISCOUNTS = {
  SILVER: 5,
  GOLD: 10,
  PLATINUM: 15,
}

const DEFAULT_COUNTRY_CODE = 'IN'
const DEFAULT_GENDER = 'Prefer not to say'
const DEFAULT_ID_PROOF = 'Aadhaar'
const DAY_MS = 24 * 60 * 60 * 1000

let memoryState = null

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function startOfToday() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}

function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function withTime(date, hour = 14, minute = 0) {
  const value = new Date(date)
  value.setHours(hour, minute, 0, 0)
  return value
}

function toIsoDate(date) {
  return new Date(date).toISOString().slice(0, 10)
}

function toIsoDateTime(date, hour = 14, minute = 0) {
  return withTime(date, hour, minute).toISOString()
}

function parseDate(value) {
  if (!value) return null

  const text = String(value)
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(text)
    ? new Date(`${text}T00:00:00`)
    : new Date(text)

  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function diffNights(startValue, endValue) {
  const start = parseDate(startValue)
  const end = parseDate(endValue)
  if (!start || !end) return 0
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / DAY_MS))
}

function sanitizeContact(contact) {
  return String(contact ?? '').replace(/\D/g, '')
}

function splitName(name = '') {
  const clean = String(name).trim()
  if (!clean) return { firstName: '', lastName: '' }
  const [firstName, ...rest] = clean.split(/\s+/)
  return {
    firstName,
    lastName: rest.join(' '),
  }
}

function makeFullName(firstName, lastName, fallback = 'Guest') {
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  return fullName || fallback
}

function createHistoryEntry({ type, token, roomNumber, checkInDate, checkOutDate, status }) {
  return {
    type,
    token,
    roomNumber,
    checkInDate,
    checkOutDate,
    status,
  }
}

function getStorage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function persistState(state) {
  memoryState = clone(state)
  const storage = getStorage()
  if (storage) {
    storage.setItem(STORAGE_KEY, JSON.stringify(memoryState))
  }
}

function createSeedState() {
  const today = startOfToday()

  const rooms = [
    { id: 1, number: '101', floor: 1, roomType: 'Single Room', climate: 'Non-AC', bedType: 'Single', ratePerNight: 2800 },
    { id: 2, number: '102', floor: 1, roomType: 'Single Room', climate: 'AC', bedType: 'Queen', ratePerNight: 3400 },
    { id: 3, number: '103', floor: 1, roomType: 'Double Room', climate: 'Non-AC', bedType: 'Double', ratePerNight: 4300 },
    { id: 4, number: '104', floor: 1, roomType: 'Double Room', climate: 'AC', bedType: 'King', ratePerNight: 4900 },
    { id: 5, number: '105', floor: 1, roomType: 'Deluxe Room', climate: 'AC', bedType: 'King', ratePerNight: 6500 },
    { id: 6, number: '106', floor: 1, roomType: 'Suite', climate: 'AC', bedType: 'King', ratePerNight: 10800 },
    { id: 7, number: '201', floor: 2, roomType: 'Single Room', climate: 'Non-AC', bedType: 'Single', ratePerNight: 2950 },
    { id: 8, number: '202', floor: 2, roomType: 'Single Room', climate: 'AC', bedType: 'Queen', ratePerNight: 3550 },
    { id: 9, number: '203', floor: 2, roomType: 'Double Room', climate: 'AC', bedType: 'Double', ratePerNight: 5100 },
    { id: 10, number: '204', floor: 2, roomType: 'Deluxe Room', climate: 'AC', bedType: 'King', ratePerNight: 6900 },
    { id: 11, number: '205', floor: 2, roomType: 'Suite', climate: 'AC', bedType: 'King', ratePerNight: 11400 },
    { id: 12, number: '206', floor: 2, roomType: 'Double Room', climate: 'Non-AC', bedType: 'Twin', ratePerNight: 4500 },
    { id: 13, number: '301', floor: 3, roomType: 'Single Room', climate: 'AC', bedType: 'Queen', ratePerNight: 3700 },
    { id: 14, number: '302', floor: 3, roomType: 'Double Room', climate: 'AC', bedType: 'Double', ratePerNight: 5400 },
    { id: 15, number: '303', floor: 3, roomType: 'Deluxe Room', climate: 'Non-AC', bedType: 'King', ratePerNight: 6100 },
    { id: 16, number: '304', floor: 3, roomType: 'Deluxe Room', climate: 'AC', bedType: 'King', ratePerNight: 7200 },
    { id: 17, number: '305', floor: 3, roomType: 'Suite', climate: 'AC', bedType: 'King', ratePerNight: 11900 },
    { id: 18, number: '306', floor: 3, roomType: 'Double Room', climate: 'AC', bedType: 'Twin', ratePerNight: 5250 },
  ]

  const guests = [
    {
      guestId: 2001,
      firstName: 'Meera',
      lastName: 'Sharma',
      name: 'Meera Sharma',
      gender: 'Female',
      countryCode: 'IN',
      contactNumber: '9876500011',
      idProofType: 'Aadhaar',
      idProofFileName: 'meera-aadhaar.pdf',
      roomType: 'Double Room',
      arrivalDate: toIsoDate(addDays(today, -1)),
      expectedCheckOutDate: toIsoDate(addDays(today, 2)),
      stayCount: 7,
      lastVisitedOn: toIsoDate(addDays(today, 2)),
      history: [
        createHistoryEntry({
          type: 'Check-in',
          token: 'STAY-10451',
          roomNumber: '104',
          checkInDate: toIsoDate(addDays(today, -1)),
          checkOutDate: toIsoDate(addDays(today, 2)),
          status: 'Active',
        }),
      ],
    },
    {
      guestId: 2002,
      firstName: 'Arjun',
      lastName: 'Reddy',
      name: 'Arjun Reddy',
      gender: 'Male',
      countryCode: 'IN',
      contactNumber: '9876500012',
      idProofType: 'Passport',
      idProofFileName: 'arjun-passport.pdf',
      roomType: 'Suite',
      arrivalDate: toIsoDate(addDays(today, -2)),
      expectedCheckOutDate: toIsoDate(addDays(today, 1)),
      stayCount: 10,
      lastVisitedOn: toIsoDate(addDays(today, 1)),
      history: [
        createHistoryEntry({
          type: 'Check-in',
          token: 'STAY-20518',
          roomNumber: '205',
          checkInDate: toIsoDate(addDays(today, -2)),
          checkOutDate: toIsoDate(addDays(today, 1)),
          status: 'Active',
        }),
      ],
    },
    {
      guestId: 2003,
      firstName: 'Priya',
      lastName: 'Nair',
      name: 'Priya Nair',
      gender: 'Female',
      countryCode: 'IN',
      contactNumber: '9876500013',
      idProofType: 'Driving License',
      idProofFileName: 'priya-license.pdf',
      roomType: 'Double Room',
      arrivalDate: toIsoDate(today),
      expectedCheckOutDate: toIsoDate(addDays(today, 3)),
      stayCount: 5,
      lastVisitedOn: toIsoDate(addDays(today, 3)),
      history: [
        createHistoryEntry({
          type: 'Check-in',
          token: 'STAY-30276',
          roomNumber: '302',
          checkInDate: toIsoDate(today),
          checkOutDate: toIsoDate(addDays(today, 3)),
          status: 'Active',
        }),
      ],
    },
    {
      guestId: 2004,
      firstName: 'Karthik',
      lastName: 'Iyer',
      name: 'Karthik Iyer',
      gender: 'Male',
      countryCode: 'IN',
      contactNumber: '9876500014',
      idProofType: 'Passport',
      idProofFileName: 'karthik-passport.pdf',
      roomType: 'Deluxe Room',
      arrivalDate: toIsoDate(addDays(today, 2)),
      expectedCheckOutDate: toIsoDate(addDays(today, 5)),
      stayCount: 9,
      lastVisitedOn: toIsoDate(addDays(today, 5)),
      history: [
        createHistoryEntry({
          type: 'Reservation',
          token: 'RES-20471',
          roomNumber: '204',
          checkInDate: toIsoDate(addDays(today, 2)),
          checkOutDate: toIsoDate(addDays(today, 5)),
          status: 'Confirmed',
        }),
      ],
    },
    {
      guestId: 2005,
      firstName: 'Sana',
      lastName: 'Khan',
      name: 'Sana Khan',
      gender: 'Female',
      countryCode: 'IN',
      contactNumber: '9876500015',
      idProofType: 'Aadhaar',
      idProofFileName: 'sana-aadhaar.pdf',
      roomType: 'Deluxe Room',
      arrivalDate: toIsoDate(addDays(today, -7)),
      expectedCheckOutDate: toIsoDate(addDays(today, -5)),
      stayCount: 6,
      lastVisitedOn: toIsoDate(addDays(today, -5)),
      history: [
        createHistoryEntry({
          type: 'Check-in',
          token: 'STAY-10511',
          roomNumber: '105',
          checkInDate: toIsoDate(addDays(today, -7)),
          checkOutDate: toIsoDate(addDays(today, -5)),
          status: 'Completed',
        }),
      ],
    },
    {
      guestId: 2006,
      firstName: 'Rohit',
      lastName: 'Verma',
      name: 'Rohit Verma',
      gender: 'Male',
      countryCode: 'IN',
      contactNumber: '9876500016',
      idProofType: 'Voter ID',
      idProofFileName: 'rohit-voter-id.pdf',
      roomType: 'Double Room',
      arrivalDate: toIsoDate(addDays(today, -10)),
      expectedCheckOutDate: toIsoDate(addDays(today, -8)),
      stayCount: 3,
      lastVisitedOn: toIsoDate(addDays(today, -8)),
      history: [
        createHistoryEntry({
          type: 'Check-in',
          token: 'STAY-10344',
          roomNumber: '103',
          checkInDate: toIsoDate(addDays(today, -10)),
          checkOutDate: toIsoDate(addDays(today, -8)),
          status: 'Completed',
        }),
      ],
    },
    {
      guestId: 2007,
      firstName: 'Ananya',
      lastName: 'Das',
      name: 'Ananya Das',
      gender: 'Female',
      countryCode: 'IN',
      contactNumber: '9876500017',
      idProofType: 'Aadhaar',
      idProofFileName: 'ananya-aadhaar.pdf',
      roomType: 'Single Room',
      arrivalDate: toIsoDate(addDays(today, 1)),
      expectedCheckOutDate: toIsoDate(addDays(today, 3)),
      stayCount: 2,
      lastVisitedOn: toIsoDate(addDays(today, 3)),
      history: [
        createHistoryEntry({
          type: 'Reservation',
          token: 'RES-10244',
          roomNumber: '102',
          checkInDate: toIsoDate(addDays(today, 1)),
          checkOutDate: toIsoDate(addDays(today, 3)),
          status: 'Confirmed',
        }),
      ],
    },
    {
      guestId: 2008,
      firstName: 'David',
      lastName: 'Chen',
      name: 'David Chen',
      gender: 'Male',
      countryCode: 'US',
      contactNumber: '4155552211',
      idProofType: 'Passport',
      idProofFileName: 'david-passport.pdf',
      roomType: 'Single Room',
      arrivalDate: toIsoDate(addDays(today, -15)),
      expectedCheckOutDate: toIsoDate(addDays(today, -13)),
      stayCount: 4,
      lastVisitedOn: toIsoDate(addDays(today, -13)),
      history: [
        createHistoryEntry({
          type: 'Check-in',
          token: 'STAY-20165',
          roomNumber: '201',
          checkInDate: toIsoDate(addDays(today, -15)),
          checkOutDate: toIsoDate(addDays(today, -13)),
          status: 'Completed',
        }),
      ],
    },
    {
      guestId: 2009,
      firstName: 'Fatima',
      lastName: 'Noor',
      name: 'Fatima Noor',
      gender: 'Female',
      countryCode: 'IN',
      contactNumber: '9876500018',
      idProofType: 'Passport',
      idProofFileName: 'fatima-passport.pdf',
      roomType: 'Suite',
      arrivalDate: toIsoDate(addDays(today, -22)),
      expectedCheckOutDate: toIsoDate(addDays(today, -19)),
      stayCount: 8,
      lastVisitedOn: toIsoDate(addDays(today, -19)),
      history: [
        createHistoryEntry({
          type: 'Check-in',
          token: 'STAY-30593',
          roomNumber: '305',
          checkInDate: toIsoDate(addDays(today, -22)),
          checkOutDate: toIsoDate(addDays(today, -19)),
          status: 'Completed',
        }),
      ],
    },
  ]

  const frequentGuests = [
    { frequentGuestId: 2001, guestId: 2001, tier: 'GOLD', rewardPoints: 1420 },
    { frequentGuestId: 2002, guestId: 2002, tier: 'PLATINUM', rewardPoints: 2140 },
    { frequentGuestId: 2003, guestId: 2003, tier: 'SILVER', rewardPoints: 620 },
    { frequentGuestId: 2004, guestId: 2004, tier: 'GOLD', rewardPoints: 1160 },
    { frequentGuestId: 2005, guestId: 2005, tier: 'SILVER', rewardPoints: 540 },
  ]

  const checkIns = [
    {
      checkInId: 7001,
      tokenNumber: 'STAY-10451',
      guestId: 2001,
      roomId: 4,
      advancePayment: 3000,
      checkInDate: toIsoDateTime(addDays(today, -1), 14, 0),
      expectedCheckOutDate: toIsoDateTime(addDays(today, 2), 11, 0),
      actualCheckOutDate: null,
      createdAtISO: toIsoDateTime(addDays(today, -1), 14, 0),
    },
    {
      checkInId: 7002,
      tokenNumber: 'STAY-20518',
      guestId: 2002,
      roomId: 11,
      advancePayment: 5000,
      checkInDate: toIsoDateTime(addDays(today, -2), 13, 0),
      expectedCheckOutDate: toIsoDateTime(addDays(today, 1), 11, 0),
      actualCheckOutDate: null,
      createdAtISO: toIsoDateTime(addDays(today, -2), 13, 0),
    },
    {
      checkInId: 7003,
      tokenNumber: 'STAY-30276',
      guestId: 2003,
      roomId: 14,
      advancePayment: 2500,
      checkInDate: toIsoDateTime(today, 15, 0),
      expectedCheckOutDate: toIsoDateTime(addDays(today, 3), 11, 0),
      actualCheckOutDate: null,
      createdAtISO: toIsoDateTime(today, 15, 0),
    },
    {
      checkInId: 7004,
      tokenNumber: 'STAY-10511',
      guestId: 2005,
      roomId: 5,
      advancePayment: 3000,
      checkInDate: toIsoDateTime(addDays(today, -7), 14, 0),
      expectedCheckOutDate: toIsoDateTime(addDays(today, -5), 11, 0),
      actualCheckOutDate: toIsoDateTime(addDays(today, -5), 10, 30),
      createdAtISO: toIsoDateTime(addDays(today, -7), 14, 0),
    },
    {
      checkInId: 7005,
      tokenNumber: 'STAY-10344',
      guestId: 2006,
      roomId: 3,
      advancePayment: 1500,
      checkInDate: toIsoDateTime(addDays(today, -10), 14, 0),
      expectedCheckOutDate: toIsoDateTime(addDays(today, -8), 11, 0),
      actualCheckOutDate: toIsoDateTime(addDays(today, -8), 9, 45),
      createdAtISO: toIsoDateTime(addDays(today, -10), 14, 0),
    },
    {
      checkInId: 7006,
      tokenNumber: 'STAY-20165',
      guestId: 2008,
      roomId: 7,
      advancePayment: 2000,
      checkInDate: toIsoDateTime(addDays(today, -15), 12, 30),
      expectedCheckOutDate: toIsoDateTime(addDays(today, -13), 11, 0),
      actualCheckOutDate: toIsoDateTime(addDays(today, -13), 10, 0),
      createdAtISO: toIsoDateTime(addDays(today, -15), 12, 30),
    },
    {
      checkInId: 7007,
      tokenNumber: 'STAY-30593',
      guestId: 2009,
      roomId: 17,
      advancePayment: 7000,
      checkInDate: toIsoDateTime(addDays(today, -22), 14, 30),
      expectedCheckOutDate: toIsoDateTime(addDays(today, -19), 11, 0),
      actualCheckOutDate: toIsoDateTime(addDays(today, -19), 10, 10),
      createdAtISO: toIsoDateTime(addDays(today, -22), 14, 30),
    },
  ]

  const reservations = [
    {
      reservationId: 6001,
      tokenNumber: 'RES-20471',
      guestId: 2004,
      roomId: 10,
      roomType: 'Deluxe Room',
      startDate: toIsoDateTime(addDays(today, 2), 14, 0),
      endDate: toIsoDateTime(addDays(today, 5), 11, 0),
      createdAtISO: toIsoDateTime(today, 9, 30),
    },
    {
      reservationId: 6002,
      tokenNumber: 'RES-10244',
      guestId: 2007,
      roomId: 2,
      roomType: 'Single Room',
      startDate: toIsoDateTime(addDays(today, 1), 14, 0),
      endDate: toIsoDateTime(addDays(today, 3), 11, 0),
      createdAtISO: toIsoDateTime(today, 10, 15),
    },
  ]

  const cateringOrders = [
    {
      orderId: 8001,
      tokenNumber: 'STAY-10451',
      guestId: 2001,
      createdAtISO: toIsoDateTime(today, 8, 45),
      items: [
        { name: 'Breakfast Buffet', qty: 2, unitPrice: 420 },
      ],
    },
    {
      orderId: 8002,
      tokenNumber: 'STAY-20518',
      guestId: 2002,
      createdAtISO: toIsoDateTime(addDays(today, -1), 20, 10),
      items: [
        { name: 'Chef Special Dinner', qty: 1, unitPrice: 960 },
        { name: 'Coffee', qty: 2, unitPrice: 90 },
      ],
    },
    {
      orderId: 8003,
      tokenNumber: 'STAY-30276',
      guestId: 2003,
      createdAtISO: toIsoDateTime(today, 18, 30),
      items: [
        { name: 'Tea', qty: 2, unitPrice: 60 },
        { name: 'Snacks', qty: 1, unitPrice: 240 },
      ],
    },
  ]

  return {
    rooms,
    guests,
    frequentGuests,
    checkIns,
    reservations,
    cateringOrders,
    bookingRequests: [],
    bills: [],
    counters: {
      bookingRequestId: 5001,
      guestId: 2010,
      reservationId: 6003,
      checkInId: 7008,
      orderId: 8004,
      billId: 9001,
      tokenId: 1,
    },
  }
}

function readState() {
  if (memoryState) {
    return clone(memoryState)
  }

  const storage = getStorage()
  if (storage) {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        memoryState = JSON.parse(raw)
        return clone(memoryState)
      } catch {
        storage.removeItem(STORAGE_KEY)
      }
    }
  }

  const initialState = createSeedState()
  persistState(initialState)
  return clone(initialState)
}

function mutateState(updater) {
  const state = readState()
  const result = updater(state)
  persistState(state)
  return result
}

function nextId(state, key) {
  const value = state.counters[key]
  state.counters[key] += 1
  return value
}

function nextToken(state, prefix) {
  const tokenValue = state.counters.tokenId
  state.counters.tokenId += 1
  return `${prefix}-${String(tokenValue).padStart(4, '0')}`
}

function findRoom(state, roomId) {
  return state.rooms.find((room) => room.id === roomId)
}

function findGuest(state, guestId) {
  return state.guests.find((guest) => guest.guestId === guestId)
}

function findFrequentGuest(state, guestId) {
  return state.frequentGuests.find((guest) => guest.guestId === guestId)
}

function getRoomStatus(state, roomId) {
  const activeStay = state.checkIns.find(
    (checkIn) => checkIn.roomId === roomId && !checkIn.actualCheckOutDate,
  )

  return activeStay ? 'OCCUPIED' : 'AVAILABLE'
}

function normalizeRoom(state, room) {
  const activeStay = state.checkIns.find(
    (checkIn) => checkIn.roomId === room.id && !checkIn.actualCheckOutDate,
  )
  const reservedStay = state.reservations.find((reservation) => reservation.roomId === room.id)
  const activeGuest = activeStay ? findGuest(state, activeStay.guestId) : null
  const status = getRoomStatus(state, room.id)

  return {
    ...room,
    status,
    availabilityStatus: status,
    currentGuestName: activeGuest?.name || '',
    activeToken: activeStay?.tokenNumber || '',
    nextReservationDate: reservedStay ? reservedStay.startDate : '',
    occupancyType: room.roomType,
    acStatus: room.climate,
    baseTariff: room.ratePerNight,
    currentTariff: room.ratePerNight,
  }
}

function normalizeGuest(state, guest) {
  const frequentGuest = findFrequentGuest(state, guest.guestId)

  return {
    ...guest,
    frequentGuestId: frequentGuest?.frequentGuestId ?? null,
    frequentGuestTier: frequentGuest?.tier ?? null,
    discountPct: frequentGuest ? TIER_DISCOUNTS[frequentGuest.tier] ?? 0 : 0,
  }
}

function normalizeFrequentGuest(state, frequentGuest) {
  const guest = findGuest(state, frequentGuest.guestId)

  return {
    id: frequentGuest.frequentGuestId,
    frequentGuestId: frequentGuest.frequentGuestId,
    guestId: frequentGuest.guestId,
    name: guest?.name || 'Guest',
    contact: guest?.contactNumber || '',
    tier: frequentGuest.tier,
    discountPct: TIER_DISCOUNTS[frequentGuest.tier] ?? 0,
    rewardPoints: frequentGuest.rewardPoints,
    stayCount: guest?.stayCount ?? 0,
    lastVisitedOn: guest?.lastVisitedOn || '',
  }
}

function normalizeReservation(state, reservation) {
  const guest = findGuest(state, reservation.guestId)
  const room = findRoom(state, reservation.roomId)

  return {
    ...reservation,
    guest: guest ? normalizeGuest(state, guest) : null,
    room: room ? normalizeRoom(state, room) : null,
    message: `Reservation confirmed for ${guest?.name || 'Guest'} in Room ${room?.number || '--'}.`,
  }
}

function normalizeCheckIn(state, checkIn) {
  const guest = findGuest(state, checkIn.guestId)
  const room = findRoom(state, checkIn.roomId)

  return {
    ...checkIn,
    guest: guest ? normalizeGuest(state, guest) : null,
    room: room ? normalizeRoom(state, room) : null,
    message: `Room ${room?.number || '--'} is now occupied by ${guest?.name || 'Guest'}.`,
  }
}

function normalizeCateringOrder(order) {
  const orderTotal = order.items.reduce(
    (sum, item) => sum + Number(item.qty || 0) * Number(item.unitPrice || 0),
    0,
  )

  return {
    id: order.orderId,
    createdAtISO: order.createdAtISO,
    orderTotal,
    items: order.items,
  }
}

function toComparableName(value) {
  return String(value || '').trim().toLowerCase()
}

function stayOverlaps(startA, endA, startB, endB) {
  const leftStart = parseDate(startA)
  const leftEnd = parseDate(endA)
  const rightStart = parseDate(startB)
  const rightEnd = parseDate(endB)

  if (!leftStart || !leftEnd || !rightStart || !rightEnd) {
    return false
  }

  return leftStart < rightEnd && rightStart < leftEnd
}

function getGuestIdFromSelection(state, payload = {}) {
  if (payload.guestId) return Number(payload.guestId)
  if (!payload.frequentGuestId) return null
  const frequentGuest = state.frequentGuests.find(
    (item) => item.frequentGuestId === Number(payload.frequentGuestId),
  )
  return frequentGuest?.guestId ?? null
}

function syncGuestProfile(state, payload = {}, options = {}) {
  const existingGuestId = getGuestIdFromSelection(state, payload)
  const { firstName: splitFirstName, lastName: splitLastName } = splitName(payload.name)
  const firstName = payload.firstName || splitFirstName || 'Guest'
  const lastName = payload.lastName || splitLastName || ''
  const fullName = makeFullName(firstName, lastName)
  const normalizedContact = sanitizeContact(payload.contactNumber || payload.contact)

  let guest =
    state.guests.find((item) => item.guestId === existingGuestId) ||
    state.guests.find(
      (item) =>
        normalizedContact &&
        sanitizeContact(item.contactNumber) === normalizedContact &&
        toComparableName(item.name) === toComparableName(fullName),
    )

  if (!guest) {
    guest = {
      guestId: nextId(state, 'guestId'),
      stayCount: 0,
      history: [],
    }
    state.guests.unshift(guest)
  }

  guest.firstName = firstName
  guest.lastName = lastName
  guest.name = fullName
  guest.gender = payload.gender || guest.gender || DEFAULT_GENDER
  guest.countryCode = payload.countryCode || payload.country || guest.countryCode || DEFAULT_COUNTRY_CODE
  guest.contactNumber = normalizedContact || guest.contactNumber || ''
  guest.idProofType = payload.idProofType || guest.idProofType || DEFAULT_ID_PROOF
  guest.idProofFileName = payload.idProofFileName || guest.idProofFileName || ''
  guest.roomType = payload.roomType || guest.roomType || ''
  guest.arrivalDate = payload.arrivalDate || guest.arrivalDate || ''
  guest.expectedCheckOutDate = payload.expectedCheckOutDate || guest.expectedCheckOutDate || ''
  guest.lastVisitedOn = payload.expectedCheckOutDate || guest.lastVisitedOn || ''

  if (options.recordStay) {
    guest.stayCount = (guest.stayCount || 0) + 1
  }

  return guest
}

function addGuestHistory(guest, entry) {
  const nextHistory = [entry, ...(guest.history || [])]
  guest.history = nextHistory.slice(0, 8)
}

function getAvailableRoomsForRange(state, checkInDate, checkOutDate, roomType) {
  return state.rooms.filter((room) => {
    if (roomType && room.roomType !== roomType) return false

    const overlapsActiveStay = state.checkIns.some(
      (checkIn) =>
        checkIn.roomId === room.id &&
        !checkIn.actualCheckOutDate &&
        stayOverlaps(checkInDate, checkOutDate, checkIn.checkInDate, checkIn.expectedCheckOutDate),
    )

    const overlapsReservation = state.reservations.some(
      (reservation) =>
        reservation.roomId === room.id &&
        stayOverlaps(checkInDate, checkOutDate, reservation.startDate, reservation.endDate),
    )

    return !overlapsActiveStay && !overlapsReservation
  })
}

function chooseRoom(state, payload, checkInDate, checkOutDate) {
  const roomId = payload.roomId ? Number(payload.roomId) : null
  const availableRooms = getAvailableRoomsForRange(state, checkInDate, checkOutDate, payload.roomType)

  if (roomId) {
    const selectedRoom = availableRooms.find((room) => room.id === roomId)
    if (!selectedRoom) {
      throw new Error('The selected room is no longer available for those dates.')
    }
    return selectedRoom
  }

  const firstAvailable = availableRooms[0]
  if (!firstAvailable) {
    throw new Error(`No ${payload.roomType || 'rooms'} are available for the selected dates.`)
  }

  return firstAvailable
}

function normalizeBookingRequest(state, request) {
  const availableRooms = (request.availableRoomIds || [])
    .map((roomId) => findRoom(state, roomId))
    .filter(Boolean)
    .map((room) => normalizeRoom(state, room))

  const selectedRoom = request.selectedRoomId
    ? normalizeRoom(state, findRoom(state, request.selectedRoomId))
    : null

  return {
    ...request,
    availableRooms,
    selectedRoom,
  }
}

function finalizeReservation(state, payload) {
  const room = chooseRoom(
    state,
    payload,
    payload.arrivalDate || payload.startDate,
    payload.expectedCheckOutDate || payload.endDate,
  )
  const guest = syncGuestProfile(state, payload, { recordStay: true })
  const reservation = {
    reservationId: nextId(state, 'reservationId'),
    tokenNumber: nextToken(state, 'RES'),
    guestId: guest.guestId,
    roomId: room.id,
    roomType: room.roomType,
    startDate: payload.startDate || toIsoDateTime(payload.arrivalDate, 14, 0),
    endDate: payload.endDate || toIsoDateTime(payload.expectedCheckOutDate, 11, 0),
    createdAtISO: new Date().toISOString(),
  }

  addGuestHistory(
    guest,
    createHistoryEntry({
      type: 'Reservation',
      token: reservation.tokenNumber,
      roomNumber: room.number,
      checkInDate: toIsoDate(payload.arrivalDate),
      checkOutDate: toIsoDate(payload.expectedCheckOutDate),
      status: 'Confirmed',
    }),
  )

  state.reservations.unshift(reservation)

  return {
    ...normalizeReservation(state, reservation),
    message: `Reservation created for ${guest.name} in Room ${room.number}.`,
  }
}

function finalizeCheckIn(state, payload) {
  const room = chooseRoom(state, payload, payload.arrivalDate, payload.expectedCheckOutDate)
  const guest = syncGuestProfile(state, payload, { recordStay: true })
  const checkIn = {
    checkInId: nextId(state, 'checkInId'),
    tokenNumber: nextToken(state, 'STAY'),
    guestId: guest.guestId,
    roomId: room.id,
    advancePayment: Number(payload.advancePayment || 0),
    checkInDate: toIsoDateTime(payload.arrivalDate, 14, 0),
    expectedCheckOutDate: toIsoDateTime(payload.expectedCheckOutDate, 11, 0),
    actualCheckOutDate: null,
    createdAtISO: new Date().toISOString(),
  }

  addGuestHistory(
    guest,
    createHistoryEntry({
      type: 'Check-in',
      token: checkIn.tokenNumber,
      roomNumber: room.number,
      checkInDate: payload.arrivalDate,
      checkOutDate: payload.expectedCheckOutDate,
      status: 'Active',
    }),
  )

  state.checkIns.unshift(checkIn)

  return {
    ...normalizeCheckIn(state, checkIn),
    message: `Room ${room.number} checked in successfully for ${guest.name}.`,
  }
}

function activeStayForToken(state, token) {
  return state.checkIns.find(
    (checkIn) => checkIn.tokenNumber === token && !checkIn.actualCheckOutDate,
  )
}

function billingPreviewFromState(state, token, extraDiscountType = 'none', extraDiscountValue = 0) {
  const checkIn = activeStayForToken(state, token)

  if (!checkIn) {
    throw new Error('Active stay not found for the selected token.')
  }

  const guest = findGuest(state, checkIn.guestId)
  const room = findRoom(state, checkIn.roomId)
  const frequentGuest = findFrequentGuest(state, checkIn.guestId)
  const cateringEntries = state.cateringOrders
    .filter((order) => order.tokenNumber === token)
    .sort((left, right) => new Date(right.createdAtISO) - new Date(left.createdAtISO))
    .map(normalizeCateringOrder)

  const roomCharges = diffNights(checkIn.checkInDate, new Date()) * Number(room.ratePerNight || 0)
  const cateringCharges = cateringEntries.reduce((sum, entry) => sum + entry.orderTotal, 0)
  const subtotal = roomCharges + cateringCharges
  const baseDiscountPct = frequentGuest ? TIER_DISCOUNTS[frequentGuest.tier] ?? 0 : 0
  const baseDiscountAmount = subtotal * (baseDiscountPct / 100)

  let extraDiscountAmount = 0
  if (extraDiscountType === 'amount') {
    extraDiscountAmount = Math.max(0, Number(extraDiscountValue || 0))
  } else if (extraDiscountType === 'percent') {
    extraDiscountAmount = subtotal * (Math.max(0, Number(extraDiscountValue || 0)) / 100)
  }

  const totalDiscountAmount = baseDiscountAmount + extraDiscountAmount
  const totalPayable = Math.max(
    0,
    subtotal - totalDiscountAmount - Number(checkIn.advancePayment || 0),
  )

  return {
    token,
    createdAtISO: new Date().toISOString(),
    guestName: guest?.name || 'Guest',
    contact: guest?.contactNumber || '',
    frequentGuestTier: frequentGuest?.tier || null,
    roomNumber: room?.number || '--',
    roomType: room?.roomType || '',
    bedType: room?.bedType || '',
    roomCharges,
    cateringCharges,
    baseDiscountAmount,
    extraDiscountAmount,
    totalDiscountAmount,
    totalPayable,
    cateringEntries,
  }
}

export const mockHotelApi = {
  async listRooms() {
    const state = readState()
    return state.rooms
      .map((room) => normalizeRoom(state, room))
      .sort((left, right) => Number(left.number) - Number(right.number))
  },

  async listCheckIns() {
    const state = readState()
    return state.checkIns
      .map((checkIn) => normalizeCheckIn(state, checkIn))
      .sort((left, right) => new Date(right.checkInDate) - new Date(left.checkInDate))
  },

  async listGuests() {
    const state = readState()
    return state.guests
      .map((guest) => normalizeGuest(state, guest))
      .sort((left, right) => new Date(right.lastVisitedOn || 0) - new Date(left.lastVisitedOn || 0))
  },

  async listFrequentGuests() {
    const state = readState()
    return state.frequentGuests
      .map((frequentGuest) => normalizeFrequentGuest(state, frequentGuest))
      .sort((left, right) => right.rewardPoints - left.rewardPoints)
  },

  async createReservation(payload) {
    return mutateState((state) => finalizeReservation(state, payload))
  },

  async createWalkInCheckIn(payload) {
    return mutateState((state) => finalizeCheckIn(state, payload))
  },

  async createCheckInFromReservation(payload) {
    return mutateState((state) => {
      const reservationIndex = state.reservations.findIndex(
        (reservation) => reservation.reservationId === Number(payload.reservationId),
      )

      if (reservationIndex < 0) {
        throw new Error('Reservation not found.')
      }

      const reservation = state.reservations[reservationIndex]
      const room = findRoom(state, reservation.roomId)
      const guest = findGuest(state, reservation.guestId)
      const checkIn = {
        checkInId: nextId(state, 'checkInId'),
        tokenNumber: reservation.tokenNumber.replace('RES', 'STAY'),
        guestId: reservation.guestId,
        roomId: reservation.roomId,
        advancePayment: Number(payload.advancePayment || 0),
        checkInDate: reservation.startDate,
        expectedCheckOutDate: reservation.endDate,
        actualCheckOutDate: null,
        createdAtISO: new Date().toISOString(),
      }

      state.reservations.splice(reservationIndex, 1)
      state.checkIns.unshift(checkIn)

      if (guest?.history?.length) {
        guest.history = guest.history.map((entry) =>
          entry.token === reservation.tokenNumber
            ? { ...entry, type: 'Check-in', status: 'Active', token: checkIn.tokenNumber }
            : entry,
        )
      }

      return {
        ...normalizeCheckIn(state, checkIn),
        message: `Reservation converted to an active stay in Room ${room?.number || '--'}.`,
      }
    })
  },

  async lookupReservations(params) {
    const state = readState()
    const nameQuery = toComparableName(params?.name)
    const contactQuery = sanitizeContact(params?.contactNumber)

    return state.reservations
      .filter((reservation) => {
        const guest = findGuest(state, reservation.guestId)
        if (!guest) return false

        const matchesName = nameQuery ? toComparableName(guest.name).includes(nameQuery) : true
        const matchesContact = contactQuery
          ? sanitizeContact(guest.contactNumber).includes(contactQuery)
          : true

        return matchesName && matchesContact
      })
      .map((reservation) => normalizeReservation(state, reservation))
  },

  async updateGuest(guestId, payload) {
    return mutateState((state) => {
      const guest = state.guests.find((item) => item.guestId === Number(guestId))

      if (!guest) {
        throw new Error('Guest not found.')
      }

      const { firstName, lastName } = splitName(payload.name || guest.name)
      guest.firstName = payload.firstName || firstName || guest.firstName
      guest.lastName = payload.lastName || lastName || guest.lastName
      guest.name = makeFullName(guest.firstName, guest.lastName, guest.name)
      guest.contactNumber = sanitizeContact(payload.contactNumber || guest.contactNumber)
      guest.gender = payload.gender || guest.gender
      guest.idProofType = payload.idProofType || guest.idProofType
      guest.idProofFileName = payload.idProofFileName || guest.idProofFileName

      return normalizeGuest(state, guest)
    })
  },

  async registerFrequentGuest(guestId, tier = 'SILVER') {
    return mutateState((state) => {
      const guest = findGuest(state, Number(guestId))

      if (!guest) {
        throw new Error('Guest not found.')
      }

      const existing = findFrequentGuest(state, Number(guestId))
      if (existing) {
        existing.tier = tier || existing.tier
        return normalizeFrequentGuest(state, existing)
      }

      const frequentGuest = {
        frequentGuestId: Number(guestId),
        guestId: Number(guestId),
        tier: tier || 'SILVER',
        rewardPoints: 200,
      }
      state.frequentGuests.unshift(frequentGuest)
      return normalizeFrequentGuest(state, frequentGuest)
    })
  },

  async checkAvailability(checkInDate, checkOutDate, roomType) {
    const state = readState()
    const availableRooms = getAvailableRoomsForRange(state, checkInDate, checkOutDate, roomType)
      .map((room) => normalizeRoom(state, room))

    const byType = availableRooms.reduce((grouped, room) => {
      const key = room.roomType || 'Unknown'
      grouped[key] = grouped[key] ? [...grouped[key], room] : [room]
      return grouped
    }, {})

    return {
      totalAvailable: availableRooms.length,
      byType,
      allRooms: availableRooms,
    }
  },

  async getDashboardSummary() {
    const state = readState()
    const activeCheckIns = state.checkIns.filter((checkIn) => !checkIn.actualCheckOutDate)
    const recentGuests = state.guests
      .slice()
      .sort((left, right) => new Date(right.lastVisitedOn || 0) - new Date(left.lastVisitedOn || 0))
      .slice(0, 4)
      .map((guest) => normalizeGuest(state, guest))

    return {
      totalRooms: state.rooms.length,
      occupiedRooms: activeCheckIns.length,
      availableRooms: state.rooms.length - activeCheckIns.length,
      activeReservationsCount: state.reservations.length,
      frequentGuestsCount: state.frequentGuests.length,
      guestHistoryCount: state.guests.length,
      occupiedRoomNumbers: activeCheckIns
        .map((checkIn) => findRoom(state, checkIn.roomId)?.number)
        .filter(Boolean),
      recentGuests,
    }
  },

  async getOccupancyTrend({ days = 14 } = {}) {
    const state = readState()
    const totalRooms = state.rooms.length
    const today = startOfToday()

    const points = Array.from({ length: days }, (_, index) => {
      const day = addDays(today, -(days - index - 1))
      const dayStart = toIsoDateTime(day, 0, 0)
      const dayEnd = toIsoDateTime(addDays(day, 1), 0, 0)

      const occupiedRoomIds = new Set(
        state.checkIns
          .filter((checkIn) =>
            stayOverlaps(
              dayStart,
              dayEnd,
              checkIn.checkInDate,
              checkIn.actualCheckOutDate || checkIn.expectedCheckOutDate,
            ),
          )
          .map((checkIn) => checkIn.roomId),
      )

      const occupiedRooms = occupiedRoomIds.size
      const occupancyPct = totalRooms
        ? Math.round(((occupiedRooms * 100) / totalRooms) * 100) / 100
        : 0

      return {
        dayISO: toIsoDate(day),
        dateLabel: day.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        occupiedRooms,
        occupancyPct,
      }
    })

    const averageOccupancyPct = points.length
      ? points.reduce((sum, point) => sum + point.occupancyPct, 0) / points.length
      : 0

    return {
      totalRooms,
      averageOccupancyPct,
      points,
    }
  },

  async listActiveReservations() {
    const state = readState()
    return state.checkIns
      .filter((checkIn) => !checkIn.actualCheckOutDate)
      .map((checkIn) => {
        const guest = findGuest(state, checkIn.guestId)
        const room = findRoom(state, checkIn.roomId)

        return {
          token: checkIn.tokenNumber,
          roomNumber: room?.number || '--',
          guestName: guest?.name || 'Guest',
          roomType: room?.roomType || '',
          checkInDate: checkIn.checkInDate,
          expectedCheckOutDate: checkIn.expectedCheckOutDate,
        }
      })
  },

  async listCateringForToken(token) {
    const state = readState()
    return state.cateringOrders
      .filter((order) => order.tokenNumber === token)
      .sort((left, right) => new Date(right.createdAtISO) - new Date(left.createdAtISO))
      .map(normalizeCateringOrder)
  },

  async addCateringItem({ token, items = [] }) {
    return mutateState((state) => {
      const activeStay = activeStayForToken(state, token)
      if (!activeStay) {
        throw new Error('Only active guests can receive catering orders.')
      }

      const order = {
        orderId: nextId(state, 'orderId'),
        tokenNumber: token,
        guestId: activeStay.guestId,
        createdAtISO: new Date().toISOString(),
        items: items.map((item) => ({
          name: item.name,
          qty: Number(item.qty || 0),
          unitPrice: Number(item.unitPrice || 0),
        })),
      }

      state.cateringOrders.unshift(order)
      return normalizeCateringOrder(order)
    })
  },

  async getBillingPreview({ token, extraDiscountType = 'none', extraDiscountValue = 0 }) {
    const state = readState()
    return billingPreviewFromState(state, token, extraDiscountType, extraDiscountValue)
  },

  async checkout({ token }) {
    return mutateState((state) => {
      const checkIn = activeStayForToken(state, token)
      if (!checkIn) {
        throw new Error('Active stay not found for checkout.')
      }

      const preview = billingPreviewFromState(state, token)
      checkIn.actualCheckOutDate = new Date().toISOString()

      const bill = {
        billId: nextId(state, 'billId'),
        tokenNumber: token,
        guestId: checkIn.guestId,
        roomCharges: preview.roomCharges,
        cateringCharges: preview.cateringCharges,
        discountAmount: preview.totalDiscountAmount,
        advancePayment: checkIn.advancePayment,
        balancePayable: preview.totalPayable,
        createdAtISO: new Date().toISOString(),
      }

      const guest = findGuest(state, checkIn.guestId)
      if (guest?.history?.length) {
        guest.history = guest.history.map((entry) =>
          entry.token === token
            ? { ...entry, status: 'Completed', checkOutDate: toIsoDate(checkIn.actualCheckOutDate) }
            : entry,
        )
        guest.lastVisitedOn = toIsoDate(checkIn.actualCheckOutDate)
      }

      const frequentGuest = findFrequentGuest(state, checkIn.guestId)
      if (frequentGuest) {
        frequentGuest.rewardPoints += 120
      }

      state.bills.unshift(bill)
      return bill
    })
  },

  async resetMockData() {
    const state = createSeedState()
    persistState(state)
    return true
  },
}

const useBackend =
  String(import.meta.env.VITE_USE_BACKEND ?? 'true').toLowerCase() !== 'false'

const backendUsername = import.meta.env.VITE_BACKEND_USERNAME || 'admin'
const backendPassword = import.meta.env.VITE_BACKEND_PASSWORD || 'admin123'
let sessionReadyPromise = null

function parseRoomType(room) {
  const occupancy = room?.occupancyType || 'Single'
  const ac = room?.acStatus || 'AC'
  return `${occupancy} ${ac}`.trim()
}

function toFrontendRoom(room, index = 0) {
  const fallbackNumber = String(101 + index)
  const roomType = parseRoomType(room)
  return {
    id: Number(room?.roomId),
    number: fallbackNumber,
    floor: Math.floor(index / 10) + 1,
    roomType,
    climate: room?.acStatus || 'AC',
    bedType: room?.occupancyType || 'Single',
    ratePerNight: Number(room?.currentTariff ?? room?.baseTariff ?? 0),
    status: String(room?.availabilityStatus || 'AVAILABLE').toUpperCase(),
    availabilityStatus: String(room?.availabilityStatus || 'AVAILABLE').toUpperCase(),
    occupancyType: room?.occupancyType || 'Single',
    acStatus: room?.acStatus || 'AC',
    baseTariff: Number(room?.baseTariff ?? 0),
    currentTariff: Number(room?.currentTariff ?? room?.baseTariff ?? 0),
    currentGuestName: '',
    activeToken: '',
    nextReservationDate: '',
  }
}

function maybeBackendFailure(response) {
  if (response?.status === 401 || response?.status === 403 || response?.status >= 500) {
    throw new Error(`Backend request failed with status ${response.status}`)
  }
  return response
}

async function ensureBackendSession() {
  if (!useBackend) return false
  if (sessionReadyPromise) return sessionReadyPromise

  sessionReadyPromise = (async () => {
    const me = maybeBackendFailure(await api.get('/auth/me'))
    if (me.status === 200 && me.data?.authenticated) return true
    const login = maybeBackendFailure(
      await api.post('/auth/login', { username: backendUsername, password: backendPassword }),
    )
    return login.status >= 200 && login.status < 300
  })()

  try {
    return await sessionReadyPromise
  } catch (error) {
    sessionReadyPromise = null
    throw error
  }
}

async function withFallback(backendCall, mockCall) {
  if (!useBackend) {
    return mockCall()
  }

  try {
    await ensureBackendSession()
    return await backendCall()
  } catch (error) {
    console.warn('[HMS Bridge] Falling back to mock data:', error?.message || error)
    return mockCall()
  }
}

export const hotelApi = {
  async listRooms() {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.get('/admin/rooms'))
      return (response.data || []).map((room, index) => toFrontendRoom(room, index))
    }, () => mockHotelApi.listRooms())
  },

  async listCheckIns() {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.get('/checkins'))
      return response.data || []
    }, () => mockHotelApi.listCheckIns())
  },

  async listGuests() {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.get('/guests'))
      return response.data || []
    }, () => mockHotelApi.listGuests())
  },

  async listFrequentGuests() {
    return mockHotelApi.listFrequentGuests()
  },

  async createReservation(payload) {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.post('/reservations', payload))
      return {
        tokenNumber: `RES-${Date.now().toString().slice(-4)}`,
        message:
          typeof response.data === 'string'
            ? response.data
            : 'Reservation created successfully.',
      }
    }, () => mockHotelApi.createReservation(payload))
  },

  async createWalkInCheckIn(payload) {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.post('/checkins', payload))
      return response.data || {}
    }, () => mockHotelApi.createWalkInCheckIn(payload))
  },

  async createCheckInFromReservation(payload) {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.post('/checkins/from-reservation', payload))
      return response.data || {}
    }, () => mockHotelApi.createCheckInFromReservation(payload))
  },

  async lookupReservations(params) {
    return withFallback(async () => {
      const response = maybeBackendFailure(
        await api.get('/reservations/lookup', { params }),
      )
      return response.data || []
    }, () => mockHotelApi.lookupReservations(params))
  },

  async updateGuest(guestId, payload) {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.put(`/guests/${guestId}`, payload))
      return response.data || {}
    }, () => mockHotelApi.updateGuest(guestId, payload))
  },

  async registerFrequentGuest(guestId, tier = 'SILVER') {
    return withFallback(async () => {
      const response = maybeBackendFailure(
        await api.post(`/frequent-guests/register/${guestId}`, { tier }),
      )
      return response.data || {}
    }, () => mockHotelApi.registerFrequentGuest(guestId, tier))
  },

  async checkAvailability(checkInDate, checkOutDate, roomType) {
    return withFallback(
      () => mockHotelApi.checkAvailability(checkInDate, checkOutDate, roomType),
      () => mockHotelApi.checkAvailability(checkInDate, checkOutDate, roomType),
    )
  },

  async getDashboardSummary() {
    return withFallback(() => mockHotelApi.getDashboardSummary(), () => mockHotelApi.getDashboardSummary())
  },

  async getOccupancyTrend({ days = 14 } = {}) {
    return withFallback(
      () => mockHotelApi.getOccupancyTrend({ days }),
      () => mockHotelApi.getOccupancyTrend({ days }),
    )
  },

  async listActiveReservations() {
    return withFallback(
      () => mockHotelApi.listActiveReservations(),
      () => mockHotelApi.listActiveReservations(),
    )
  },

  async listCateringForToken(token) {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.get(`/catering/${token}`))
      const entries = response.data || []
      return entries.map((item) => ({
        id: item.orderId,
        createdAtISO: item.dateTime,
        orderTotal: Number(item.charges || 0),
        items: [
          {
            name: item.foodItemName,
            qty: Number(item.quantity || 0),
            unitPrice: Number(item.charges || 0),
          },
        ],
      }))
    }, () => mockHotelApi.listCateringForToken(token))
  },

  async addCateringItem({ token, items = [] }) {
    return withFallback(async () => {
      const firstItem = items[0]
      if (!firstItem) return {}
      const payload = {
        tokenNumber: token,
        foodItemName: firstItem.name,
        quantity: Number(firstItem.qty || 0),
        charges: Number(firstItem.unitPrice || 0) * Number(firstItem.qty || 0),
      }
      const response = maybeBackendFailure(await api.post('/catering/log', payload))
      return response.data || {}
    }, () => mockHotelApi.addCateringItem({ token, items }))
  },

  async getBillingPreview({ token, extraDiscountType = 'none', extraDiscountValue = 0 }) {
    return withFallback(
      () => mockHotelApi.getBillingPreview({ token, extraDiscountType, extraDiscountValue }),
      () => mockHotelApi.getBillingPreview({ token, extraDiscountType, extraDiscountValue }),
    )
  },

  async checkout({ token }) {
    return withFallback(async () => {
      const response = maybeBackendFailure(await api.post(`/billing/checkout/${token}`))
      return response.data || {}
    }, () => mockHotelApi.checkout({ token }))
  },

  async resetMockData() {
    return mockHotelApi.resetMockData()
  },
}
