import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { Icon, IconType } from '@/shared/types/api'

interface UseIconsParams {
  type?: IconType
  search?: string
}

/**
 * 아이콘 목록 조회 훅
 * @param params - 필터링 파라미터 (type, search)
 * @returns 아이콘 목록 쿼리 결과
 */
export function useIconsList(params?: UseIconsParams) {
  return useQuery({
    queryKey: ['admin', 'icons', 'list', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()

      if (params?.type) {
        searchParams.append('type', params.type)
      }
      if (params?.search) {
        searchParams.append('search', params.search)
      }

      const url = `${ADMIN_API.ICONS.LIST}${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`

      const response = await apiClient.get<Icon[]>(url)
      return response.data ?? []
    },
    staleTime: 60 * 1000, // 1분 캐싱 (아이콘은 자주 변경되지 않음)
  })
}
