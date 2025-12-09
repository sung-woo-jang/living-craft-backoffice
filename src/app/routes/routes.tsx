import { AuthenticatedLayout } from '@/app/layout'
import { CustomersPage } from '@/pages/customers'
import { Dashboard } from '@/pages/dashboard'
import { PortfoliosPage } from '@/pages/portfolios'
import { ReservationsPage } from '@/pages/reservations'
import { ReviewsPage } from '@/pages/reviews'
import { ServicesPage } from '@/pages/services'
import { OperatingHoursPage } from '@/pages/settings/operating-hours'
import { ProtectedRoute } from '@/shared/components/protected-route'
import { createBrowserRouter } from 'react-router-dom'
import { authRoutes } from './auth-routes'
import { errorRoutes } from './error-routes'
import { templateRoutes } from './template-routes'

export const router = createBrowserRouter([
  {
    children: [
      // Auth Routes (인증 관련)
      ...authRoutes,
      // Template Routes (참고용)
      ...templateRoutes,
      // Error Routes
      ...errorRoutes,
      
      // Protected Routes (인증 필요)
      {
        path: '/',
        element: (
          <ProtectedRoute>
            <AuthenticatedLayout />
          </ProtectedRoute>
        ),
        children: [
          // Living Craft Routes
          {
            index: true,
            element: <Dashboard />,
          },
          {
            path: 'reservations',
            element: <ReservationsPage />,
          },
          {
            path: 'services',
            element: <ServicesPage />,
          },
          {
            path: 'portfolios',
            element: <PortfoliosPage />,
          },
          {
            path: 'reviews',
            element: <ReviewsPage />,
          },
          {
            path: 'customers',
            element: <CustomersPage />,
          },
          {
            path: 'settings/operating',
            element: <OperatingHoursPage />,
          },
        ],
      },
    ],
  },
])
