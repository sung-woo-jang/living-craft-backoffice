import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type { CustomerDetail } from '../fetch-customers'
import { customersKeys } from '../query-keys'

/**
 * 고객 상세 조회 API
 */
const fetchCustomerDetail = async (
  id: string
): Promise<ApiResponse<CustomerDetail>> => {
  const { data } = await axiosInstance.get<CustomerDetail>(
    ADMIN_API.CUSTOMERS.DETAIL(id)
  )
  return data
}

/**
 * 고객 상세 조회
 *
 * GET /api/admin/customers/:id
 */
export function useFetchCustomerDetail(id: string) {
  return useStandardQuery<CustomerDetail>({
    queryKey: [...customersKeys.detail(id)],
    queryFn: () => fetchCustomerDetail(id),
    enabled: !!id,
  })
}
