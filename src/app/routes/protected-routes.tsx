import { type ReactNode } from 'react'
import { Route } from 'react-router-dom'
import { AuthenticatedLayout } from '@/app/layout'
// Apps
import { Apps } from '@/pages/apps'
// Chats
import { Chats } from '@/pages/chats'
// Dashboard
import { Dashboard } from '@/pages/dashboard'
// Help Center
import { HelpCenter } from '@/pages/help-center'
// Tasks
import { Tasks } from '@/pages/tasks'
// Users
import { Users } from '@/pages/users'

interface ProtectedRoutesProps {
  children?: ReactNode
}

export function ProtectedRoutes({ children }: ProtectedRoutesProps) {
  return (
    <Route path='/' element={<AuthenticatedLayout />}>
      <Route index element={<Dashboard />} />
      <Route path='apps' element={<Apps />} />
      <Route path='chats' element={<Chats />} />
      <Route path='tasks' element={<Tasks />} />
      <Route path='users' element={<Users />} />
      <Route path='help-center' element={<HelpCenter />} />
      {children}
    </Route>
  )
}
