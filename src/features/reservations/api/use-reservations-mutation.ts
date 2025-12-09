import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { ReservationStatus } from '@/shared/types/api'
import { toast } from 'sonner'

/**
 * 예약 상태 변경
 */
export function useUpdateReservationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string
      status: ReservationStatus
    }) => {
      await apiClient.post(ADMIN_API.RESERVATIONS.STATUS(id), { status })
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

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      await apiClient.post(ADMIN_API.RESERVATIONS.CANCEL(id), { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reservations'] })
      toast.success('예약이 취소되었습니다.')
    },
  })
}
