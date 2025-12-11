import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import type { OperatingHours } from '@/shared/types/api'
import { toast } from 'sonner'

/**
 * 운영 시간 수정
 */
export function useUpdateOperatingHours() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, OperatingHours>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<void>(
        ADMIN_API.SETTINGS.OPERATING_HOURS.UPDATE,
        data
      )
      return response.data
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

  return useStandardMutation<void, Error, { date: string; reason: string }>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<void>(
        ADMIN_API.SETTINGS.HOLIDAYS.CREATE,
        data
      )
      return response.data
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

  return useStandardMutation<void, Error, string>({
    mutationFn: async (date) => {
      const response = await axiosInstance.post<void>(
        ADMIN_API.SETTINGS.HOLIDAYS.DELETE(date)
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'settings', 'holidays'],
      })
      toast.success('휴무일이 삭제되었습니다.')
    },
  })
}
