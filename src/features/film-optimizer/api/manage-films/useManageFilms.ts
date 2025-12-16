import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { toast } from 'sonner'
import type { FilmDetail } from '../fetch-films'
import { filmsKeys } from '../query-keys'
import type { CreateFilmRequest, UpdateFilmVariables } from './types'

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
 * 필름지 수정 API
 */
const updateFilm = async ({
  id,
  data: requestData,
}: UpdateFilmVariables): Promise<ApiResponse<FilmDetail>> => {
  const { data } = await axiosInstance.post<FilmDetail>(
    ADMIN_API.FILM_OPTIMIZER.FILMS.UPDATE(id),
    requestData
  )
  return data
}

/**
 * 필름지 삭제 API
 */
const deleteFilm = async (id: number | string): Promise<ApiResponse<void>> => {
  const { data } = await axiosInstance.post<void>(
    ADMIN_API.FILM_OPTIMIZER.FILMS.DELETE(id)
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
      queryClient.invalidateQueries({ queryKey: [...filmsKeys.all()] })
      toast.success('필름지가 생성되었습니다.')
    },
  })
}

/**
 * 필름지 수정
 *
 * POST /api/admin/film-optimizer/films/:id/update
 */
export function useUpdateFilm() {
  const queryClient = useQueryClient()

  return useStandardMutation<FilmDetail, Error, UpdateFilmVariables>({
    mutationFn: updateFilm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...filmsKeys.all()] })
      toast.success('필름지가 수정되었습니다.')
    },
  })
}

/**
 * 필름지 삭제
 *
 * POST /api/admin/film-optimizer/films/:id/delete
 */
export function useDeleteFilm() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, number | string>({
    mutationFn: deleteFilm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...filmsKeys.all()] })
      toast.success('필름지가 삭제되었습니다.')
    },
  })
}
