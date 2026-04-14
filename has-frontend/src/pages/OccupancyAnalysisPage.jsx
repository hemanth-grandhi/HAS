import { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Select from '../components/ui/Select.jsx'
import OccupancyChart from '../components/charts/OccupancyChart.jsx'
import { hotelApi } from '../services/hotelApi.js'
import { useToast } from '../components/ui/useToast.js'
import Table from '../components/ui/Table.jsx'
import { formatDate } from '../utils/format.js'

export default function OccupancyAnalysisPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(14)
  const [mode, setMode] = useState('line') // line|bar
  const [trend, setTrend] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await hotelApi.getOccupancyTrend({ days })
      setTrend(data)
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Failed to load occupancy trend',
        message: e?.message || 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  const points = useMemo(() => trend?.points ?? [], [trend])
  const avg = trend?.averageOccupancyPct ?? 0

  return (
    <div className="space-y-4">
      <PageHeader
        title="Occupancy Analysis"
        subtitle="Track occupancy trends over time with simple bar/line charts."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <div className="text-sm font-semibold text-slate-900">Chart Controls</div>
          <div className="mt-4 space-y-4">
            <Select
              label="Time Range"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              options={[
                { value: 7, label: 'Last 7 days' },
                { value: 14, label: 'Last 14 days' },
                { value: 30, label: 'Last 30 days' },
              ]}
            />
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-800">Graph Type</div>
              <div className="flex gap-2">
                <Button
                  variant={mode === 'line' ? 'primary' : 'secondary'}
                  type="button"
                  onClick={() => setMode('line')}
                >
                  Line
                </Button>
                <Button
                  variant={mode === 'bar' ? 'primary' : 'secondary'}
                  type="button"
                  onClick={() => setMode('bar')}
                >
                  Bar
                </Button>
              </div>
            </div>
            <Button variant="secondary" onClick={load} disabled={loading} type="button" className="w-full">
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Occupancy Trend</div>
                <div className="mt-1 text-xs text-slate-500">
                  Average occupancy: <span className="font-semibold text-slate-800">{avg.toFixed(1)}%</span>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {trend?.totalRooms ?? '--'} total rooms
              </div>
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                  Loading chart...
                </div>
              ) : (
                <OccupancyChart points={points} mode={mode} />
              )}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-semibold text-slate-900">Daily Details</div>
            <div className="mt-2">
              <Table>
                <thead>
                  <tr className="bg-slate-50 text-xs font-semibold text-slate-700">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Occupied Rooms</th>
                    <th className="px-4 py-3">Occupancy (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map((p) => (
                    <tr key={p.dayISO} className="border-t border-slate-100">
                      <td className="px-4 py-3 text-slate-700">{formatDate(p.dayISO)}</td>
                      <td className="px-4 py-3 text-slate-700">{p.occupiedRooms}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-700">{p.occupancyPct}%</td>
                    </tr>
                  ))}
                  {!points.length ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-10 text-center text-sm text-slate-500">
                        No trend data available.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

