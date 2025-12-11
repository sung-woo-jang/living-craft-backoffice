import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { toast } from 'sonner'

interface ServiceOrderItem {
  id: number
  sortOrder: number
}

interface UpdateServiceOrderRequest {
  serviceOrders: ServiceOrderItem[]
}

export function useUpdateServiceOrder() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, UpdateServiceOrderRequest>({
    mutationFn: async (request) => {
      const response = await axiosInstance.post<void>(
        ADMIN_API.SERVICES.ORDER,
        request
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스 순서가 변경되었습니다.')
    },
    onError: () => {
      toast.error('순서 변경에 실패했습니다.')
    },
  })
}
