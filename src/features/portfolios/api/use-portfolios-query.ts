import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { Portfolio } from '@/shared/types/api'

export function usePortfoliosList() {
  return useQuery({
    queryKey: ['admin', 'portfolios', 'list'],
    queryFn: async () => {
      const response = await apiClient.get<Portfolio[]>(
        ADMIN_API.PORTFOLIOS.LIST
      )
      return response.data
    },
  })
}
