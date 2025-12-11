import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type { District, DistrictLevel } from '@/shared/types/api'

interface UseDistrictsParams {
  level?: DistrictLevel
  parentId?: number
}

export function useDistricts(params?: UseDistrictsParams) {
  return useStandardQuery<District[]>({
    queryKey: ['admin', 'districts', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()

      if (params?.level) {
        searchParams.append('level', params.level)
      }

      if (params?.parentId !== undefined) {
        searchParams.append('parentId', String(params.parentId))
      }

      const url = `${ADMIN_API.DISTRICTS.LIST}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

      const response = await axiosInstance.get<District[]>(url)
      return response.data
    },
  })
}
