import { useEffect, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import { hotelApi } from '../services/hotelApi.js'
import { useToast } from '../components/ui/useToast.js'

const TIER_HELP = {
  SILVER: ['5% discount on billing', 'Priority room allocation'],
  GOLD: ['10% discount on billing', 'Free breakfast coupon'],
  PLATINUM: ['15% discount on billing', 'Priority check-in'],
}

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

export default function FrequentGuestsPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [guests, setGuests] = useState([])
  const [frequentGuests, setFrequentGuests] = useState([])
  const [guestUpdateForm, setGuestUpdateForm] = useState({ guestId: '', name: '', contact: '' })
  const [form, setForm] = useState({ guestId: '', tier: 'SILVER' })
  const [errors, setErrors] = useState({})

  async function load() {
    setLoading(true)
    try {
      const [guestList, frequentList] = await Promise.all([
        hotelApi.listGuests(),
        hotelApi.listFrequentGuests(),
      ])
      setGuests(guestList)
      setFrequentGuests(frequentList)
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Failed to load guest data',
        message: e?.message || 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function validateRegistration() {
    const next = {}
    if (!form.guestId) next.guestId = 'Please select a guest'
    return next
  }

  function validateGuestUpdate() {
    const next = {}
    if (!guestUpdateForm.name.trim()) next.name = 'Name is required'
    if (!guestUpdateForm.contact.trim()) next.contact = 'Contact is required'
    if (!guestUpdateForm.guestId) next.guestId = 'Select a guest to update'
    return next
  }

  async function submitRegistration() {
    const nextErrors = validateRegistration()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      const created = await hotelApi.registerFrequentGuest(Number(form.guestId), form.tier)
      toast.pushToast({
        type: 'success',
        title: 'Frequent Guest Registered',
        message: `Generated ID: ${created.frequentGuestId}`,
      })
      setForm({ guestId: '', tier: 'SILVER' })
      await load()
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Registration failed',
        message: e?.message || 'Unknown error',
      })
    }
  }

  async function updateGuest() {
    const nextErrors = validateGuestUpdate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      await hotelApi.updateGuest(guestUpdateForm.guestId, {
        guestId: Number(guestUpdateForm.guestId),
        name: guestUpdateForm.name,
        contactNumber: guestUpdateForm.contact,
      })
      toast.pushToast({
        type: 'success',
        title: 'Guest updated',
        message: 'Guest details have been saved.',
      })
      setGuestUpdateForm({ guestId: '', name: '', contact: '' })
      await load()
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Update failed',
        message: e?.message || 'Unknown error',
      })
    }
  }

  function selectGuestForEdit(guest) {
    setGuestUpdateForm({
      guestId: guest.guestId,
      name: guest.name || '',
      contact: guest.contactNumber || '',
    })
    setErrors({})
  }

  const registeredGuestIds = new Set(frequentGuests.map((g) => Number(g.guestId)))
  const guestOptions = guests
    .filter((guest) => !registeredGuestIds.has(Number(guest.guestId)))
    .map((guest) => ({
      value: String(guest.guestId),
      label: `${guest.guestId} • ${guest.name} • ${guest.contactNumber}`,
    }))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Guest Management"
        subtitle="Manage hotel guests and register frequent guest profiles for discounts."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <div className="text-sm font-semibold text-slate-900">Register Frequent Guest</div>
          <div className="mt-4 space-y-4">
            <Input
              label="Guest source"
              value={guestOptions.length ? 'Existing guest records' : 'No eligible guests available'}
              readOnly
            />
            <Select
              label="Guest"
              value={form.guestId}
              onChange={(e) => setForm((f) => ({ ...f, guestId: e.target.value }))}
              options={
                guestOptions.length
                  ? [{ value: '', label: 'Select guest' }, ...guestOptions]
                  : [{ value: '', label: 'No eligible guests to register' }]
              }
              error={errors.guestId}
              disabled={!guestOptions.length}
            />
            <Select
              label="Tier"
              value={form.tier}
              onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
              options={[
                { value: 'SILVER', label: 'Silver (5% off)' },
                { value: 'GOLD', label: 'Gold (10% off)' },
                { value: 'PLATINUM', label: 'Platinum (15% off)' },
              ]}
            />
            <Button onClick={submitRegistration} disabled={loading} type="button" className="w-full">
              Register Guest
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="text-sm font-semibold text-slate-900">Guest Directory</div>
            <div className="mt-3 overflow-x-auto">
              <Table>
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                    <th className="px-4 py-3">Guest ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Room Type</th>
                    <th className="px-4 py-3">Visits</th>
                    <th className="px-4 py-3">Check-in</th>
                    <th className="px-4 py-3">Check-out</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {guests.map((guest) => (
                    <tr key={guest.guestId} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-medium text-slate-900">{guest.guestId}</td>
                      <td className="px-4 py-3 text-slate-700">{guest.name}</td>
                      <td className="px-4 py-3 text-slate-700">{guest.contactNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{guest.roomType}</td>
                      <td className="px-4 py-3 text-slate-700">{guest.stayCount ?? 0}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDate(guest.arrivalDate)}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDate(guest.expectedCheckOutDate)}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => selectGuestForEdit(guest)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!guests.length ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-sm text-slate-500">
                        No guests found. Create reservations or check-ins to populate guest records.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-semibold text-slate-900">Edit Guest</div>
            <div className="mt-4 space-y-4">
              <Input
                label="Guest ID"
                value={guestUpdateForm.guestId}
                readOnly
                placeholder="Select a guest above"
                error={errors.guestId}
              />
              <Input
                label="Name"
                value={guestUpdateForm.name}
                onChange={(e) => setGuestUpdateForm((f) => ({ ...f, name: e.target.value }))}
                error={errors.name}
              />
              <Input
                label="Contact"
                value={guestUpdateForm.contact}
                onChange={(e) => setGuestUpdateForm((f) => ({ ...f, contact: e.target.value }))}
                error={errors.contact}
              />
              <div className="flex gap-3">
                <Button onClick={updateGuest} disabled={loading || !guestUpdateForm.guestId} type="button">
                  Save Changes
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setGuestUpdateForm({ guestId: '', name: '', contact: '' })}
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 pb-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">Frequent Guests</div>
            <div className="text-xs text-slate-500">Registered guests who receive discounts and priority service.</div>
          </div>
          <Button variant="secondary" type="button" onClick={load} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <Table>
          <thead>
            <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Visits</th>
              <th className="px-4 py-3">Last Stay</th>
            </tr>
          </thead>
          <tbody>
            {frequentGuests.map((g) => (
              <tr key={g.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{g.id}</td>
                <td className="px-4 py-3 text-slate-700">{g.name}</td>
                <td className="px-4 py-3 text-slate-700">{g.contact}</td>
                <td className="px-4 py-3 text-slate-700">{g.tier}</td>
                <td className="px-4 py-3 text-slate-700">{g.discountPct}%</td>
                <td className="px-4 py-3 text-slate-700">{g.stayCount ?? 0}</td>
                <td className="px-4 py-3 text-slate-700">{formatDate(g.lastVisitedOn)}</td>
              </tr>
            ))}
            {!frequentGuests.length ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                  No frequent guests registered yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
