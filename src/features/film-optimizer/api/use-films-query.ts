import { useQuery } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import type { FilmDetail, FilmListItem } from '@/shared/types/api'

/**
 * 필름지 목록 조회
 * GET /api/admin/film-optimizer/films
 */
export function useFilmsList() {
  return useQuery({
    queryKey: ['admin', 'film-optimizer', 'films', 'list'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<FilmListItem[]>>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.LIST
      )
      return data
    },
    select: (response) => response.data,
  })
}

/**
 * 필름지 상세 조회
 * GET /api/admin/film-optimizer/films/:id
 */
export function useFilmDetail(id: number | string | undefined) {
  return useQuery({
    queryKey: ['admin', 'film-optimizer', 'films', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('필름지 ID가 필요합니다.')
      const { data } = await axiosInstance.get<ApiResponse<FilmDetail>>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.DETAIL(id)
      )
      return data
    },
    select: (response) => response.data,
    enabled: !!id,
  })
}
