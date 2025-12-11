import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { toast } from 'sonner'

export function useDeletePortfolio() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await axiosInstance.post<void>(
        ADMIN_API.PORTFOLIOS.DELETE(id)
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'portfolios'] })
      toast.success('포트폴리오가 삭제되었습니다.')
    },
  })
}
