import { useEffect, useState } from 'react'
import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
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
  return useStandardQuery<Icon[]>({
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

      const { data } = await axiosInstance.get<Icon[]>(url)
      return data
    },
    staleTime: 60 * 1000, // 1분 캐싱 (아이콘은 자주 변경되지 않음)
  })
}

/**
 * 디바운스가 적용된 아이콘 검색 훅
 * @param search - 검색어
 * @param delay - 디바운스 지연 시간 (기본 300ms)
 * @returns 아이콘 목록 쿼리 결과
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

  return useStandardQuery<Icon[]>({
    queryKey: ['admin', 'icons', 'search', debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch || debouncedSearch.length < 2) {
        // 빈 ApiResponse 반환
        return { success: true, message: '', data: [], timestamp: '' }
      }

      const searchParams = new URLSearchParams()
      searchParams.append('search', debouncedSearch)

      const url = `${ADMIN_API.ICONS.LIST}?${searchParams.toString()}`
      const { data } = await axiosInstance.get<Icon[]>(url)
      return data
    },
    staleTime: 30 * 1000, // 30초 캐싱
    enabled: debouncedSearch.length >= 2, // 2글자 이상일 때만 활성화
  })
}
