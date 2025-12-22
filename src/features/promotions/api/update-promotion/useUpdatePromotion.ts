import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { PromotionAdmin, UpdatePromotionRequest } from '@/shared/types/api'
import { toast } from 'sonner'

export interface UpdatePromotionVariables {
  id: number | string
  data: UpdatePromotionRequest
  icon?: File
}

/**
 * 프로모션 수정 API
 */
const updatePromotion = async (
  request: UpdatePromotionVariables
): Promise<ApiResponse<PromotionAdmin>> => {
  const formData = new FormData()

  if (request.data.title !== undefined)
    formData.append('title', request.data.title)
  if (request.data.subtitle !== undefined)
    formData.append('subtitle', request.data.subtitle)
  if (request.data.linkUrl !== undefined)
    formData.append('linkUrl', request.data.linkUrl)
  if (request.data.linkType !== undefined)
    formData.append('linkType', request.data.linkType)
  if (request.data.startDate !== undefined)
    formData.append('startDate', request.data.startDate)
  if (request.data.endDate !== undefined)
    formData.append('endDate', request.data.endDate)
  if (request.data.isActive !== undefined)
    formData.append('isActive', String(request.data.isActive))
  if (request.data.sortOrder !== undefined)
    formData.append('sortOrder', String(request.data.sortOrder))
  if (request.icon) formData.append('icon', request.icon)

  const { data } = await axiosInstance.post<PromotionAdmin>(
    ADMIN_API.PROMOTIONS.UPDATE(request.id),
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

/**
 * 프로모션 수정
 *
 * POST /api/admin/promotions/:id/update (multipart/form-data)
 */
export function useUpdatePromotion() {
  const queryClient = useQueryClient()

  return useStandardMutation<PromotionAdmin, Error, UpdatePromotionVariables>({
    mutationFn: updatePromotion,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...generateQueryKeysFromUrl(ADMIN_API.PROMOTIONS.LIST)],
      })
      toast.success('프로모션이 수정되었습니다.')
    },
  })
}
