import { useEffect, useMemo, useState } from 'react'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import PageHeader from '../components/ui/PageHeader.jsx'
import Select from '../components/ui/Select.jsx'
import { hotelApi } from '../services/hotelApi.js'
import { useToast } from '../components/ui/useToast.js'
import { formatCurrency, formatDateTime } from '../utils/format.js'

export default function BillingCheckoutPage() {
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [activeReservations, setActiveReservations] = useState([])

  const [token, setToken] = useState('')
  const [extraDiscountType, setExtraDiscountType] = useState('none') // none|amount|percent
  const [extraDiscountValue, setExtraDiscountValue] = useState(0)
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const res = await hotelApi.listActiveReservations()
      setActiveReservations(res)
      setToken(res[0]?.token ?? '')
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Failed to load billing',
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

  async function generate() {
    if (!token) return
    setPreviewLoading(true)
    try {
      const data = await hotelApi.getBillingPreview({
        token,
        extraDiscountType,
        extraDiscountValue,
      })
      setPreview(data)
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Invoice generation failed',
        message: e?.message || 'Unknown error',
      })
    } finally {
      setPreviewLoading(false)
    }
  }

  async function doCheckout() {
    if (!token) return
    try {
      await hotelApi.checkout({ token })
      toast.pushToast({
        type: 'success',
        title: 'Checked out successfully',
        message: 'Room is freed and billing is finalized.',
      })
      setPreview(null)
      await load()
    } catch (e) {
      toast.pushToast({
        type: 'error',
        title: 'Checkout failed',
        message: e?.message || 'Unknown error',
      })
    }
  }

  const tokenOptions = useMemo(
    () =>
      activeReservations.map((r) => ({
        value: r.token,
        label: `${r.token} • Room ${r.roomNumber} • ${r.guestName}`,
      })),
    [activeReservations],
  )

  const extraDiscountLabel =
    extraDiscountType === 'none'
      ? 'None'
      : extraDiscountType === 'amount'
        ? 'Amount (INR)'
        : 'Percent (%)'

  return (
    <div className="space-y-4">
      <PageHeader
        title="Billing & Checkout"
        subtitle="Generate an invoice with room charges, catering charges, and discounts."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <div className="text-sm font-semibold text-slate-900">Invoice Inputs</div>
          <div className="mt-4 space-y-4">
            <Select
              label="Check-In Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              options={
                tokenOptions.length
                  ? tokenOptions
                  : [{ value: '', label: 'No active check-ins' }]
              }
              hint={activeReservations.length ? '' : 'No active check-ins right now.'}
              disabled={activeReservations.length === 0}
            />

            <Select
              label="Additional Discount"
              value={extraDiscountType}
              onChange={(e) => setExtraDiscountType(e.target.value)}
              options={[
                { value: 'none', label: 'None' },
                { value: 'amount', label: 'Amount (INR)' },
                { value: 'percent', label: 'Percent (%)' },
              ]}
            />

            <Input
              label={extraDiscountType === 'percent' ? 'Discount Percent' : 'Discount Amount (INR)'}
              type="number"
              min={0}
              value={extraDiscountValue}
              onChange={(e) => setExtraDiscountValue(e.target.value)}
              disabled={extraDiscountType === 'none'}
            />

            <Button
              onClick={generate}
              disabled={previewLoading || !token}
              type="button"
              className="w-full"
            >
              {previewLoading ? 'Generating...' : 'Generate Invoice'}
            </Button>

            <Button
              variant="danger"
              onClick={doCheckout}
              disabled={!preview || previewLoading}
              type="button"
              className="w-full"
            >
              Check-out
            </Button>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {preview ? (
            <Card className="p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">INVOICE</div>
                  <div className="text-xs text-slate-500">
                    Check-In Token: <span className="font-semibold text-slate-800">{preview.token}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  Generated: {formatDateTime(preview.createdAtISO)}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-700">Guest Details</div>
                  <div className="mt-2 text-sm text-slate-800">
                    <div>
                      <span className="font-medium">Name:</span> {preview.guestName}
                    </div>
                    <div>
                      <span className="font-medium">Contact:</span> {preview.contact}
                    </div>
                    {preview.frequentGuestTier ? (
                      <div className="mt-1">
                        <span className="font-medium">Frequent Guest:</span> {preview.frequentGuestTier}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="text-xs font-semibold text-slate-700">Room Details</div>
                  <div className="mt-2 text-sm text-slate-800">
                    <div>
                      <span className="font-medium">Room:</span> {preview.roomNumber}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {preview.roomType}
                    </div>
                    <div>
                      <span className="font-medium">Bed:</span> {preview.bedType}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-sm">
                  <div className="text-slate-700">Room charges</div>
                  <div className="font-semibold text-slate-900">{formatCurrency(preview.roomCharges)}</div>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-sm">
                  <div className="text-slate-700">Catering charges</div>
                  <div className="font-semibold text-slate-900">{formatCurrency(preview.cateringCharges)}</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="text-xs font-semibold text-slate-700">Discounts</div>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-slate-700">
                        Frequent guest discount {preview.frequentGuestTier ? `(${preview.frequentGuestTier})` : '(not applied)'}
                      </div>
                      <div className="font-semibold text-emerald-700">
                        -{formatCurrency(preview.baseDiscountAmount)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-slate-700">
                        Additional discount ({extraDiscountLabel})
                      </div>
                      <div className="font-semibold text-emerald-700">
                        -{formatCurrency(preview.extraDiscountAmount)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                      <div className="text-slate-900 font-semibold">Total discount</div>
                      <div className="text-slate-900 font-semibold">
                        -{formatCurrency(preview.totalDiscountAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-3">
                  <div className="text-sm font-semibold text-indigo-900">Total payable</div>
                  <div className="text-lg font-extrabold text-indigo-900">
                    {formatCurrency(preview.totalPayable)}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-slate-900">Catering Line Items</div>
                {preview.cateringEntries.length ? (
                  <div className="mt-2 space-y-3">
                    {preview.cateringEntries.map((e) => (
                      <div key={e.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <div>{formatDateTime(e.createdAtISO)}</div>
                          <div className="font-semibold text-slate-800">
                            Order Total: {formatCurrency(e.orderTotal)}
                          </div>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-slate-800">
                          {e.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-3">
                              <div>
                                <span className="font-medium">{it.name}</span>{' '}
                                <span className="text-slate-500">x{it.qty}</span>
                              </div>
                              <div>{formatCurrency(it.unitPrice * it.qty)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">
                    No catering items for this check-in token.
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="text-sm font-semibold text-slate-900">Invoice Preview</div>
              <div className="mt-2 text-sm text-slate-600">
                Select a check-in token and click <span className="font-semibold">Generate Invoice</span>.
              </div>
            </Card>
          )}
        </div>
      </div>

      {loading && !activeReservations.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          Loading...
        </div>
      ) : null}
    </div>
  )
}

