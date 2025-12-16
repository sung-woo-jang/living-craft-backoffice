import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { customersKeys } from '../query-keys'
import type { FetchCustomersResponse } from './types'

/**
 * 고객 목록 조회 API
 */
const fetchCustomers = async (): Promise<
  ApiResponse<FetchCustomersResponse>
> => {
  const { data } = await axiosInstance.get<FetchCustomersResponse>(
    ADMIN_API.CUSTOMERS.LIST
  )
  return data
}

/**
 * 고객 목록 조회
 *
 * GET /api/admin/customers
 */
export function useFetchCustomers() {
  return useStandardQuery<FetchCustomersResponse>({
    queryKey: [...customersKeys.list()],
    queryFn: fetchCustomers,
  })
}
