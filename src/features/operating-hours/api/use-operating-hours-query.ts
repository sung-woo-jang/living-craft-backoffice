import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type { Holiday, OperatingHours } from '@/shared/types/api'

/**
 * 운영 시간 조회
 */
export function useOperatingHours() {
  return useStandardQuery<OperatingHours>({
    queryKey: ['admin', 'settings', 'operating-hours'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<OperatingHours>>(
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
  return useStandardQuery<Holiday[]>({
    queryKey: ['admin', 'settings', 'holidays'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Holiday[]>>(
        ADMIN_API.SETTINGS.HOLIDAYS.LIST
      )
      return response.data
    },
  })
}
