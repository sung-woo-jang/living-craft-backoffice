import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type { Review } from '@/shared/types/api'

export function useReviewsList() {
  return useQuery({
    queryKey: ['admin', 'reviews', 'list'],
    queryFn: async () => {
      const response = await apiClient.get<Review[]>(ADMIN_API.REVIEWS.LIST)
      return response.data
    },
  })
}
