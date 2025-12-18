import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { toast } from 'sonner'
import type { FilmDetail } from '../../fetch-films'
import type { CreateFilmRequest } from '../types'
import { generateQueryKeysFromUrl } from '@/shared/lib'

/**
 * 필름지 생성 API
 */
const createFilm = async (
  request: CreateFilmRequest
): Promise<ApiResponse<FilmDetail>> => {
  const { data } = await axiosInstance.post<FilmDetail>(
    ADMIN_API.FILM_OPTIMIZER.FILMS.CREATE,
    request
  )
  return data
}

/**
 * 필름지 생성
 *
 * POST /api/admin/film-optimizer/films
 */
export function useCreateFilm() {
  const queryClient = useQueryClient()

  return useStandardMutation<FilmDetail, Error, CreateFilmRequest>({
    mutationFn: createFilm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...generateQueryKeysFromUrl(ADMIN_API.FILM_OPTIMIZER.FILMS.LIST)] })
      toast.success('필름지가 생성되었습니다.')
    },
  })
}
