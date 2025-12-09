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

      // 인터셉터가 이미 SuccessResponse.data를 추출했으므로
      // response.data가 바로 District[] 배열
      const response = await apiClient.get<District[]>(url)

      // TanStack Query는 undefined를 허용하지 않으므로 빈 배열 반환
      return response.data ?? []
    },
  })
}
