import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { District, DistrictLevel } from '@/shared/types/api'

interface UseDistrictsParams {
  level?: DistrictLevel
  parentId?: number
}

export function useDistricts(params?: UseDistrictsParams) {
  return useQuery({
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

      const response = await apiClient.get<{
        success: boolean
        data: District[]
        message: string
      }>(url)

      // TanStack Query는 undefined를 허용하지 않으므로 빈 배열 반환
      return response.data.data ?? []
    },
  })
}
