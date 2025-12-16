import { useQuery } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { filmsKeys } from '../query-keys'
import type { FetchFilmsResponse, FilmDetail } from './types'

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
 * 필름지 상세 조회 API
 */
const fetchFilmDetail = async (
  id: number | string
): Promise<ApiResponse<FilmDetail>> => {
  const { data } = await axiosInstance.get<FilmDetail>(
    ADMIN_API.FILM_OPTIMIZER.FILMS.DETAIL(id)
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
    queryKey: [...filmsKeys.list()],
    queryFn: fetchFilms,
  })
}

/**
 * 필름지 상세 조회
 *
 * GET /api/admin/film-optimizer/films/:id
 */
export function useFetchFilmDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: [...filmsKeys.detail(id ?? '')],
    queryFn: () => {
      if (!id) throw new Error('필름지 ID가 필요합니다.')
      return fetchFilmDetail(id)
    },
    enabled: !!id,
  })
}
