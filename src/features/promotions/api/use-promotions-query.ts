import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { PromotionAdmin } from '@/shared/types/api'

/**
 * 프로모션 목록 조회
 * GET /api/admin/promotions
 */
export function usePromotionsList() {
  return useStandardQuery<PromotionAdmin[], Error, PromotionAdmin[]>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.PROMOTIONS.LIST),
    queryFn: async () => {
      const { data } = await axiosInstance.get<PromotionAdmin[]>(
        ADMIN_API.PROMOTIONS.LIST
      )
      return data
    },
    select: (apiResponse) => apiResponse.data,
  })
}

/**
 * 프로모션 상세 조회
 * GET /api/admin/promotions/:id
 */
export function usePromotionDetail(id: number | string | undefined) {
  return useStandardQuery<PromotionAdmin, Error, PromotionAdmin>({
    queryKey: [
      ...generateQueryKeysFromUrl(ADMIN_API.PROMOTIONS.LIST),
      'detail',
      id,
    ],
    queryFn: async () => {
      if (!id) throw new Error('프로모션 ID가 필요합니다.')
      const { data } = await axiosInstance.get<PromotionAdmin>(
        ADMIN_API.PROMOTIONS.DETAIL(id)
      )
      return data
    },
    enabled: !!id,
    select: (apiResponse) => apiResponse.data,
  })
}
