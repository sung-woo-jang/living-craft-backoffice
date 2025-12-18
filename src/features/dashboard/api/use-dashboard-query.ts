import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { DashboardStats } from '@/shared/types/api'

/**
 * 대시보드 통계 데이터 조회
 * 5초마다 자동 갱신
 */
export function useDashboardStats() {
  return useStandardQuery<DashboardStats>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.DASHBOARD.STATS),
    queryFn: async () => {
      const { data } = await axiosInstance.get<DashboardStats>(
        ADMIN_API.DASHBOARD.STATS
      )
      return data
    },
    refetchInterval: 5000, // 5초마다 자동 갱신
  })
}
