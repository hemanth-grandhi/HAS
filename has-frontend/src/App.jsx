import { useMemo } from 'react'
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import RoomManagementPage from './pages/RoomManagementPage.jsx'
import BookingPage from './pages/BookingPage.jsx'
import ReservationCheckInPage from './pages/ReservationCheckInPage.jsx'
import CateringPage from './pages/CateringPage.jsx'
import BillingCheckoutPage from './pages/BillingCheckoutPage.jsx'
import FrequentGuestsPage from './pages/FrequentGuestsPage.jsx'
import OccupancyAnalysisPage from './pages/OccupancyAnalysisPage.jsx'

function StaffShell() {
  const role = 'ADMIN'
  const navItems = useMemo(
    () => [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/rooms', label: 'Room Management' },
      { to: '/booking', label: 'Book a Room' },
      { to: '/check-in', label: 'Check-in (Advanced)' },
      { to: '/catering', label: 'Catering Services' },
      { to: '/billing', label: 'Billing & Check-out' },
      { to: '/guests', label: 'Guests' },
      { to: '/occupancy', label: 'Occupancy Analysis' },
    ],
    [],
  )

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
              <div className="text-sm text-slate-500">Testing mode enabled</div>
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
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StaffShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="rooms" element={<RoomManagementPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="check-in" element={<ReservationCheckInPage />} />
            <Route path="catering" element={<CateringPage />} />
            <Route path="billing" element={<BillingCheckoutPage />} />
            <Route path="guests" element={<FrequentGuestsPage />} />
            <Route path="occupancy" element={<OccupancyAnalysisPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
