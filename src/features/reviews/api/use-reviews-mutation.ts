import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { toast } from 'sonner'

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await axiosInstance.post<void>(
        ADMIN_API.REVIEWS.DELETE(id)
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] })
      toast.success('리뷰가 삭제되었습니다.')
    },
  })
}
