import { AuthenticatedLayout } from '@/app/layout'
import { Apps } from '@/pages/apps'
import { ForgotPassword } from '@/pages/auth/forgot-password'
import { Otp } from '@/pages/auth/otp'
import { SignIn, SignIn2 } from '@/pages/auth/sign-in'
import { SignUp } from '@/pages/auth/sign-up'
import { Chats } from '@/pages/chats'
import { CustomersPage } from '@/pages/customers'
import { Dashboard } from '@/pages/dashboard'
import {
  GeneralError,
  MaintenanceError,
  NotFoundError,
  UnauthorisedError,
} from '@/pages/errors'
import { HelpCenter } from '@/pages/help-center'
import { LoginPage } from '@/pages/login/LoginPage'
import { PortfoliosPage } from '@/pages/portfolios'
import { ReservationsPage } from '@/pages/reservations'
import { ReviewsPage } from '@/pages/reviews'
import { ServicesPage } from '@/pages/services'
import { OperatingHoursPage } from '@/pages/settings/operating-hours'
import { Tasks } from '@/pages/tasks'
import { Users } from '@/pages/users'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { Routes, Route } from 'react-router-dom'

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path='/login' element={<LoginPage />} />
      <Route path='/sign-in' element={<SignIn />} />
      <Route path='/sign-in-2' element={<SignIn2 />} />
      <Route path='/sign-up' element={<SignUp />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/otp' element={<Otp />} />

      {/* Protected Routes */}
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
      </Route>

      {/* Error Routes */}
      <Route path='/500' element={<GeneralError />} />
      <Route path='/404' element={<NotFoundError />} />
      <Route path='/503' element={<MaintenanceError />} />
      <Route path='/401' element={<UnauthorisedError />} />
      <Route path='*' element={<NotFoundError />} />
    </Routes>
  )
}
