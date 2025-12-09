import { useQuery } from '@tanstack/react-query'
import type { Reservation } from '@/entities/reservation'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'

/**
 * 예약 목록 조회
 */
export function useReservationsList() {
  return useQuery({
    queryKey: ['admin', 'reservations', 'list'],
    queryFn: async () => {
      const response = await apiClient.get<Reservation[]>(
        ADMIN_API.RESERVATIONS.LIST
      )
      return response.data
    },
  })
}

/**
 * 예약 상세 조회
 */
export function useReservationDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'reservations', 'detail', id],
    queryFn: async () => {
      const response = await apiClient.get<Reservation>(
        ADMIN_API.RESERVATIONS.DETAIL(id)
      )
      return response.data
    },
    enabled: !!id,
  })
}
