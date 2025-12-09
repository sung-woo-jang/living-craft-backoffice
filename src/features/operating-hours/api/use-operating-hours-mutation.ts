import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { OperatingHours } from '@/shared/types/api'
import { toast } from 'sonner'

/**
 * 운영 시간 수정
 */
export function useUpdateOperatingHours() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: OperatingHours) => {
      await apiClient.post(ADMIN_API.SETTINGS.OPERATING_HOURS.UPDATE, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'settings', 'operating-hours'],
      })
      toast.success('운영 시간이 저장되었습니다.')
    },
  })
}

/**
 * 휴무일 추가
 */
export function useAddHoliday() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { date: string; reason: string }) => {
      await apiClient.post(ADMIN_API.SETTINGS.HOLIDAYS.CREATE, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'settings', 'holidays'],
      })
      toast.success('휴무일이 추가되었습니다.')
    },
  })
}

/**
 * 휴무일 삭제
 */
export function useDeleteHoliday() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (date: string) => {
      await apiClient.post(ADMIN_API.SETTINGS.HOLIDAYS.DELETE(date))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'settings', 'holidays'],
      })
      toast.success('휴무일이 삭제되었습니다.')
    },
  })
}
