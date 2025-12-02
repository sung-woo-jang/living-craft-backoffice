import { AuthenticatedLayout } from '@/app/layout'
// Apps
import { Apps } from '@/pages/apps'
import { ForgotPassword } from '@/pages/auth/forgot-password'
import { Otp } from '@/pages/auth/otp'
// Auth Pages
import { SignIn, SignIn2 } from '@/pages/auth/sign-in'
import { SignUp } from '@/pages/auth/sign-up'
// Chats
import { Chats } from '@/pages/chats'
// Dashboard
import { Dashboard } from '@/pages/dashboard'
// Error Pages
import {
  GeneralError,
  NotFoundError,
  UnauthorisedError,
  ForbiddenError,
  MaintenanceError,
} from '@/pages/errors'
// Help Center
import { HelpCenter } from '@/pages/help-center'
// Settings
import { Settings } from '@/pages/settings'
// Tasks
import { Tasks } from '@/pages/tasks'
// Users
import { Users } from '@/pages/users'
import { Routes, Route } from 'react-router-dom'
import { AccountForm } from '@/features/settings/ui/account-form'
import { AppearanceForm } from '@/features/settings/ui/appearance-form'
import { DisplayForm } from '@/features/settings/ui/display-form'
import { NotificationsForm } from '@/features/settings/ui/notifications-form'
import { ProfileForm } from '@/features/settings/ui/profile-form'

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path='/sign-in' element={<SignIn />} />
      <Route path='/sign-in-2' element={<SignIn2 />} />
      <Route path='/sign-up' element={<SignUp />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/otp' element={<Otp />} />

      {/* Protected Routes */}
      <Route path='/' element={<AuthenticatedLayout />}>
        <Route index element={<Dashboard />} />
        <Route path='apps' element={<Apps />} />
        <Route path='chats' element={<Chats />} />
        <Route path='tasks' element={<Tasks />} />
        <Route path='users' element={<Users />} />
        <Route path='help-center' element={<HelpCenter />} />
        <Route path='settings' element={<Settings />}>
          <Route index element={<ProfileForm />} />
          <Route path='account' element={<AccountForm />} />
          <Route path='appearance' element={<AppearanceForm />} />
          <Route path='notifications' element={<NotificationsForm />} />
          <Route path='display' element={<DisplayForm />} />
        </Route>
      </Route>

      {/* Error Routes - 숫자 경로 */}
      <Route path='/401' element={<UnauthorisedError />} />
      <Route path='/403' element={<ForbiddenError />} />
      <Route path='/404' element={<NotFoundError />} />
      <Route path='/500' element={<GeneralError />} />
      <Route path='/503' element={<MaintenanceError />} />

      {/* Error Routes - 사이드바 경로 (리다이렉트) */}
      <Route path='/errors/unauthorized' element={<UnauthorisedError />} />
      <Route path='/errors/forbidden' element={<ForbiddenError />} />
      <Route path='/errors/not-found' element={<NotFoundError />} />
      <Route path='/errors/internal-server-error' element={<GeneralError />} />
      <Route path='/errors/maintenance-error' element={<MaintenanceError />} />

      <Route path='*' element={<NotFoundError />} />
    </Routes>
  )
}
