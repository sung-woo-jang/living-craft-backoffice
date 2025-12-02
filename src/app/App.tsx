import { NavigationProgress } from '@/shared/ui-kit/navigation-progress'
import { Toaster } from '@/shared/ui/sonner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'

export function App() {
  return (
    <BrowserRouter>
      <NavigationProgress />
      <AppRoutes />
      <Toaster duration={5000} />
      {import.meta.env.MODE === 'development' && (
        <ReactQueryDevtools buttonPosition='bottom-left' />
      )}
    </BrowserRouter>
  )
}
