import { useEffect, useMemo, useState } from 'react'
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import Button from './components/ui/Button.jsx'
import Card from './components/ui/Card.jsx'
import Input from './components/ui/Input.jsx'
import { ToastProvider } from './components/ui/Toast.jsx'
import { useToast } from './components/ui/useToast.js'
import DashboardPage from './pages/DashboardPage.jsx'
import RoomManagementPage from './pages/RoomManagementPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import ReservationCheckInPage from './pages/ReservationCheckInPage.jsx'
import CateringPage from './pages/CateringPage.jsx'
import BillingCheckoutPage from './pages/BillingCheckoutPage.jsx'
import FrequentGuestsPage from './pages/FrequentGuestsPage.jsx'
import OccupancyAnalysisPage from './pages/OccupancyAnalysisPage.jsx'
import TariffRevisionPage from './pages/TariffRevisionPage.jsx'
import { api } from './services/api.js'
import { canAccessPath, getDefaultRoute, getNavItems } from './authz.js'

function RouteGuard({ session, path, children }) {
  if (!canAccessPath(session?.authorities, path)) {
    return <Navigate to={getDefaultRoute(session?.authorities)} replace />
  }
  return children
}

function LoginPage({ onLoginSuccess }) {
  const toast = useToast()
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })

  async function submitLogin(event) {
    event.preventDefault()
    setSubmitting(true)
    try {
      const loginResponse = await api.post('/auth/login', form)
      if (!loginResponse?.data) {
        throw new Error('Invalid credentials')
      }
      const me = await api.get('/auth/me')
      if (!me?.data?.authenticated) {
        throw new Error('Session could not be established')
      }
      onLoginSuccess(me.data)
    } catch (error) {
      toast.pushToast({
        type: 'error',
        title: 'Login failed',
        message: error?.message || 'Unable to authenticate',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-xl font-semibold text-slate-900">System Login</div>
        <div className="text-sm text-slate-500 mt-1">Sign in with your system user credentials.</div>
        <form className="space-y-4 mt-6" onSubmit={submitLogin}>
          <Input
            label="Username"
            value={form.username}
            onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
            placeholder="admin / reception / catering / manager"
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Enter password"
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

function StaffShell({ session, onLogout }) {
  const role = session?.authorities?.[0]?.replace('ROLE_', '').replaceAll('_', ' ') || 'SYSTEM USER'
  const navItems = useMemo(() => getNavItems(session?.authorities), [session?.authorities])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col lg:flex-row">
        <aside className="w-full shrink-0 border-b border-slate-200 bg-white lg:w-[260px] lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 px-4 py-4">
            <div className="text-sm font-bold text-slate-900">Hotel Management System</div>
            <div className="mt-1 text-xs text-slate-500">Admin Dashboard</div>
          </div>
          <nav className="px-3 py-3">
            <div className="space-y-1">
              {navItems.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    [
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-700 hover:bg-slate-100',
                    ].join(' ')
                  }
                >
                  {it.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </aside>

        <main className="flex-1">
          <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-base font-semibold text-slate-900">{role} Console</div>
              <div className="text-xs text-slate-500 mt-1">
                Manage rooms, reservations, catering, billing, and occupancy.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">Signed in as {session?.username}</div>
              <Button type="button" variant="secondary" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await api.get('/auth/me')
        if (response?.data?.authenticated) {
          setSession(response.data)
        } else {
          setSession(null)
        }
      } catch {
        setSession(null)
      } finally {
        setLoading(false)
      }
    }
    loadSession()
  }, [])

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } finally {
      setSession(null)
    }
  }

  return (
    <ToastProvider>
      {loading ? (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
          Loading session...
        </div>
      ) : session ? (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StaffShell session={session} onLogout={handleLogout} />}>
              <Route index element={<Navigate to={getDefaultRoute(session?.authorities)} replace />} />
              <Route
                path="dashboard"
                element={
                  <RouteGuard session={session} path="/dashboard">
                    <DashboardPage />
                  </RouteGuard>
                }
              />
              <Route
                path="rooms"
                element={
                  <RouteGuard session={session} path="/rooms">
                    <RoomManagementPage />
                  </RouteGuard>
                }
              />
              <Route
                path="booking"
                element={
                  <RouteGuard session={session} path="/booking">
                    <BookingPage />
                  </RouteGuard>
                }
              />
              <Route
                path="check-in"
                element={
                  <RouteGuard session={session} path="/check-in">
                    <ReservationCheckInPage />
                  </RouteGuard>
                }
              />
              <Route
                path="catering"
                element={
                  <RouteGuard session={session} path="/catering">
                    <CateringPage />
                  </RouteGuard>
                }
              />
              <Route
                path="billing"
                element={
                  <RouteGuard session={session} path="/billing">
                    <BillingCheckoutPage />
                  </RouteGuard>
                }
              />
              <Route
                path="guests"
                element={
                  <RouteGuard session={session} path="/guests">
                    <FrequentGuestsPage />
                  </RouteGuard>
                }
              />
              <Route
                path="tariff"
                element={
                  <RouteGuard session={session} path="/tariff">
                    <TariffRevisionPage />
                  </RouteGuard>
                }
              />
              <Route
                path="occupancy"
                element={
                  <RouteGuard session={session} path="/occupancy">
                    <OccupancyAnalysisPage />
                  </RouteGuard>
                }
              />
              <Route path="*" element={<Navigate to={getDefaultRoute(session?.authorities)} replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      ) : (
        <LoginPage onLoginSuccess={setSession} />
      )}
    </ToastProvider>
  )
}
