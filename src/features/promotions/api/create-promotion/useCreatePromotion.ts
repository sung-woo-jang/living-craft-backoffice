import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { PromotionAdmin, CreatePromotionRequest } from '@/shared/types/api'

export interface CreatePromotionVariables extends CreatePromotionRequest {
  icon?: File
}

/**
 * 프로모션 생성 API
 */
const createPromotion = async (
  request: CreatePromotionVariables
): Promise<ApiResponse<PromotionAdmin>> => {
  const formData = new FormData()

  formData.append('title', request.title)
  if (request.subtitle) formData.append('subtitle', request.subtitle)
  if (request.linkUrl) formData.append('linkUrl', request.linkUrl)
  if (request.linkType) formData.append('linkType', request.linkType)
  if (request.startDate) formData.append('startDate', request.startDate)
  if (request.endDate) formData.append('endDate', request.endDate)
  if (request.isActive !== undefined)
    formData.append('isActive', String(request.isActive))
  if (request.sortOrder !== undefined)
    formData.append('sortOrder', String(request.sortOrder))
  if (request.icon) formData.append('icon', request.icon)

  const { data } = await axiosInstance.post<PromotionAdmin>(
    ADMIN_API.PROMOTIONS.CREATE,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

/**
 * 프로모션 생성
 *
 * POST /api/admin/promotions (multipart/form-data)
 */
export function useCreatePromotion() {
  const queryClient = useQueryClient()

  return useStandardMutation<PromotionAdmin, Error, CreatePromotionVariables>({
    mutationFn: createPromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...generateQueryKeysFromUrl(ADMIN_API.PROMOTIONS.LIST)],
      })
      toast.success('프로모션이 생성되었습니다.')
    },
  })
}
