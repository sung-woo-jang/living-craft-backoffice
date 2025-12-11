import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import type { ReservationStatus } from '@/shared/types/api'

/**
 * 예약 상태 변경
 */
export function useUpdateReservationStatus() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, { id: string; status: ReservationStatus }>({
    mutationFn: async ({ id, status }) => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        ADMIN_API.RESERVATIONS.STATUS(id),
        { status }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] })
      toast.success('예약 상태가 변경되었습니다.')
    },
  })
}

/**
 * 예약 취소
 */
export function useCancelReservation() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, { id: string; reason?: string }>({
    mutationFn: async ({ id, reason }) => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        ADMIN_API.RESERVATIONS.CANCEL(id),
        { reason }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] })
      toast.success('예약이 취소되었습니다.')
    },
  })
}
