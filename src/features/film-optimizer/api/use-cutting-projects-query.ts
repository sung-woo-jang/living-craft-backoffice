import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type {
  CuttingProjectDetail,
  CuttingProjectListItem,
} from '@/shared/types/api'

/**
 * 재단 프로젝트 목록 조회
 * GET /api/admin/film-optimizer/projects
 */
export function useCuttingProjectsList(filmId?: number | string) {
  return useStandardQuery<CuttingProjectListItem[]>({
    queryKey: ['admin', 'film-optimizer', 'projects', 'list', filmId],
    queryFn: async () => {
      const params = filmId ? { filmId } : undefined
      const { data } = await axiosInstance.get<CuttingProjectListItem[]>(
        ADMIN_API.FILM_OPTIMIZER.PROJECTS.LIST,
        { params }
      )
      return data as ApiResponse<CuttingProjectListItem[]>
    },
  })
}

/**
 * 재단 프로젝트 상세 조회
 * GET /api/admin/film-optimizer/projects/:id
 */
export function useCuttingProjectDetail(id: number | string | undefined) {
  return useStandardQuery<CuttingProjectDetail>({
    queryKey: ['admin', 'film-optimizer', 'projects', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('프로젝트 ID가 필요합니다.')
      const { data } = await axiosInstance.get<CuttingProjectDetail>(
        ADMIN_API.FILM_OPTIMIZER.PROJECTS.DETAIL(id)
      )
      return data as ApiResponse<CuttingProjectDetail>
    },
    enabled: !!id,
  })
}
