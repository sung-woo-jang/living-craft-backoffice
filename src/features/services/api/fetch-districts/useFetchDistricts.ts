import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { districtsKeys } from '../query-keys'
import type { FetchDistrictsParams, FetchDistrictsResponse } from './types'

/**
 * 행정구역 목록 조회 API
 */
const fetchDistricts = async (
  params?: FetchDistrictsParams
): Promise<ApiResponse<FetchDistrictsResponse>> => {
  const searchParams = new URLSearchParams()

  if (params?.level) {
    searchParams.append('level', params.level)
  }

  if (params?.parentId !== undefined) {
    searchParams.append('parentId', String(params.parentId))
  }

  const url = `${ADMIN_API.DISTRICTS.LIST}${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`

  const { data } = await axiosInstance.get<FetchDistrictsResponse>(url)
  return data
}

/**
 * 행정구역 목록 조회
 *
 * GET /api/admin/districts
 */
export function useFetchDistricts(params?: FetchDistrictsParams) {
  return useStandardQuery<FetchDistrictsResponse>({
    queryKey: [...districtsKeys.list(params)],
    queryFn: () => fetchDistricts(params),
  })
}
