import { ForgotPassword } from '@/pages/auth/forgot-password'
import { Otp } from '@/pages/auth/otp'
import { SignIn, SignIn2 } from '@/pages/auth/sign-in'
import { SignUp } from '@/pages/auth/sign-up'
import { LoginPage } from '@/pages/login/LoginPage'
import { type RouteObject } from 'react-router-dom'

export const authRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/sign-in',
    element: <SignIn />,
  },
  {
    path: '/sign-in-2',
    element: <SignIn2 />,
  },
  {
    path: '/sign-up',
    element: <SignUp />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/otp',
    element: <Otp />,
  },
]
