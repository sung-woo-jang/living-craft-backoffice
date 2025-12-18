import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { Review } from '@/shared/types/api'

export function useReviewsList() {
  return useStandardQuery<Review[]>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.REVIEWS.LIST),
    queryFn: async () => {
      const { data } = await axiosInstance.get<Review[]>(ADMIN_API.REVIEWS.LIST)
      return data
    },
  })
}
