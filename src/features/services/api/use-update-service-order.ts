import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface ServiceOrderItem {
  id: string
  sortOrder: number
}

interface UpdateServiceOrderRequest {
  serviceOrders: ServiceOrderItem[]
}

export function useUpdateServiceOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (request: UpdateServiceOrderRequest) => {
      const response = await axios.post(
        '/api/admin/services/update-order',
        request
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('서비스 순서가 변경되었습니다.')
    },
    onError: () => {
      toast.error('순서 변경에 실패했습니다.')
    },
  })
}
