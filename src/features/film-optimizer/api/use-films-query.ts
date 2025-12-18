import { useQuery } from '@tanstack/react-query'

import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { FilmDetail, FilmListItem } from '@/shared/types/api'

/**
 * 필름지 목록 조회
 * GET /api/admin/film-optimizer/films
 */
export function useFilmsList() {
  return useQuery<FilmListItem[], Error>({
    queryKey: generateQueryKeysFromUrl(ADMIN_API.FILM_OPTIMIZER.FILMS.LIST),
    queryFn: async () => {
      const { data } = await axiosInstance.get<ApiResponse<FilmListItem[]>>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.LIST
      )
      return (data as unknown as ApiResponse<FilmListItem[]>).data
    },
  })
}

/**
 * 필름지 상세 조회
 * GET /api/admin/film-optimizer/films/:id
 */
export function useFilmDetail(id: number | string | undefined) {
  return useQuery<FilmDetail, Error>({
    queryKey: generateQueryKeysFromUrl(
      ADMIN_API.FILM_OPTIMIZER.FILMS.DETAIL(id || '')
    ),
    queryFn: async () => {
      if (!id) throw new Error('필름지 ID가 필요합니다.')
      const { data } = await axiosInstance.get<ApiResponse<FilmDetail>>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.DETAIL(id)
      )
      return (data as unknown as ApiResponse<FilmDetail>).data
    },
    enabled: !!id,
  })
}
