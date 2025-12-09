import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { OperatingHours, Holiday } from '@/shared/types/api'

/**
 * 운영 시간 조회
 */
export function useOperatingHours() {
  return useQuery({
    queryKey: ['admin', 'settings', 'operating-hours'],
    queryFn: async () => {
      const response = await apiClient.get<OperatingHours>(
        ADMIN_API.SETTINGS.OPERATING_HOURS.GET
      )
      return response.data
    },
  })
}

/**
 * 휴무일 목록 조회
 */
export function useHolidays() {
  return useQuery({
    queryKey: ['admin', 'settings', 'holidays'],
    queryFn: async () => {
      const response = await apiClient.get<Holiday[]>(
        ADMIN_API.SETTINGS.HOLIDAYS.LIST
      )
      return response.data
    },
  })
}
