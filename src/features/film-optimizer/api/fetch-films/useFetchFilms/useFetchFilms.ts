import { useQuery } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import type { FetchFilmsResponse } from '../types'
import { generateQueryKeysFromUrl } from '@/shared/lib'

/**
 * 필름지 목록 조회 API
 */
const fetchFilms = async (): Promise<ApiResponse<FetchFilmsResponse>> => {
  const { data } = await axiosInstance.get<FetchFilmsResponse>(
    ADMIN_API.FILM_OPTIMIZER.FILMS.LIST
  )
  return data
}

/**
 * 필름지 목록 조회
 *
 * GET /api/admin/film-optimizer/films
 */
export function useFetchFilms() {
  return useQuery({
    queryKey: [...generateQueryKeysFromUrl(ADMIN_API.FILM_OPTIMIZER.FILMS.LIST)],
    queryFn: fetchFilms,
  })
}
