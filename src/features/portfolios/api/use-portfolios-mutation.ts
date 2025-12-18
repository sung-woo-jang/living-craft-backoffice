import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'

export function useDeletePortfolio() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, string>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.post<void>(
        ADMIN_API.PORTFOLIOS.DELETE(id)
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(ADMIN_API.PORTFOLIOS.LIST),
      })
      toast.success('포트폴리오가 삭제되었습니다.')
    },
  })
}
