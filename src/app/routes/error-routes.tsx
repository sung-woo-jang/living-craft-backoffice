// Error Pages
import {
  ForbiddenError,
  GeneralError,
  MaintenanceError,
  NotFoundError,
  UnauthorisedError,
} from '@/pages/errors'
import { Route } from 'react-router-dom'

export function ErrorRoutes() {
  return (
    <>
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
    </>
  )
}
