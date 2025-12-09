import { ForgotPassword } from '@/pages/auth/forgot-password'
import { Otp } from '@/pages/auth/otp'
// Auth Pages
import { SignIn, SignIn2 } from '@/pages/auth/sign-in'
import { SignUp } from '@/pages/auth/sign-up'
import { Route } from 'react-router-dom'

export function AuthRoutes() {
  return (
    <>
      <Route path='/sign-in' element={<SignIn />} />
      <Route path='/sign-in-2' element={<SignIn2 />} />
      <Route path='/sign-up' element={<SignUp />} />
      <Route path='/forgot-password' element={<ForgotPassword />} />
      <Route path='/otp' element={<Otp />} />
    </>
  )
}
