import { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import { hotelApi } from '../services/hotelApi.js'
import { useToast } from '../components/ui/useToast.js'
import {
  formatDateDisplay,
  calculateDuration,
  getMinCheckOutDate,
  getMinCheckInDate,
  isValidDateRange,
} from '../utils/dateUtils.js'
import { validateContactNumber, getCountryCodePrefix, contactForBackend } from '../utils/contactUtils.js'

const ROOM_TYPE_OPTIONS = [
  { value: 'Single AC', label: 'Single AC' },
  { value: 'Single Non-AC', label: 'Single Non-AC' },
  { value: 'Double AC', label: 'Double AC' },
  { value: 'Double Non-AC', label: 'Double Non-AC' },
]

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return value || '--'
  }
}

export default function ReservationCheckInPage() {
  const toast = useToast()
  const minCheckInDate = getMinCheckInDate()
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState([])
  const [availableRooms, setAvailableRooms] = useState(null)
  const [reservationResult, setReservationResult] = useState('')
  const [checkInToken, setCheckInToken] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [allReservations, setAllReservations] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyFilters, setHistoryFilters] = useState({
    name: '',
    contactNumber: '',
    startDate: '',
    endDate: '',
    minDays: '',
    maxDays: '',
  })

  const [reservationForm, setReservationForm] = useState({
    guestName: '',
    contact: '',
    country: 'IN',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
  })

  const [walkInForm, setWalkInForm] = useState({
    guestName: '',
    contact: '',
    country: 'IN',
    roomType: '',
    checkInDate: '',
    checkOutDate: '',
    advancePayment: 0,
  })

  const [lookupForm, setLookupForm] = useState({ guestName: '', contact: '' })

  const reservationNights = useMemo(
    () => calculateDuration(reservationForm.checkInDate, reservationForm.checkOutDate),
    [reservationForm.checkInDate, reservationForm.checkOutDate],
  )

  async function load() {
    setLoading(true)
    try {
      const [roomsRes, checkInsRes] = await Promise.all([
        hotelApi.listRooms(),
        hotelApi.listCheckIns(),
      ])
      setRooms(roomsRes)
      void checkInsRes
      const defaultRoomType = ROOM_TYPE_OPTIONS[0].value
      setReservationForm((f) => ({ ...f, roomType: defaultRoomType }))
      setWalkInForm((f) => ({ ...f, roomType: defaultRoomType }))
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Failed to load reservation data',
        message: e?.message || 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    loadAllReservations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAllReservations() {
    setHistoryLoading(true)
    try {
      const response = await hotelApi.listReservations()
      setAllReservations(response)
    } catch {
      // silent – history panel is secondary
    } finally {
      setHistoryLoading(false)
    }
  }

  function validateBookingForm(form) {
    const next = {}
    if (!form.guestName.trim()) next.guestName = 'Guest name is required'
    if (!form.contact.trim()) next.contact = 'Contact is required'
    if (!form.roomType) next.roomType = 'Please choose a room type'
    if (!isValidDateRange(form.checkInDate, form.checkOutDate)) {
      next.checkInDate = 'Select valid check-in and check-out dates'
      next.checkOutDate = 'Select valid check-in and check-out dates'
    }

    const contactValidation = validateContactNumber(form.contact, form.country)
    if (!contactValidation.valid) {
      next.contact = contactValidation.error
    }

    return next
  }

  async function checkAvailability(formType) {
    const form = formType === 'reservation' ? reservationForm : walkInForm
    const nextErrors = {}

    if (!form.roomType) nextErrors.roomType = 'Select a room type'
    if (!isValidDateRange(form.checkInDate, form.checkOutDate)) {
      nextErrors.checkInDate = 'Enter valid dates'
      nextErrors.checkOutDate = 'Enter valid dates'
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      toast.pushToast({
        type: 'warning',
        title: 'Invalid search',
        message: 'Please choose a room type and valid date range before checking availability.',
      })
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      const availability = await hotelApi.checkAvailability(form.checkInDate, form.checkOutDate, form.roomType)
      setAvailableRooms(availability)
      toast.pushToast({
        type: availability.totalAvailable ? 'success' : 'warning',
        title: availability.totalAvailable ? 'Rooms available' : 'No availability',
        message: availability.totalAvailable
          ? `${availability.totalAvailable} room(s) available for ${form.roomType}`
          : `No rooms are available for selected dates.`,
      })
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Availability check failed',
        message: e?.message || 'Unable to load availability',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function submitReservation() {
    const nextErrors = validateBookingForm(reservationForm)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const response = await hotelApi.createReservation({
        name: reservationForm.guestName,
        contactNumber: contactForBackend(reservationForm.contact),
        arrivalDate: reservationForm.checkInDate,
        expectedCheckOutDate: reservationForm.checkOutDate,
        roomType: reservationForm.roomType,
        startDate: `${reservationForm.checkInDate}T14:00:00`,
        endDate: `${reservationForm.checkOutDate}T11:00:00`,
      })

      setReservationResult(response.message)
      toast.pushToast({
        type: 'success',
        title: 'Reservation created',
        message: response.message,
      })
      setReservationForm((f) => ({
        ...f,
        guestName: '',
        contact: '',
        checkInDate: '',
        checkOutDate: '',
      }))
      setAvailableRooms(null)
      await load()
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Reservation failed',
        message: e?.message || 'Unable to create reservation',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function submitWalkIn() {
    const nextErrors = validateBookingForm(walkInForm)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    try {
      const response = await hotelApi.createWalkInCheckIn({
        name: walkInForm.guestName,
        contactNumber: contactForBackend(walkInForm.contact),
        arrivalDate: walkInForm.checkInDate,
        expectedCheckOutDate: walkInForm.checkOutDate,
        roomType: walkInForm.roomType,
        advancePayment: Number(walkInForm.advancePayment),
      })

      setCheckInToken(response.tokenNumber)
      toast.pushToast({
        type: 'success',
        title: 'Walk-in check-in created',
        message: `Token: ${response.tokenNumber}`,
      })
      setWalkInForm((f) => ({
        ...f,
        guestName: '',
        contact: '',
        checkInDate: '',
        checkOutDate: '',
        advancePayment: 0,
      }))
      setAvailableRooms(null)
      await load()
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Walk-in check-in failed',
        message: e?.message || 'Unable to process check-in',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function searchReservations() {
    if (!lookupForm.guestName.trim() || !lookupForm.contact.trim()) {
      setErrors({ lookupName: 'Guest name is required', lookupContact: 'Contact is required' })
      return
    }

    setErrors({})
    setSearching(true)
    setSearchResults([])
    try {
      const results = await hotelApi.lookupReservations({
        name: lookupForm.guestName,
        contactNumber: contactForBackend(lookupForm.contact),
      })
      setSearchResults(results)
      if (!results.length) {
        toast.pushToast({
          type: 'info',
          title: 'No reservations found',
          message: 'Try different guest details or create a new reservation.',
        })
      }
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Search failed',
        message: e?.message || 'Unable to search reservations',
      })
    } finally {
      setSearching(false)
    }
  }

  async function processReservationCheckIn(reservationId) {
    setSubmitting(true)
    try {
      const checkIn = await hotelApi.createCheckInFromReservation({
        reservationId,
        advancePayment: 0,
      })
      setCheckInToken(checkIn.tokenNumber)
      toast.pushToast({
        type: 'success',
        title: 'Reservation converted to check-in',
        message: `Token: ${checkIn.tokenNumber}`,
      })
      setSearchResults((current) => current.filter((item) => item.reservationId !== reservationId))
      await load()
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Check-in failed',
        message: e?.message || 'Unable to complete check-in',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function cancelReservation(reservationId) {
    setSubmitting(true)
    try {
      await hotelApi.cancelReservation(reservationId)
      toast.pushToast({
        type: 'success',
        title: 'Reservation cancelled',
        message: 'The reservation has been removed successfully.',
      })
      setSearchResults((current) => current.filter((item) => item.reservationId !== reservationId))
      setAllReservations((current) => current.filter((item) => item.reservationId !== reservationId))
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Cancellation failed',
        message: e?.message || 'Unable to cancel the reservation',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const filteredHistory = allReservations.filter((reservation) => {
    const name = historyFilters.name.trim().toLowerCase()
    const contact = historyFilters.contactNumber.trim().replace(/\D/g, '')
    const guestName = (reservation.guest?.name || '').toLowerCase()
    const guestContact = (reservation.guest?.contactNumber || '').replace(/\D/g, '')

    if (name && !guestName.includes(name)) return false
    if (contact && !guestContact.includes(contact)) return false

    const startTs = reservation.startDate ? new Date(reservation.startDate).getTime() : null
    const endTs = reservation.endDate ? new Date(reservation.endDate).getTime() : null

    if (historyFilters.startDate) {
      const filterStart = new Date(historyFilters.startDate).getTime()
      if (!startTs || startTs < filterStart) return false
    }
    if (historyFilters.endDate) {
      const filterEnd = new Date(historyFilters.endDate + 'T23:59:59').getTime()
      if (!endTs || endTs > filterEnd) return false
    }

    if (historyFilters.minDays || historyFilters.maxDays) {
      const days =
        startTs && endTs
          ? Math.max(1, Math.ceil((endTs - startTs) / (24 * 60 * 60 * 1000)))
          : null
      if (days === null) return false
      if (historyFilters.minDays && days < Number(historyFilters.minDays)) return false
      if (historyFilters.maxDays && days > Number(historyFilters.maxDays)) return false
    }

    return true
  })

  return (

    <div className="space-y-6">
      <PageHeader
        title="Reservations & Check-ins"
        subtitle="Search availability, book stays, and convert reservations into check-ins in one modern workflow."
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-1">
          <div className="text-lg font-semibold text-slate-900">Search & Availability</div>
          <p className="mt-2 text-sm text-slate-600">
            Select dates and room type to verify availability before booking.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Type</label>
              <Select
                value={reservationForm.roomType}
                onChange={(e) => {
                  const value = e.target.value
                  setReservationForm((f) => ({ ...f, roomType: value }))
                  setWalkInForm((f) => ({ ...f, roomType: value }))
                }}
                options={ROOM_TYPE_OPTIONS}
                error={errors.roomType}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Check-in Date</label>
              <input
                type="date"
                value={reservationForm.checkInDate}
                min={minCheckInDate}
                onChange={(e) => {
                  const nextCheckIn = e.target.value
                  setReservationForm((f) => ({ ...f, checkInDate: nextCheckIn, checkOutDate: f.checkOutDate }))
                  setWalkInForm((f) => ({ ...f, checkInDate: nextCheckIn }))
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  errors.checkInDate ? 'border-rose-500' : 'border-slate-300 focus:border-indigo-500'
                }`}
              />
              {errors.checkInDate && <div className="text-xs text-rose-600 mt-1">{errors.checkInDate}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Check-out Date</label>
              <input
                type="date"
                value={reservationForm.checkOutDate}
                min={getMinCheckOutDate(reservationForm.checkInDate) || minCheckInDate}
                onChange={(e) => {
                  const value = e.target.value
                  setReservationForm((f) => ({ ...f, checkOutDate: value }))
                  setWalkInForm((f) => ({ ...f, checkOutDate: value }))
                }}
                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                  errors.checkOutDate ? 'border-rose-500' : 'border-slate-300 focus:border-indigo-500'
                }`}
              />
              {errors.checkOutDate && <div className="text-xs text-rose-600 mt-1">{errors.checkOutDate}</div>}
            </div>

            {reservationNights > 0 ? (
              <div className="rounded-2xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700">
                {reservationNights} night{reservationNights !== 1 ? 's' : ''} selected
              </div>
            ) : null}

            <Button
              onClick={() => checkAvailability('reservation')}
              disabled={submitting || !reservationForm.roomType || !reservationForm.checkInDate || !reservationForm.checkOutDate}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? 'Checking...' : 'Check Availability'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 xl:col-span-1">
          <div className="text-lg font-semibold text-slate-900">Booking Details</div>
          <p className="mt-2 text-sm text-slate-600">Complete guest details and confirm the booking.</p>

          <div className="mt-6 space-y-4">
            <Input
              label="Guest Name"
              value={reservationForm.guestName}
              onChange={(e) => {
                const value = e.target.value
                setReservationForm((f) => ({ ...f, guestName: value }))
                setWalkInForm((f) => ({ ...f, guestName: value }))
              }}
              error={errors.guestName}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
              <div className="flex gap-2">
                <Select
                  value={reservationForm.country}
                  onChange={(e) => {
                    const value = e.target.value
                    setReservationForm((f) => ({ ...f, country: value }))
                    setWalkInForm((f) => ({ ...f, country: value }))
                  }}
                  options={[
                    { value: 'IN', label: '🇮🇳 +91' },
                    { value: 'US', label: '🇺🇸 +1' },
                    { value: 'UK', label: '🇬🇧 +44' },
                    { value: 'AU', label: '🇦🇺 +61' },
                  ]}
                  className="w-24"
                />
                <input
                  type="tel"
                  value={reservationForm.contact}
                  onChange={(e) => {
                    const value = e.target.value
                    setReservationForm((f) => ({ ...f, contact: value }))
                    setWalkInForm((f) => ({ ...f, contact: value }))
                  }}
                  placeholder={`${getCountryCodePrefix(reservationForm.country)} 1234567890`}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none ${
                    errors.contact ? 'border-rose-500' : 'border-slate-300 focus:border-indigo-500'
                  }`}
                />
              </div>
              {errors.contact && <div className="text-xs text-rose-600 mt-1">{errors.contact}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Selected Room Type</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {reservationForm.roomType || 'Choose a room type above'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Stay Dates</label>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {reservationForm.checkInDate && reservationForm.checkOutDate
                  ? `${formatDateDisplay(reservationForm.checkInDate)} - ${formatDateDisplay(reservationForm.checkOutDate)}`
                  : 'Select check-in and check-out dates above'}
              </div>
            </div>



            <Button
              onClick={submitWalkIn}
              disabled={submitting || !availableRooms || availableRooms.totalAvailable === 0}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white"
            >
              {submitting ? 'Processing...' : 'Direct Check-In'}
            </Button>
          </div>
        </Card>

        <Card className="p-6 xl:col-span-1">
          <div className="text-lg font-semibold text-slate-900">Search Reservations</div>
          <p className="mt-2 text-sm text-slate-600">Find an existing booking and convert it into an active check-in.</p>

          <div className="mt-6 space-y-4">
            <Input
              label="Guest Name"
              value={lookupForm.guestName}
              onChange={(e) => setLookupForm((f) => ({ ...f, guestName: e.target.value }))}
              error={errors.lookupName}
            />
            <Input
              label="Contact"
              value={lookupForm.contact}
              onChange={(e) => setLookupForm((f) => ({ ...f, contact: e.target.value }))}
              error={errors.lookupContact}
            />
            <Button onClick={searchReservations} disabled={searching} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {searching ? 'Searching...' : 'Search Reservations'}
            </Button>
          </div>
        </Card>
      </div>

      {availableRooms ? (
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-lg font-semibold text-slate-900">Availability Summary</div>
              <div className="text-sm text-slate-600">{availableRooms.totalAvailable} room(s) available</div>
            </div>
            <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              {availableRooms.totalAvailable > 0 ? 'Available now' : 'Sold out'}
            </div>
          </div>

          {availableRooms.totalAvailable > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(availableRooms.byType).map(([type, roomsList]) => (
                <div key={type} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="font-semibold text-slate-900 mb-3">{type}</div>
                  <div className="text-sm text-slate-600 mb-3">{roomsList.length} room(s) available</div>
                  <div className="grid gap-2">
                    {roomsList.slice(0, 4).map((room) => (
                      <div key={room.id} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                        Room {room.number} - {room.ratePerNight.toLocaleString('en-IN')} INR/night
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              No rooms available for your selected dates and room type.
            </div>
          )}
        </Card>
      ) : null}

      {reservationResult ? (
        <Card className="p-6 bg-emerald-50 border-emerald-200">
          <div className="text-sm font-semibold text-slate-900">Reservation Created</div>
          <p className="mt-3 text-slate-700">{reservationResult}</p>
        </Card>
      ) : null}

      {checkInToken ? (
        <Card className="p-6 bg-indigo-50 border-indigo-200">
          <div className="text-sm font-semibold text-slate-900">Check-in Completed</div>
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Check-In Token: <span className="font-semibold text-indigo-700">{checkInToken}</span>
          </div>
        </Card>
      ) : null}

      <Card className="p-6">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Reservation Results</div>
            <div className="text-xs text-slate-500">Convert a booked reservation into an active stay.</div>
          </div>
          <Button variant="secondary" onClick={() => setSearchResults([])} type="button">
            Clear
          </Button>
        </div>

        {searchResults.length ? (
          <Table>
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                <th className="px-4 py-3">Reservation ID</th>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Room Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((reservation) => (
                <tr key={reservation.reservationId} className="border-t border-slate-100">
                  <td className="px-4 py-3 text-slate-700">{reservation.reservationId}</td>
                  <td className="px-4 py-3 text-slate-700">{reservation.guest?.name || reservation.guest?.contactNumber}</td>
                  <td className="px-4 py-3 text-slate-700">{reservation.roomType}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatDate(reservation.startDate)} - {formatDate(reservation.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        type="button"
                        onClick={() => processReservationCheckIn(reservation.reservationId)}
                        disabled={submitting}
                      >
                        Check-in Now
                      </Button>
                      <Button
                        variant="secondary"
                        type="button"
                        onClick={() => cancelReservation(reservation.reservationId)}
                        disabled={submitting}
                        className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            Search for a reservation to see matching bookings.
          </div>
        )}
      </Card>

      {/* Reservation History */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4">
          <div>
            <div className="text-lg font-semibold text-slate-900">Reservation History</div>
            <div className="text-sm text-slate-500">Browse and filter all reservations by guest details, dates, and duration.</div>
          </div>
          <Button
            variant="secondary"
            type="button"
            onClick={() => setHistoryFilters({ name: '', contactNumber: '', startDate: '', endDate: '', minDays: '', maxDays: '' })}
          >
            Clear Filters
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 pb-4 border-b border-slate-100">
          <Input
            label="Guest Name"
            placeholder="Search by name"
            value={historyFilters.name}
            onChange={(e) => setHistoryFilters((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Contact No."
            placeholder="Search by contact"
            value={historyFilters.contactNumber}
            onChange={(e) => setHistoryFilters((f) => ({ ...f, contactNumber: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">Start Date (from)</label>
            <input
              type="date"
              value={historyFilters.startDate}
              onChange={(e) => setHistoryFilters((f) => ({ ...f, startDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-800 mb-1">End Date (upto)</label>
            <input
              type="date"
              value={historyFilters.endDate}
              onChange={(e) => setHistoryFilters((f) => ({ ...f, endDate: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <Input
            label="Min Days"
            type="number"
            min={1}
            placeholder="e.g. 2"
            value={historyFilters.minDays}
            onChange={(e) => setHistoryFilters((f) => ({ ...f, minDays: e.target.value }))}
          />
          <Input
            label="Max Days"
            type="number"
            min={1}
            placeholder="e.g. 7"
            value={historyFilters.maxDays}
            onChange={(e) => setHistoryFilters((f) => ({ ...f, maxDays: e.target.value }))}
          />
        </div>

        <div className="mt-4">
          {historyLoading ? (
            <div className="text-sm text-slate-400 py-4 text-center">Loading reservations...</div>
          ) : filteredHistory.length ? (
            <Table>
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                  <th className="px-4 py-3">Reservation ID</th>
                  <th className="px-4 py-3">Guest Name</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Room Type</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Days</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((reservation) => {
                  const startTs = reservation.startDate ? new Date(reservation.startDate).getTime() : null
                  const endTs = reservation.endDate ? new Date(reservation.endDate).getTime() : null
                  const days = startTs && endTs ? Math.max(1, Math.ceil((endTs - startTs) / (24 * 60 * 60 * 1000))) : '--'
                  return (
                    <tr key={reservation.reservationId} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-700 font-medium">#{reservation.reservationId}</td>
                      <td className="px-4 py-3 text-slate-700">{reservation.guest?.name || '--'}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{reservation.guest?.contactNumber || '--'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                          {reservation.roomType || '--'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-sm">{formatDate(reservation.startDate)}</td>
                      <td className="px-4 py-3 text-slate-700 text-sm">{formatDate(reservation.endDate)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            type="button"
                            onClick={() => processReservationCheckIn(reservation.reservationId)}
                            disabled={submitting}
                          >
                            Check-in
                          </Button>
                          <Button
                            variant="secondary"
                            type="button"
                            onClick={() => cancelReservation(reservation.reservationId)}
                            disabled={submitting}
                            className="text-rose-600 hover:text-rose-700 border-rose-200 hover:border-rose-300"
                          >
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 text-center">
              {allReservations.length === 0
                ? 'No reservations found in the system.'
                : 'No reservations match the current filters.'}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
