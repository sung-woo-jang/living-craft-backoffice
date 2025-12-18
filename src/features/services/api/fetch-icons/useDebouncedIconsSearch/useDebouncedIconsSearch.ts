import { useEffect, useState } from 'react'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type { FetchIconsResponse } from '../types'

/**
 * 디바운스가 적용된 아이콘 검색
 *
 * @param search - 검색어
 * @param delay - 디바운스 지연 시간 (기본 300ms)
 */
export function useDebouncedIconsSearch(search: string, delay = 300) {
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [search, delay])

  return useStandardQuery<FetchIconsResponse>({
    queryKey: ['admin', 'icons', 'search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        // 빈 ApiResponse 반환
        return {
          success: true,
          message: '',
          data: [],
          timestamp: new Date().toISOString(),
        } as ApiResponse<FetchIconsResponse>
      }

      const searchParams = new URLSearchParams()
      searchParams.append('search', debouncedSearch)

      const url = `${ADMIN_API.ICONS.LIST}?${searchParams.toString()}`
      const { data } = await axiosInstance.get<FetchIconsResponse>(url)
      return data
    },
    staleTime: 30 * 1000, // 30초 캐싱
    enabled: debouncedSearch.length >= 2, // 2글자 이상일 때만 활성화
  })
}
