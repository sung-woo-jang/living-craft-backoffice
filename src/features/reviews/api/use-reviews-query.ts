import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type { Review } from '@/shared/types/api'

export function useReviewsList() {
  return useStandardQuery<Review[]>({
    queryKey: ['admin', 'reviews', 'list'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Review[]>>(
        ADMIN_API.REVIEWS.LIST
      )
      return response.data
    },
  })
}
