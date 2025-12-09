import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/shared/api/client'
import { ADMIN_API } from '@/shared/api/endpoints'
import type {
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/shared/types/api'
import { toast } from 'sonner'

export function useCreateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateServiceRequest) => {
      await apiClient.post(ADMIN_API.SERVICES.CREATE, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스가 생성되었습니다.')
    },
  })
}

export function useUpdateService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateServiceRequest
    }) => {
      await apiClient.post(ADMIN_API.SERVICES.UPDATE(id), data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스가 수정되었습니다.')
    },
  })
}

export function useDeleteService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(ADMIN_API.SERVICES.DELETE(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스가 삭제되었습니다.')
    },
  })
}

export function useToggleService() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(ADMIN_API.SERVICES.TOGGLE(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] })
      toast.success('서비스 상태가 변경되었습니다.')
    },
  })
}
