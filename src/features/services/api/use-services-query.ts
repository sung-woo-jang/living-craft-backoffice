import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { ServiceAdminDetail, ServiceAdminListItem } from '@/shared/types/api'

/**
 * 서비스 목록 조회 (관리자용 - 간소화된 응답)
 * 테이블 표시에 필요한 최소 정보만 반환
 */
export function useServicesList() {
  return useQuery({
    queryKey: ['admin', 'services', 'list'],
    queryFn: async () => {
      const response =
        await apiClient.get<ServiceAdminListItem[]>(ADMIN_API.SERVICES.LIST)
      return response.data ?? []
    },
  })
}

/**
 * 서비스 상세 조회 (관리자용 - 수정 페이지용)
 * regions, schedule, icon 등 전체 정보 반환
 */
export function useServiceDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: ['admin', 'services', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('서비스 ID가 필요합니다.')
      const response = await apiClient.get<ServiceAdminDetail>(
        ADMIN_API.SERVICES.DETAIL(id)
      )
      return response.data
    },
    enabled: !!id,
  })
}
