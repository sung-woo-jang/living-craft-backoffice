import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import type {
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/shared/types/api'

export function useCreateService() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, CreateServiceRequest>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        ADMIN_API.SERVICES.CREATE,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스가 생성되었습니다.')
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, { id: string; data: UpdateServiceRequest }>({
    mutationFn: async ({ id, data }) => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        ADMIN_API.SERVICES.UPDATE(id),
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스가 수정되었습니다.')
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        ADMIN_API.SERVICES.DELETE(id)
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스가 삭제되었습니다.')
    },
  })
}

export function useToggleService() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await axiosInstance.post<ApiResponse<void>>(
        ADMIN_API.SERVICES.TOGGLE(id)
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스 상태가 변경되었습니다.')
    },
  })
}
