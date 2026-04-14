import { useEffect, useMemo, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import Input from '../components/ui/Input.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Select from '../components/ui/Select.jsx'
import Table from '../components/ui/Table.jsx'
import { useToast } from '../components/ui/useToast.js'
import { hotelApi } from '../services/hotelApi.js'
import { formatCurrency, formatDate } from '../utils/format.js'

export default function TariffRevisionPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [rooms, setRooms] = useState([])
  const [plans, setPlans] = useState([])
  const [roomId, setRoomId] = useState('')
  const [percentage, setPercentage] = useState(5)
  const [saving, setSaving] = useState(false)

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(roomId)) || null,
    [rooms, roomId],
  )

  const roomOptions = useMemo(
    () =>
      rooms.map((room) => ({
        value: room.id,
        label: `${room.number} • ${room.roomType} • ${formatCurrency(room.currentTariff)}`,
      })),
    [rooms],
  )

  async function load() {
    setLoading(true)
    try {
      const [roomList, planList] = await Promise.all([
        hotelApi.listRooms(),
        hotelApi.listTariffRevisionPlans(),
      ])
      setRooms(roomList)
      setPlans(planList)
      if (!roomId && roomList.length) {
        setRoomId(String(roomList[0].id))
      }
    } catch (error) {
      toast.pushToast({
        type: 'error',
        title: 'Failed to load tariff data',
        message: error?.message || 'Unable to fetch room tariffs right now.',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function validateInput() {
    const value = Number(percentage)
    if (!roomId) return 'Select a room first.'
    if (!Number.isFinite(value) || value === 0) {
      return 'Enter a valid non-zero revision percentage.'
    }
    if (Math.abs(value) > 100) {
      return 'Percentage should be between -100 and 100.'
    }
    return null
  }

  async function reviseNow() {
    const error = validateInput()
    if (error) {
      toast.pushToast({ type: 'warning', title: 'Invalid input', message: error })
      return
    }
    setSaving(true)
    try {
      await hotelApi.reviseTariffNow({ roomId: Number(roomId), percentage: Number(percentage) })
      toast.pushToast({
        type: 'success',
        title: 'Tariff updated',
        message: 'Current tariff has been revised successfully.',
      })
      await load()
    } catch (err) {
      toast.pushToast({
        type: 'error',
        title: 'Tariff update failed',
        message: err?.message || 'Could not revise tariff.',
      })
    } finally {
      setSaving(false)
    }
  }

  async function scheduleNextWeek() {
    const error = validateInput()
    if (error) {
      toast.pushToast({ type: 'warning', title: 'Invalid input', message: error })
      return
    }
    setSaving(true)
    try {
      await hotelApi.scheduleTariffRevision({ roomId: Number(roomId), percentage: Number(percentage) })
      toast.pushToast({
        type: 'success',
        title: 'Revision scheduled',
        message: 'Tariff plan has been scheduled for next week.',
      })
      await load()
    } catch (err) {
      toast.pushToast({
        type: 'error',
        title: 'Scheduling failed',
        message: err?.message || 'Could not schedule tariff revision.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tariff Revision"
        subtitle="Adjust tariffs immediately or schedule a planned revision for next week."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <div className="text-sm font-semibold text-slate-900">Revision Controls</div>
          <div className="mt-4 space-y-4">
            <Select
              label="Room"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              options={roomOptions.length ? roomOptions : [{ value: '', label: 'No rooms available' }]}
              disabled={!roomOptions.length}
            />
            <Input
              label="Revision Percentage"
              type="number"
              value={percentage}
              onChange={(event) => setPercentage(event.target.value)}
              hint="Use positive values to increase, negative values to decrease."
            />

            {selectedRoom ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="text-slate-600">Current Tariff</div>
                <div className="font-semibold text-slate-900">
                  {formatCurrency(selectedRoom.currentTariff)}
                </div>
              </div>
            ) : null}

            <Button type="button" onClick={reviseNow} disabled={saving || loading || !roomId} className="w-full">
              {saving ? 'Saving...' : 'Apply Revision Now'}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={scheduleNextWeek}
              disabled={saving || loading || !roomId}
              className="w-full"
            >
              Schedule for Next Week
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={load}
              disabled={saving || loading}
              className="w-full"
            >
              Refresh
            </Button>
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-slate-900">Scheduled Tariff Plans</div>
          </div>
          <div className="mt-3">
            <Table>
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                  <th className="px-4 py-3">Plan ID</th>
                  <th className="px-4 py-3">Room</th>
                  <th className="px-4 py-3">Change</th>
                  <th className="px-4 py-3">Original</th>
                  <th className="px-4 py-3">Revised</th>
                  <th className="px-4 py-3">Effective</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.planId} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-700">{plan.planId}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {plan?.room?.roomId ? `Room ${plan.room.roomId}` : '--'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{Number(plan.percentage || 0).toFixed(2)}%</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(plan.originalTariff)}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(plan.revisedTariff)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(plan.effectiveFrom)} - {formatDate(plan.effectiveTo)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          'rounded-full px-2 py-1 text-xs font-semibold',
                          plan.applied
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700',
                        ].join(' ')}
                      >
                        {plan.applied ? 'Applied' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!plans.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                      No tariff plans scheduled yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
