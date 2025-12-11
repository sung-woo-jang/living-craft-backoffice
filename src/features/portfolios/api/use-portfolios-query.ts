import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type { Portfolio } from '@/shared/types/api'

export function usePortfoliosList() {
  return useStandardQuery<Portfolio[]>({
    queryKey: ['admin', 'portfolios', 'list'],
    queryFn: async () => {
      const response = await axiosInstance.get<Portfolio[]>(
        ADMIN_API.PORTFOLIOS.LIST
      )
      return response.data
    },
  })
}
