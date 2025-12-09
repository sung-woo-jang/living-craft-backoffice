import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { DashboardStats } from '@/shared/types/api'

/**
 * 대시보드 통계 데이터 조회
 * 5초마다 자동 갱신
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardStats>(
        ADMIN_API.DASHBOARD.STATS
      )
      return response.data
    },
    refetchInterval: 5000, // 5초마다 자동 갱신
  })
}
