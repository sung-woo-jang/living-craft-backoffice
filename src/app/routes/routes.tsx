import { Routes } from 'react-router-dom'
import { AuthRoutes } from './auth-routes'
import { ErrorRoutes } from './error-routes'
import { ProtectedRoutes } from './protected-routes'
import { SettingsRoutes } from './settings-routes'

export function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <AuthRoutes />

      {/* Protected Routes */}
      <ProtectedRoutes>
        <SettingsRoutes />
      </ProtectedRoutes>

      {/* Error Routes */}
      <ErrorRoutes />
    </Routes>
  )
}
