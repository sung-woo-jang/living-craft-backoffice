import type { Reservation } from '@/entities/reservation'
import { ADMIN_API, axiosInstance } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'

/**
 * 예약 목록 조회
 */
export function useReservationsList() {
  return useStandardQuery<Reservation[]>({
    queryKey: ['admin', 'reservations', 'list'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Reservation[]>(
        ADMIN_API.RESERVATIONS.LIST
      )
      return data
    },
  })
}

/**
 * 예약 상세 조회
 */
export function useReservationDetail(id: string) {
  return useStandardQuery<Reservation>({
    queryKey: ['admin', 'reservations', 'detail', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Reservation>(
        ADMIN_API.RESERVATIONS.DETAIL(id)
      )
      return data
    },
    enabled: !!id,
  })
}
