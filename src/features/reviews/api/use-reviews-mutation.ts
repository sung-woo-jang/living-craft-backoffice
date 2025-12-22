import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import { toast } from 'sonner'

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.post<void>(
        ADMIN_API.REVIEWS.DELETE(id)
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(ADMIN_API.REVIEWS.LIST),
      })
      toast.success('리뷰가 삭제되었습니다.')
    },
  })
}
