import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { PortfolioAdmin } from '@/shared/types/api'

interface PortfolioListResponse {
  items: PortfolioAdmin[]
  total: number
}

export function usePortfoliosList() {
  return useStandardQuery<PortfolioListResponse, Error, PortfolioAdmin[]>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.PORTFOLIOS.LIST),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PortfolioListResponse>(
        ADMIN_API.PORTFOLIOS.LIST
      )
      return data
    },
    select: (data) => data.data.items,
  })
}
