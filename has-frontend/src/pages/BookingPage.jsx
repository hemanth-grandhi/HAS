import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Select from '../components/ui/Select.jsx'
import { useToast } from '../components/ui/useToast.js'
import { hotelApi } from '../services/hotelApi.js'
import {
  calculateDuration,
  formatDateDisplay,
  getMinCheckInDate,
  getMinCheckOutDate,
  isValidDateRange,
} from '../utils/dateUtils.js'
import { validateContactNumber, contactForBackend } from '../utils/contactUtils.js'

const COUNTRY_OPTIONS = [
  { value: 'IN', label: 'IN +91' },
  { value: 'US', label: 'US +1' },
  { value: 'UK', label: 'UK +44' },
  { value: 'AU', label: 'AU +61' },
]

const GENDER_OPTIONS = [
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
]

const ID_PROOF_OPTIONS = [
  { value: 'Aadhaar', label: 'Aadhaar' },
  { value: 'Passport', label: 'Passport' },
  { value: 'Driving License', label: 'Driving License' },
  { value: 'Voter ID', label: 'Voter ID' },
]

const ROOM_TYPE_OPTIONS = [
  { value: 'Single AC', label: 'Single AC' },
  { value: 'Single Non-AC', label: 'Single Non-AC' },
  { value: 'Double AC', label: 'Double AC' },
  { value: 'Double Non-AC', label: 'Double Non-AC' },
]

function toDateTime(value, hour, minute) {
  return `${value}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
}

export default function BookingPage() {
  const toast = useToast()
  const todayIso = getMinCheckInDate()
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rooms, setRooms] = useState([])
  const [guests, setGuests] = useState([])
  const [frequentGuests, setFrequentGuests] = useState([])
  const [availableRooms, setAvailableRooms] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(null)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState('fillDetails')
  const [bookingStatus, setBookingStatus] = useState(null) // 'pending', 'available', 'confirmed', 'failed'
  const [paymentMethod, setPaymentMethod] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    gender: 'Female',
    countryCode: 'IN',
    contact: '',
    idProofType: 'Aadhaar',
    idProofFileName: '',
    roomType: '',
    checkInDate: todayIso,
    checkOutDate: getMinCheckOutDate(todayIso),
    roomId: '',
    advancePayment: 0,
  })

  const nights = useMemo(
    () => calculateDuration(form.checkInDate, form.checkOutDate),
    [form.checkInDate, form.checkOutDate],
  )

  const featuredRoomTypes = useMemo(() => {
    return Object.values(
      rooms.reduce((grouped, room) => {
        if (!ROOM_TYPE_OPTIONS.some((option) => option.value === room.roomType)) {
          return grouped
        }
        const current = grouped[room.roomType] || {
          roomType: room.roomType,
          climateLabels: new Set(),
          roomCount: 0,
          fromRate: room.ratePerNight,
        }
        current.roomCount += 1
        current.fromRate = Math.min(current.fromRate, room.ratePerNight)
        current.climateLabels.add(room.climate)
        grouped[room.roomType] = current
        return grouped
      }, {}),
    ).map((entry) => ({
      ...entry,
      climateSummary: Array.from(entry.climateLabels).join(' / '),
    }))
  }, [rooms])

  const selectedRoom = useMemo(
    () => availableRooms?.allRooms?.find((room) => String(room.id) === String(form.roomId)) ?? null,
    [availableRooms, form.roomId],
  )

  const bookingMode = 'reservation'

  async function load() {
    setLoading(true)
    try {
      const [roomsRes, guestRes, frequentRes] = await Promise.all([
        hotelApi.listRooms(),
        hotelApi.listGuests(),
        hotelApi.listFrequentGuests(),
      ])
      setRooms(roomsRes)
      setGuests(guestRes)
      setFrequentGuests(frequentRes)

      if (!form.roomType && roomsRes.length) {
        setForm((current) => ({
          ...current,
          roomType: ROOM_TYPE_OPTIONS[0].value,
        }))
      }
    } catch (error) {
      toast.pushToast({
        type: 'error',
        title: 'Could not load hotel inventory',
        message: error?.message || 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function refreshAvailability({ showFeedback = false } = {}) {
    if (!form.roomType || !form.checkInDate || !form.checkOutDate) {
      setAvailableRooms(null)
      return
    }

    if (!isValidDateRange(form.checkInDate, form.checkOutDate)) {
      if (showFeedback) {
        toast.pushToast({
          type: 'warning',
          title: 'Choose valid stay dates',
          message: 'Check-out must be after check-in, and check-in cannot be in the past.',
        })
      }
      setAvailableRooms(null)
      return
    }

    setSearching(true)
    try {
      const nextAvailability = await hotelApi.checkAvailability(
        form.checkInDate,
        form.checkOutDate,
        form.roomType,
      )
      setAvailableRooms(nextAvailability)

      if (
        form.roomId &&
        !nextAvailability.allRooms.some((room) => String(room.id) === String(form.roomId))
      ) {
        setForm((current) => ({ ...current, roomId: '' }))
      }

      if (showFeedback && nextAvailability.totalAvailable === 0) {
        toast.pushToast({
          type: 'warning',
          title: 'No rooms available',
          message: `No ${form.roomType} is open for ${formatDateDisplay(form.checkInDate)} to ${formatDateDisplay(form.checkOutDate)}.`,
        })
      }
    } catch (error) {
      if (showFeedback) {
        toast.pushToast({
          type: 'error',
          title: 'Availability check failed',
          message: error?.message || 'Unknown error',
        })
      }
      setAvailableRooms(null)
    } finally {
      setSearching(false)
    }
  }

  useEffect(() => {
    if (!form.roomType || !form.checkInDate || !form.checkOutDate) {
      setAvailableRooms(null)
      return
    }

    const timeoutId = window.setTimeout(() => {
      refreshAvailability()
    }, 180)

    return () => window.clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.roomType, form.checkInDate, form.checkOutDate])

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }))
  }

  function validateForm() {
    const nextErrors = {}

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required'
    if (!form.contact.trim()) nextErrors.contact = 'Contact number is required'
    if (!form.idProofType) nextErrors.idProofType = 'Select an ID proof type'
    if (!form.idProofFileName) nextErrors.idProofFileName = 'Upload an ID proof file'
    if (!form.roomType.trim()) nextErrors.roomType = 'Choose a room type'
    if (!isValidDateRange(form.checkInDate, form.checkOutDate)) {
      nextErrors.checkInDate = 'Enter valid check-in and check-out dates'
      nextErrors.checkOutDate = 'Enter valid check-in and check-out dates'
    }
    if (!form.roomId) nextErrors.roomId = 'Select one available room before confirming'
    if (Number(form.advancePayment) < 0) nextErrors.advancePayment = 'Advance payment cannot be negative'

    const contactValidation = validateContactNumber(form.contact, form.countryCode)
    if (!contactValidation.valid) {
      nextErrors.contact = contactValidation.error
    }

    return nextErrors
  }

  async function submitBooking() {
    const nextErrors = validateForm()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    setBookingStatus('pending')
    setCurrentStep('checkAvailability')

    try {
      // Simulate backend check
      const availability = await hotelApi.checkAvailability(
        form.checkInDate,
        form.checkOutDate,
        form.roomType,
      )

      if (availability.totalAvailable > 0) {
        setBookingStatus('available')
        setCurrentStep('confirmBooking')
      } else {
        setBookingStatus('failed')
      }
    } catch (error) {
      setBookingStatus('failed')
      toast.pushToast({
        type: 'error',
        title: 'Booking request failed',
        message: error?.message || 'Unknown error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmBooking() {
    setCurrentStep('makePayment')
  }

  async function processPayment() {
    // Mock payment processing
    setSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate payment delay

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`.trim(),
        gender: form.gender,
        countryCode: form.countryCode,
        contactNumber: contactForBackend(form.contact),
        idProofType: form.idProofType,
        idProofFileName: form.idProofFileName,
        roomType: form.roomType,
        roomId: Number(form.roomId),
        arrivalDate: form.checkInDate,
        expectedCheckOutDate: form.checkOutDate,
        advancePayment: Number(form.advancePayment || 0),
      }

      const response = await hotelApi.createReservation({
              ...payload,
              startDate: toDateTime(form.checkInDate, 14, 0),
              endDate: toDateTime(form.checkOutDate, 11, 0),
            })

      setBookingStatus('confirmed')
      setBookingSuccess({
        kind: 'reservation',
        guestName: `${form.firstName} ${form.lastName}`.trim(),
        roomNumber: selectedRoom?.number || response.room?.number || '--',
        token: response.tokenNumber,
        message: response.message,
      })

      toast.pushToast({
        type: 'success',
        title: 'Booking confirmed',
        message: 'Payment successful and booking confirmed.',
      })

      // Reset
      setCurrentStep('fillDetails')
      setBookingStatus(null)
      setPaymentMethod('')
      setErrors({})
      setAvailableRooms(null)
      setForm((current) => ({
        ...current,
        firstName: '',
        lastName: '',
        contact: '',
        idProofFileName: '',
        roomId: '',
        advancePayment: 0,
      }))

      await load()
    } catch (error) {
      toast.pushToast({
        type: 'error',
        title: 'Payment failed',
        message: error?.message || 'Unknown error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stay Booking"
        subtitle="Capture complete guest details, check live room availability, and turn future dates into reservations or same-day arrivals into active stays."
      />

      {/* Step Indicator */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'fillDetails' ? 'bg-indigo-600 text-white' : currentStep === 'checkAvailability' || currentStep === 'confirmBooking' || currentStep === 'makePayment' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              1
            </div>
            <span className={`text-sm font-medium ${currentStep === 'fillDetails' ? 'text-indigo-600' : 'text-slate-900'}`}>Fill Details</span>
          </div>
          <div className="flex-1 border-t border-slate-200 mx-4"></div>
          <div className="flex items-center space-x-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'checkAvailability' ? 'bg-indigo-600 text-white' : currentStep === 'confirmBooking' || currentStep === 'makePayment' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              2
            </div>
            <span className={`text-sm font-medium ${currentStep === 'checkAvailability' ? 'text-indigo-600' : 'text-slate-900'}`}>Check Availability</span>
          </div>
          <div className="flex-1 border-t border-slate-200 mx-4"></div>
          <div className="flex items-center space-x-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'confirmBooking' ? 'bg-indigo-600 text-white' : currentStep === 'makePayment' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              3
            </div>
            <span className={`text-sm font-medium ${currentStep === 'confirmBooking' ? 'text-indigo-600' : 'text-slate-900'}`}>Confirm Booking</span>
          </div>
          <div className="flex-1 border-t border-slate-200 mx-4"></div>
          <div className="flex items-center space-x-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep === 'makePayment' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              4
            </div>
            <span className={`text-sm font-medium ${currentStep === 'makePayment' ? 'text-indigo-600' : 'text-slate-900'}`}>Make Payment</span>
          </div>
        </div>
      </Card>

      {/* Status Display */}
      {bookingStatus && (
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className={`h-4 w-4 rounded-full ${bookingStatus === 'pending' ? 'bg-yellow-400' : bookingStatus === 'available' ? 'bg-green-400' : bookingStatus === 'confirmed' ? 'bg-blue-400' : 'bg-red-400'}`}></div>
            <span className="text-lg font-semibold">
              {bookingStatus === 'pending' ? 'Booking Request Sent' :
               bookingStatus === 'available' ? 'Room Available – Confirm Booking' :
               bookingStatus === 'confirmed' ? 'Booking Confirmed Successfully' :
               'Room Not Available – Choose Another Option'}
            </span>
          </div>
        </Card>
      )}

      {currentStep === 'fillDetails' && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <Card className="p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-lg font-semibold text-slate-900">Guest and Stay Details</div>
                <div className="text-sm text-slate-500">
                  Room types support manual typing with hotel-standard suggestions.
                </div>
              </div>
              <div className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
                Future reservation — room will be held until check-in
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={(event) => updateForm({ firstName: event.target.value })}
                error={errors.firstName}
                placeholder="Anika"
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={(event) => updateForm({ lastName: event.target.value })}
                error={errors.lastName}
                placeholder="Raman"
              />
              <Select
                label="Gender"
                value={form.gender}
                onChange={(event) => updateForm({ gender: event.target.value })}
                options={GENDER_OPTIONS}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">Contact Number</label>
                <div className="flex gap-2">
                  <Select
                    value={form.countryCode}
                    onChange={(event) => updateForm({ countryCode: event.target.value })}
                    options={COUNTRY_OPTIONS}
                    className="w-28 shrink-0"
                  />
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={(event) => updateForm({ contact: event.target.value })}
                    placeholder="9876543210"
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none ${
                      errors.contact ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.contact ? <div className="mt-1 text-xs font-medium text-rose-600">{errors.contact}</div> : null}
              </div>
              <Select
                label="ID Proof Type"
                value={form.idProofType}
                onChange={(event) => updateForm({ idProofType: event.target.value })}
                options={ID_PROOF_OPTIONS}
                error={errors.idProofType}
              />
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-800">ID Proof Upload</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm ${
                    errors.idProofFileName ? 'border-rose-400' : 'border-slate-200'
                  }`}
                  onChange={(event) =>
                    updateForm({ idProofFileName: event.target.files?.[0]?.name || '' })
                  }
                />
                <div className="mt-1 text-xs text-slate-500">
                  {form.idProofFileName || 'Accepted: PDF, JPG, JPEG, PNG'}
                </div>
                {errors.idProofFileName ? <div className="mt-1 text-xs font-medium text-rose-600">{errors.idProofFileName}</div> : null}
              </div>
              <Select
                label="Room Type"
                value={form.roomType}
                onChange={(event) => updateForm({ roomType: event.target.value, roomId: '' })}
                options={ROOM_TYPE_OPTIONS}
                error={errors.roomType}
                containerClassName="md:col-span-2"
              />
              <Input
                label="Check-in Date"
                type="date"
                min={todayIso}
                value={form.checkInDate}
                onChange={(event) =>
                  updateForm({
                    checkInDate: event.target.value,
                    checkOutDate:
                      event.target.value >= form.checkOutDate
                        ? getMinCheckOutDate(event.target.value)
                        : form.checkOutDate,
                    roomId: '',
                  })
                }
                error={errors.checkInDate}
              />
              <Input
                label="Check-out Date"
                type="date"
                min={getMinCheckOutDate(form.checkInDate)}
                value={form.checkOutDate}
                onChange={(event) => updateForm({ checkOutDate: event.target.value, roomId: '' })}
                error={errors.checkOutDate}
              />
              <Input
                label="Advance Payment"
                type="number"
                min={0}
                value={form.advancePayment}
                onChange={(event) => updateForm({ advancePayment: event.target.value })}
                error={errors.advancePayment}
                hint="Optional deposit collected at the front desk."
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900">{nights} night{nights !== 1 ? 's' : ''}</div>
                <div className="text-sm text-slate-500">
                  {formatDateDisplay(form.checkInDate)} to {formatDateDisplay(form.checkOutDate)}
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => refreshAvailability({ showFeedback: true })}
                disabled={searching}
              >
                {searching ? 'Checking rooms...' : 'Refresh available rooms'}
              </Button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-slate-900">Available Rooms</div>
                  <div className="text-sm text-slate-500">
                    Pick one room to continue the booking.
                  </div>
                </div>
                <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                  {availableRooms?.totalAvailable ?? 0} open
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {(availableRooms?.allRooms?.length ? availableRooms.allRooms : rooms.slice(0, 4)).map((room) => {
                  const isSelected = String(form.roomId) === String(room.id)
                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => updateForm({ roomId: String(room.id), roomType: room.roomType })}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-900">Room {room.number}</div>
                          <div className="text-sm text-slate-500">Floor {room.floor} • {room.roomType}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-semibold text-slate-900">
                            {room.ratePerNight.toLocaleString('en-IN')} INR
                          </div>
                          <div className="text-xs text-slate-500">per night</div>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{room.climate}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{room.bedType} bed</span>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-800">
                          {availableRooms ? 'Available for selected dates' : room.status}
                        </span>
                      </div>
                    </button>
                  )
                })}

                {!availableRooms?.allRooms?.length ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                    Select room type and stay dates to load a live shortlist. Until then, we are showing a few featured rooms from the inventory.
                  </div>
                ) : null}
              </div>

              {errors.roomId ? <div className="mt-3 text-xs font-medium text-rose-600">{errors.roomId}</div> : null}

              <div className="mt-6 rounded-2xl bg-slate-950 px-5 py-4 text-white">
                <div className="text-sm font-semibold">Booking Summary</div>
                <div className="mt-2 text-sm text-slate-300">
                  {selectedRoom
                    ? `${selectedRoom.roomType} in Room ${selectedRoom.number} for ${nights} night${nights !== 1 ? 's' : ''}.`
                    : 'Select a room to see the final stay summary.'}
                </div>
                <Button
                  type="button"
                  onClick={submitBooking}
                  disabled={submitting || !selectedRoom}
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? 'Sending request...' : 'Send Booking Request'}
                </Button>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-5">
                <div className="text-sm font-semibold text-slate-900">Room Categories</div>
                <div className="mt-4 space-y-3">
                  {featuredRoomTypes.map((roomType) => (
                    <div key={roomType.roomType} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">{roomType.roomType}</div>
                          <div className="text-xs text-slate-500">{roomType.roomCount} rooms • {roomType.climateSummary}</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          from {roomType.fromRate.toLocaleString('en-IN')} INR
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <div className="text-sm font-semibold text-slate-900">Guest Intelligence</div>
                <div className="mt-2 text-sm text-slate-500">
                  {frequentGuests.length} frequent guests and {guests.length} profiles are already in this front-desk demo.
                </div>
                <div className="mt-4 space-y-3">
                  {frequentGuests.slice(0, 3).map((guest) => (
                    <div key={guest.id} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-slate-900">{guest.name}</div>
                          <div className="text-xs text-slate-500">{guest.tier} tier • {guest.rewardPoints} points</div>
                        </div>
                        <div className="text-xs font-semibold text-emerald-700">{guest.discountPct}% off</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {currentStep === 'confirmBooking' && bookingStatus === 'available' && (
        <Card className="p-6">
          <div className="text-lg font-semibold text-slate-900">Confirm Your Booking</div>
          <div className="mt-4">
            <p>Room {selectedRoom?.number} - {selectedRoom?.roomType}</p>
            <p>{nights} night{nights !== 1 ? 's' : ''} from {formatDateDisplay(form.checkInDate)} to {formatDateDisplay(form.checkOutDate)}</p>
            <p>Advance Payment: {form.advancePayment} INR</p>
          </div>
          <Button
            type="button"
            onClick={confirmBooking}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700"
          >
            Confirm Booking
          </Button>
        </Card>
      )}

      {currentStep === 'makePayment' && (
        <Card className="p-6">
          <div className="text-lg font-semibold text-slate-900">Make Payment</div>
          <div className="mt-4">
            <p>Select Payment Method:</p>
            <div className="mt-2 space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="googlePay"
                  checked={paymentMethod === 'googlePay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="ml-2">Google Pay (UPI)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="ml-2">Razorpay</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="ml-2">Card Payment (Debit/Credit)</span>
              </label>
            </div>
            {paymentMethod === 'card' && (
              <div className="mt-4">
                <Input label="Card Number" placeholder="1234 5678 9012 3456" />
                <Input label="Expiry Date" placeholder="MM/YY" />
                <Input label="CVV" placeholder="123" />
              </div>
            )}
            {paymentMethod === 'googlePay' && (
              <div className="mt-4">
                <Input label="UPI ID" placeholder="user@upi" />
              </div>
            )}
            {paymentMethod === 'razorpay' && (
              <div className="mt-4">
                <p>Razorpay integration would go here.</p>
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={processPayment}
            disabled={submitting || !paymentMethod}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            {submitting ? 'Processing Payment...' : 'Confirm Payment'}
          </Button>
        </Card>
      )}

      {bookingSuccess ? (
        <Card className="border-emerald-200 bg-emerald-50 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">
                {bookingSuccess.kind === 'checkin' ? 'Guest checked in successfully' : 'Reservation captured successfully'}
              </div>
              <div className="mt-1 text-sm text-slate-600">{bookingSuccess.message}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white px-4 py-3">
                <div className="text-xs text-slate-500">Guest</div>
                <div className="font-semibold text-slate-900">{bookingSuccess.guestName}</div>
              </div>
              <div className="rounded-xl bg-white px-4 py-3">
                <div className="text-xs text-slate-500">Room</div>
                <div className="font-semibold text-slate-900">{bookingSuccess.roomNumber}</div>
              </div>
              <div className="rounded-xl bg-white px-4 py-3">
                <div className="text-xs text-slate-500">Token</div>
                <div className="font-semibold text-indigo-700">{bookingSuccess.token}</div>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading realistic hotel inventory...
        </div>
      ) : null}
    </div>
  )
}
