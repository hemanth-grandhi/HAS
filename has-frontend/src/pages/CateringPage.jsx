import { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Select from '../components/ui/Select.jsx'
import { hotelApi } from '../services/hotelApi.js'
import { useToast } from '../components/ui/useToast.js'
import { formatDateTime } from '../utils/format.js'

const MENU = [
  { name: 'Breakfast', price: 350 },
  { name: 'Lunch', price: 650 },
  { name: 'Dinner', price: 750 },
  { name: 'Tea', price: 30 },
  { name: 'Coffee', price: 50 },
  { name: 'Snacks', price: 180 },
]

export default function CateringPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [activeReservations, setActiveReservations] = useState([])

  const [token, setToken] = useState('')
  const [form, setForm] = useState({
    itemName: 'Breakfast',
    qty: 1,
    unitPrice: MENU[0].price,
  })
  const [entries, setEntries] = useState([])
  const [errors, setErrors] = useState({})

  const menuOptions = useMemo(
    () => MENU.map((m) => ({ value: m.name, label: `${m.name} (${m.price} INR)` })),
    [],
  )

  async function load() {
    setLoading(true)
    try {
      const res = await hotelApi.listActiveReservations()
      setActiveReservations(res)
      const first = res[0]
      if (first) {
        setToken(first.token)
      } else {
        setToken('')
      }
    } catch (e) {
      setActiveReservations([])
      setToken('')
      toast.pushToast({
        type: 'error',
        title: 'Failed to load catering form',
        message: e?.message || 'Unknown error',
      })
    } finally {
      setLoading(false)
    }
  }

  async function loadEntries(tk) {
    try {
      const list = await hotelApi.listCateringForToken(tk)
      setEntries(list)
    } catch (e) {
      setEntries([])
      toast.pushToast({
        type: 'error',
        title: 'Failed to load orders',
        message: e?.message || 'Unknown error',
      })
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!token) return
    loadEntries(token)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function validate() {
    const next = {}
    if (!token.trim()) next.token = 'Token is required'
    if (!form.itemName.trim()) next.itemName = 'Item name is required'
    if (!Number(form.qty) || Number(form.qty) <= 0) next.qty = 'Quantity must be greater than 0'
    if (!Number(form.unitPrice) || Number(form.unitPrice) < 0) next.unitPrice = 'Unit price is required'
    return next
  }

  async function submit() {
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    try {
      await hotelApi.addCateringItem({
        token,
        items: [
          {
            name: form.itemName,
            qty: Number(form.qty),
            unitPrice: Number(form.unitPrice),
          },
        ],
      })
      toast.pushToast({
        type: 'success',
        title: 'Catering logged',
        message: 'Food item added to the guest token.',
      })

      setForm({ itemName: 'Breakfast', qty: 1, unitPrice: MENU[0].price })
      await loadEntries(token)
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Could not log catering',
        message: e?.message || 'Unknown error',
      })
    }
  }

  const tokenOptions = activeReservations.map((r) => ({
    value: r.token,
    label: `${r.token} • Room ${r.roomNumber} • ${r.guestName}`,
  }))

  return (
    <div className="space-y-4">
      <PageHeader
        title="Catering Services"
        subtitle="Log food items consumed and associate entries with the guest token number."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <div className="text-sm font-semibold text-slate-900">Add Order</div>

          <div className="mt-4 space-y-4">
            <Select
              label="Guest Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              error={errors.token}
              options={[
                { value: '', label: 'Select token...' },
                ...tokenOptions,
              ]}
            />

            <Select
              label="Food Item"
              value={form.itemName}
              onChange={(e) => {
                const name = e.target.value
                const menu = MENU.find((m) => m.name === name)
                setForm((f) => ({
                  ...f,
                  itemName: name,
                  unitPrice: menu ? menu.price : f.unitPrice,
                }))
              }}
              error={errors.itemName}
              options={menuOptions}
            />

            <Input
              label="Quantity"
              type="number"
              min={1}
              value={form.qty}
              onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
              error={errors.qty}
            />
            <Input
              label="Unit Price (INR)"
              type="number"
              min={0}
              value={form.unitPrice}
              onChange={(e) => setForm((f) => ({ ...f, unitPrice: e.target.value }))}
              error={errors.unitPrice}
            />

            <Button onClick={submit} disabled={loading} type="button" className="w-full">
              Add to Token
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  Ordered Items
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Token: <span className="font-semibold text-slate-700">{token || '--'}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => token && loadEntries(token)}
                type="button"
                disabled={!token}
              >
                Refresh
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {!token ? (
                <div className="text-sm text-slate-500">
                  Select an active reservation token to view orders.
                </div>
              ) : entries.length ? (
                entries.map((e) => (
                  <div key={e.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        {formatDateTime(e.createdAtISO)}
                      </div>
                      <div className="text-xs font-semibold text-indigo-700">
                        Order Total: {e.orderTotal.toLocaleString('en-IN')} INR
                      </div>
                    </div>
                    <div className="mt-2 space-y-2 text-sm text-slate-700">
                      {e.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between gap-3">
                          <div>
                            <span className="font-medium">{it.name}</span>{' '}
                            <span className="text-slate-500">x{it.qty}</span>
                          </div>
                          <div>
                            {(Number(it.qty) * Number(it.unitPrice)).toLocaleString('en-IN')} INR
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">
                  No catering items logged for this token yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

