import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { Customer } from '@/shared/types/api'

export function useCustomersList() {
  return useQuery({
    queryKey: ['admin', 'customers', 'list'],
    queryFn: async () => {
      const response = await apiClient.get<Customer[]>(ADMIN_API.CUSTOMERS.LIST)
      return response.data
    },
  })
}

export function useCustomerDetail(id: string) {
  return useQuery({
    queryKey: ['admin', 'customers', 'detail', id],
    queryFn: async () => {
      const response = await apiClient.get(ADMIN_API.CUSTOMERS.DETAIL(id))
      return response.data
    },
    enabled: !!id,
  })
}
