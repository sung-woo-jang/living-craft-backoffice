import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type {
  ServiceAdminDetail,
  ServiceAdminListItem,
} from '@/shared/types/api'

/**
 * 서비스 목록 조회 (관리자용 - 간소화된 응답)
 * 테이블 표시에 필요한 최소 정보만 반환
 */
export function useServicesList() {
  return useStandardQuery<
    ServiceAdminListItem[],
    Error,
    ServiceAdminListItem[]
  >({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.SERVICES.LIST),
    queryFn: async () => {
      const { data } = await axiosInstance.get<ServiceAdminListItem[]>(
        ADMIN_API.SERVICES.LIST
      )
      return data
    },
    select: (apiResponse) => apiResponse.data,
  })
}

/**
 * 서비스 상세 조회 (관리자용 - 수정 페이지용)
 * regions, schedule, icon 등 전체 정보 반환
 */
export function useServiceDetail(id: number | string | undefined) {
  return useStandardQuery<ServiceAdminDetail, Error, ServiceAdminDetail>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.SERVICES.DETAIL(id || '')),
    queryFn: async () => {
      if (!id) throw new Error('서비스 ID가 필요합니다.')
      const { data } = await axiosInstance.get<ServiceAdminDetail>(
        ADMIN_API.SERVICES.DETAIL(id)
      )
      return data
    },
    enabled: !!id,
    select: (apiResponse) => apiResponse.data,
  })
}
