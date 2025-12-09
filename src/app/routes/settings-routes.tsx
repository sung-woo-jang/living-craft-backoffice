// Settings
import { Settings } from '@/pages/settings'
import { Route } from 'react-router-dom'
import { AccountForm } from '@/features/settings/ui/account-form'
import { AppearanceForm } from '@/features/settings/ui/appearance-form'
import { DisplayForm } from '@/features/settings/ui/display-form'
import { NotificationsForm } from '@/features/settings/ui/notifications-form'
import { ProfileForm } from '@/features/settings/ui/profile-form'

export function SettingsRoutes() {
  return (
    <Route path='settings' element={<Settings />}>
      <Route index element={<ProfileForm />} />
      <Route path='account' element={<AccountForm />} />
      <Route path='appearance' element={<AppearanceForm />} />
      <Route path='notifications' element={<NotificationsForm />} />
      <Route path='display' element={<DisplayForm />} />
    </Route>
  )
}
