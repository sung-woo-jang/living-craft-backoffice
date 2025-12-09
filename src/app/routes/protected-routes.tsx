import { type ReactNode } from 'react'
import { AuthenticatedLayout } from '@/app/layout'
// Template Pages (참고용)
import { Apps } from '@/pages/apps'
import { Chats } from '@/pages/chats'
import { CustomersPage } from '@/pages/customers'
import { Dashboard } from '@/pages/dashboard'
import { HelpCenter } from '@/pages/help-center'
import { PortfoliosPage } from '@/pages/portfolios'
// Living Craft Pages
import { ReservationsPage } from '@/pages/reservations'
import { ReviewsPage } from '@/pages/reviews'
import { ServicesPage } from '@/pages/services'
import { OperatingHoursPage } from '@/pages/settings/operating-hours'
import { Tasks } from '@/pages/tasks'
import { Users } from '@/pages/users'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { Route } from 'react-router-dom'

interface ProtectedRoutesProps {
  children?: ReactNode
}

export function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  return (
    <Route
      path='/'
      element={
        <ProtectedRoute>
          <AuthenticatedLayout />
        </ProtectedRoute>
      }
    >
      {/* Living Craft Routes */}
      <Route index element={<Dashboard />} />
      <Route path='reservations' element={<ReservationsPage />} />
      <Route path='services' element={<ServicesPage />} />
      <Route path='portfolios' element={<PortfoliosPage />} />
      <Route path='reviews' element={<ReviewsPage />} />
      <Route path='customers' element={<CustomersPage />} />
      <Route path='settings/operating' element={<OperatingHoursPage />} />

      {/* Template Routes (참고용) */}
      <Route path='apps' element={<Apps />} />
      <Route path='chats' element={<Chats />} />
      <Route path='tasks' element={<Tasks />} />
      <Route path='users' element={<Users />} />
      <Route path='help-center' element={<HelpCenter />} />

      {children}
    </Route>
  )
}
