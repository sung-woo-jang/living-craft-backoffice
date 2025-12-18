import { ADMIN_API, axiosInstance } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { Holiday, OperatingHours } from '@/shared/types/api'

/**
 * 운영 시간 조회
 */
export function useOperatingHours() {
  return useStandardQuery<OperatingHours>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.SETTINGS.OPERATING_HOURS.GET),
    queryFn: async () => {
      const { data } = await axiosInstance.get<OperatingHours>(
        ADMIN_API.SETTINGS.OPERATING_HOURS.GET
      )
      return data
    },
  })
}

/**
 * 휴무일 목록 조회
 */
export function useHolidays() {
  return useStandardQuery<Holiday[]>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.SETTINGS.HOLIDAYS.LIST),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Holiday[]>(
        ADMIN_API.SETTINGS.HOLIDAYS.LIST
      )
      return data
    },
  })
}
