import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import type { FilmDetail, FilmListItem } from '@/shared/types/api'

/**
 * 필름지 목록 조회
 * GET /api/admin/film-optimizer/films
 */
export function useFilmsList() {
  return useStandardQuery<FilmListItem[]>({
    queryKey: ['admin', 'film-optimizer', 'films', 'list'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<FilmListItem[]>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.LIST
      )
      return data as ApiResponse<FilmListItem[]>
    },
  })
}

/**
 * 필름지 상세 조회
 * GET /api/admin/film-optimizer/films/:id
 */
export function useFilmDetail(id: number | string | undefined) {
  return useStandardQuery<FilmDetail>({
    queryKey: ['admin', 'film-optimizer', 'films', 'detail', id],
    queryFn: async () => {
      if (!id) throw new Error('필름지 ID가 필요합니다.')
      const { data } = await axiosInstance.get<FilmDetail>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.DETAIL(id)
      )
      return data as ApiResponse<FilmDetail>
    },
    enabled: !!id,
  })
}
