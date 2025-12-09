import { apiClient } from '@/shared/api/client'
import { AUTH_API } from '@/shared/api/endpoints'
import { ConfirmDialog } from '@/shared/ui-kit/confirm-dialog'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/features/auth'

interface SignOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SignOutDialog({ open, onOpenChange }: SignOutDialogProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useAuthStore()

  const handleSignOut = async () => {
    try {
      // 백엔드 logout API 호출
      await apiClient.post(AUTH_API.LOGOUT)
    } catch {
      // 에러 발생 시 무시 (토스트 알림 없음)
    } finally {
      // API 성공 여부와 관계없이 클라이언트 토큰 삭제
      auth.reset()
      // Preserve current location for redirect after sign-in
      const currentPath = location.pathname + location.search
      navigate(`/sign-in?redirect=${encodeURIComponent(currentPath)}`, {
        replace: true,
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title='Sign out'
      desc='Are you sure you want to sign out? You will need to sign in again to access your account.'
      confirmText='Sign out'
      destructive
      handleConfirm={handleSignOut}
      className='sm:max-w-sm'
    />
  )
}
