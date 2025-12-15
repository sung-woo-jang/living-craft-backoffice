import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type { Customer, CustomerDetail } from '@/shared/types/api'

export function useCustomersList() {
  return useStandardQuery<Customer[]>({
    queryKey: ['admin', 'customers', 'list'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Customer[]>(
        ADMIN_API.CUSTOMERS.LIST
      )
      return data
    },
  })
}

export function useCustomerDetail(id: string) {
  return useStandardQuery<CustomerDetail>({
    queryKey: ['admin', 'customers', 'detail', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get<CustomerDetail>(
        ADMIN_API.CUSTOMERS.DETAIL(id)
      )
      return data
    },
    enabled: !!id,
  })
}
