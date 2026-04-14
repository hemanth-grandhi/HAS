import { useEffect, useState } from 'react'
import Button from '../components/ui/Button.jsx'
import Card from '../components/ui/Card.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import { useToast } from '../components/ui/useToast.js'
import { hotelApi } from '../services/hotelApi.js'
import { formatDateDisplay } from '../utils/dateUtils.js'

export default function DashboardPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await hotelApi.getDashboardSummary()
      setSummary(data)
    } catch (error) {
      toast.pushToast({
        type: 'error',
        title: 'Could not load dashboard',
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

  const metricCards = [
    { label: 'Total Rooms', value: summary?.totalRooms ?? '--', accent: 'text-slate-900' },
    { label: 'Occupied Rooms', value: summary?.occupiedRooms ?? '--', accent: 'text-amber-700' },
    { label: 'Available Rooms', value: summary?.availableRooms ?? '--', accent: 'text-emerald-700' },
    { label: 'Frequent Guests', value: summary?.frequentGuestsCount ?? '--', accent: 'text-indigo-700' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Track hotel inventory, current occupancy, loyalty counts, and recent guest activity from one front-desk overview."
      />

      <div className="flex justify-end">
        <Button variant="secondary" onClick={load} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Dashboard'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
        {metricCards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="text-sm font-medium text-slate-500">{card.label}</div>
            <div className={`mt-2 text-3xl font-semibold ${card.accent}`}>{card.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="p-5">
          <div className="text-sm font-semibold text-slate-900">Recent Guest History</div>
          <div className="mt-4 space-y-3">
            {summary?.recentGuests?.map((guest) => (
              <div key={guest.guestId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{guest.name}</div>
                    <div className="text-sm text-slate-500">
                      {guest.roomType || 'Guest profile'} • {guest.stayCount} visit{guest.stayCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    Last stay: {guest.lastVisitedOn ? formatDateDisplay(guest.lastVisitedOn) : '--'}
                  </div>
                </div>
              </div>
            ))}
            {!summary?.recentGuests?.length ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Guest history will appear here once reservations and stays are available.
              </div>
            ) : null}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="text-sm font-semibold text-slate-900">Occupied Rooms Right Now</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {summary?.occupiedRoomNumbers?.length ? (
                summary.occupiedRoomNumbers.map((roomNumber) => (
                  <span
                    key={roomNumber}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800"
                  >
                    Room {roomNumber}
                  </span>
                ))
              ) : (
                <div className="text-sm text-slate-500">No rooms are occupied at the moment.</div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-sm font-semibold text-slate-900">Operations Snapshot</div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-xl bg-slate-50 p-3">
                Upcoming reservations: <span className="font-semibold text-slate-900">{summary?.activeReservationsCount ?? 0}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                Guest profiles in history: <span className="font-semibold text-slate-900">{summary?.guestHistoryCount ?? 0}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                Frequent guest program size: <span className="font-semibold text-slate-900">{summary?.frequentGuestsCount ?? 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
