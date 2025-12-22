import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { FetchPortfoliosResponse } from './types'

/**
 * 포트폴리오 목록 조회 API
 */
const fetchPortfolios = async (): Promise<
  ApiResponse<FetchPortfoliosResponse>
> => {
  const { data } = await axiosInstance.get<FetchPortfoliosResponse>(
    ADMIN_API.PORTFOLIOS.LIST
  )
  return data
}

/**
 * 포트폴리오 목록 조회
 *
 * GET /api/admin/portfolios
 */
export function useFetchPortfolios() {
  return useStandardQuery<FetchPortfoliosResponse>({
    queryKey: [...generateQueryKeysFromUrl(ADMIN_API.PORTFOLIOS.LIST)],
    queryFn: fetchPortfolios,
  })
}
