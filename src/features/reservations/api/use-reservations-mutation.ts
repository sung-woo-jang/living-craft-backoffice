import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { ReservationStatus } from '@/shared/types/api'

/**
 * 예약 상태 변경
 */
export function useUpdateReservationStatus() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    void,
    Error,
    { id: string; status: ReservationStatus }
  >({
    mutationFn: async ({ id, status }) => {
      const { data } = await axiosInstance.post<void>(
        ADMIN_API.RESERVATIONS.STATUS(id),
        { status }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(ADMIN_API.RESERVATIONS.LIST),
      })
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
      const { data } = await axiosInstance.post<void>(
        ADMIN_API.RESERVATIONS.CANCEL(id),
        { reason }
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(ADMIN_API.RESERVATIONS.LIST),
      })
      toast.success('예약이 취소되었습니다.')
    },
  })
}
