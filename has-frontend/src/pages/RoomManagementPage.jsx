import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import Modal from '../components/ui/Modal.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import { useToast } from '../components/ui/useToast.js'
import { hotelApi } from '../services/hotelApi.js'
import { getMinCheckInDate, getMinCheckOutDate, isValidDateRange } from '../utils/dateUtils.js'
import { validateContactNumber, contactForBackend } from '../utils/contactUtils.js'

const COUNTRY_OPTIONS = [
  { value: 'IN', label: 'IN +91' },
  { value: 'US', label: 'US +1' },
  { value: 'UK', label: 'UK +44' },
  { value: 'AU', label: 'AU +61' },
]

function splitFullName(name = '') {
  const [firstName = '', ...rest] = String(name).trim().split(/\s+/)
  return {
    firstName,
    lastName: rest.join(' '),
  }
}

export default function RoomManagementPage() {
  const toast = useToast()
  const todayIso = getMinCheckInDate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [rooms, setRooms] = useState([])
  const [frequentGuests, setFrequentGuests] = useState([])
  const [query, setQuery] = useState('')
  const [allocateRoomId, setAllocateRoomId] = useState(null)
  const [openAllocate, setOpenAllocate] = useState(false)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    countryCode: 'IN',
    frequentGuestId: '',
    checkInDate: todayIso,
    checkOutDate: getMinCheckOutDate(todayIso),
  })

  const selectedRoom = useMemo(
    () => rooms.find((room) => room.id === allocateRoomId) ?? null,
    [allocateRoomId, rooms],
  )

  const summary = useMemo(() => {
    const occupiedRooms = rooms.filter((room) => room.status === 'OCCUPIED').length
    return {
      totalRooms: rooms.length,
      occupiedRooms,
      availableRooms: rooms.length - occupiedRooms,
    }
  }, [rooms])

  const filteredRooms = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (!text) return rooms

    return rooms.filter((room) =>
      [
        room.number,
        room.roomType,
        room.bedType,
        room.climate,
        room.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text)),
    )
  }, [rooms, query])

  async function load() {
    setLoading(true)
    try {
      const [roomsRes, frequentRes] = await Promise.all([
        hotelApi.listRooms(),
        hotelApi.listFrequentGuests(),
      ])
      setRooms(roomsRes)
      setFrequentGuests(frequentRes)
    } catch (error) {
      toast.pushToast({
        type: 'error',
        title: 'Could not load rooms',
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

  function openAllocateFor(roomId) {
    setAllocateRoomId(roomId)
    setErrors({})
    setForm({
      firstName: '',
      lastName: '',
      contact: '',
      countryCode: 'IN',
      frequentGuestId: '',
      checkInDate: todayIso,
      checkOutDate: getMinCheckOutDate(todayIso),
    })
    setOpenAllocate(true)
  }

  function updateForm(patch) {
    setForm((current) => ({ ...current, ...patch }))
  }

  function handleFrequentGuestChange(event) {
    const frequentGuestId = event.target.value
    const selectedGuest = frequentGuests.find((guest) => String(guest.id) === frequentGuestId)
    const { firstName, lastName } = splitFullName(selectedGuest?.name)

    updateForm({
      frequentGuestId,
      firstName: selectedGuest ? firstName : form.firstName,
      lastName: selectedGuest ? lastName : form.lastName,
      contact: selectedGuest?.contact || form.contact,
    })
  }

  function validateForm() {
    const nextErrors = {}

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required'
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required'
    if (!form.contact.trim()) nextErrors.contact = 'Contact number is required'
    if (!isValidDateRange(form.checkInDate, form.checkOutDate)) {
      nextErrors.checkInDate = 'Choose valid stay dates'
      nextErrors.checkOutDate = 'Choose valid stay dates'
    }

    const contactValidation = validateContactNumber(form.contact, form.countryCode)
    if (!contactValidation.valid) {
      nextErrors.contact = contactValidation.error
    }

    return nextErrors
  }

  async function submitAllocate() {
    const nextErrors = validateForm()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length || !selectedRoom) return

    setSubmitting(true)
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        name: `${form.firstName} ${form.lastName}`.trim(),
        contactNumber: contactForBackend(form.contact),
        countryCode: form.countryCode,
        frequentGuestId: form.frequentGuestId ? Number(form.frequentGuestId) : undefined,
        roomId: selectedRoom.id,
        roomType: selectedRoom.roomType,
        arrivalDate: form.checkInDate,
        expectedCheckOutDate: form.checkOutDate,
        advancePayment: 0,
      }

      const response =
        form.checkInDate === todayIso
          ? await hotelApi.createWalkInCheckIn(payload)
          : await hotelApi.createReservation({
              ...payload,
              startDate: `${form.checkInDate}T14:00:00`,
              endDate: `${form.checkOutDate}T11:00:00`,
            })

      toast.pushToast({
        type: 'success',
        title: form.checkInDate === todayIso ? 'Room allocated and occupied' : 'Room reserved successfully',
        message: response.message,
      })

      setOpenAllocate(false)
      await load()
    } catch (error) {
      toast.pushToast({
        type: 'error',
        title: 'Allocation failed',
        message: error?.message || 'Unknown error',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Room Management"
        subtitle="Manage a realistic hotel inventory across floors, track active occupancy, and reserve or assign rooms with real stay dates."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">Total Rooms</div>
          <div className="mt-2 text-3xl font-semibold text-slate-900">{summary.totalRooms}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">Available Now</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-700">{summary.availableRooms}</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-500">Occupied Now</div>
          <div className="mt-2 text-3xl font-semibold text-amber-700">{summary.occupiedRooms}</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Live Room Inventory</div>
            <div className="text-sm text-slate-500">
              Search by room number, category, climate, bed type, or current status.
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search 204, suite, king, AC..."
              label={null}
              className="sm:w-80"
            />
            <Button variant="secondary" onClick={load} disabled={loading}>
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Table>
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Bed</th>
                <th className="px-4 py-3">Rate</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room) => {
                const isOccupied = room.status === 'OCCUPIED'
                return (
                  <tr key={room.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      Room {room.number}
                      <div className="text-xs text-slate-500">Floor {room.floor}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {room.roomType}
                      <div className="text-xs text-slate-500">{room.climate}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{room.bedType}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {room.ratePerNight.toLocaleString('en-IN')} INR/night
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          isOccupied
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOccupied ? 'Occupied' : 'Available'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant={isOccupied ? 'ghost' : 'primary'}
                        disabled={isOccupied}
                        onClick={() => openAllocateFor(room.id)}
                      >
                        {isOccupied ? 'Currently Occupied' : 'Allocate / Reserve'}
                      </Button>
                    </td>
                  </tr>
                )
              })}
              {!filteredRooms.length ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                    No rooms match that search yet. Try room number, room type, climate, or status.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </Table>
        </div>
      </Card>

      <Modal
        open={openAllocate}
        title={selectedRoom ? `Allocate Room ${selectedRoom.number}` : 'Allocate Room'}
        onClose={() => setOpenAllocate(false)}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpenAllocate(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitAllocate} disabled={submitting || !selectedRoom}>
              {submitting ? 'Saving...' : form.checkInDate === todayIso ? 'Confirm Check-in' : 'Create Reservation'}
            </Button>
          </div>
        }
      >
        {selectedRoom ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">
                Room {selectedRoom.number} • {selectedRoom.roomType}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {selectedRoom.climate}, {selectedRoom.bedType} bed, {selectedRoom.ratePerNight.toLocaleString('en-IN')} INR/night
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="First Name"
                value={form.firstName}
                onChange={(event) => updateForm({ firstName: event.target.value })}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                value={form.lastName}
                onChange={(event) => updateForm({ lastName: event.target.value })}
                error={errors.lastName}
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
                    className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-900 focus:outline-none ${
                      errors.contact ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
                    }`}
                  />
                </div>
                {errors.contact ? <div className="mt-1 text-xs font-medium text-rose-600">{errors.contact}</div> : null}
              </div>
              <Select
                label="Frequent Guest"
                value={form.frequentGuestId}
                onChange={handleFrequentGuestChange}
                options={[
                  { value: '', label: 'Select loyalty guest (optional)' },
                  ...frequentGuests.map((guest) => ({
                    value: String(guest.id),
                    label: `${guest.name} - ${guest.tier}`,
                  })),
                ]}
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
                  })
                }
                error={errors.checkInDate}
              />
              <Input
                label="Check-out Date"
                type="date"
                min={getMinCheckOutDate(form.checkInDate)}
                value={form.checkOutDate}
                onChange={(event) => updateForm({ checkOutDate: event.target.value })}
                error={errors.checkOutDate}
              />
            </div>

            <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-slate-200">
              {form.checkInDate === todayIso
                ? 'This action creates an active stay immediately and marks the room as occupied.'
                : 'This action creates a reservation for the selected future dates while keeping the room available until arrival.'}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
