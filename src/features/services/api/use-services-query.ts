import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { Service } from '@/shared/types/api'

export function useServicesList() {
  return useQuery({
    queryKey: ['admin', 'services', 'list'],
    queryFn: async () => {
      const response = await apiClient.get<Service[]>(ADMIN_API.SERVICES.LIST)
      // TanStack Query는 undefined를 허용하지 않으므로 빈 배열 반환
      return response.data ?? []
    },
  })
}
