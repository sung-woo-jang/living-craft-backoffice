import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { cuttingProjectsKeys } from '../query-keys'
import type {
  FetchCuttingProjectsResponse,
  CuttingProjectDetail,
} from './types'

/**
 * 재단 프로젝트 목록 조회 API
 */
const fetchCuttingProjects = async (
  filmId?: number | string
): Promise<ApiResponse<FetchCuttingProjectsResponse>> => {
  const params = filmId ? { filmId } : undefined
  const { data } = await axiosInstance.get<FetchCuttingProjectsResponse>(
    ADMIN_API.FILM_OPTIMIZER.PROJECTS.LIST,
    { params }
  )
  return data
}

/**
 * 재단 프로젝트 상세 조회 API
 */
const fetchCuttingProjectDetail = async (
  id: number | string
): Promise<ApiResponse<CuttingProjectDetail>> => {
  const { data } = await axiosInstance.get<CuttingProjectDetail>(
    ADMIN_API.FILM_OPTIMIZER.PROJECTS.DETAIL(id)
  )
  return data
}

/**
 * 재단 프로젝트 목록 조회
 *
 * GET /api/admin/film-optimizer/projects
 */
export function useFetchCuttingProjects(filmId?: number | string) {
  return useStandardQuery<FetchCuttingProjectsResponse>({
    queryKey: [...cuttingProjectsKeys.list(), filmId],
    queryFn: () => fetchCuttingProjects(filmId),
  })
}

/**
 * 재단 프로젝트 상세 조회
 *
 * GET /api/admin/film-optimizer/projects/:id
 */
export function useFetchCuttingProjectDetail(id: number | string | undefined) {
  return useStandardQuery<CuttingProjectDetail>({
    queryKey: [...cuttingProjectsKeys.detail(id ?? '')],
    queryFn: () => {
      if (!id) throw new Error('프로젝트 ID가 필요합니다.')
      return fetchCuttingProjectDetail(id)
    },
    enabled: !!id,
  })
}
