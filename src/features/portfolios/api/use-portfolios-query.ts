import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { Portfolio } from '@/shared/types/api'

export function usePortfoliosList() {
  return useStandardQuery<Portfolio[]>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.PORTFOLIOS.LIST),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Portfolio[]>(
        ADMIN_API.PORTFOLIOS.LIST
      )
      return data
    },
  })
}
