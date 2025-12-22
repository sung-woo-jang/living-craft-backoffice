import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type {
  CreateFilmRequest,
  FilmDetail,
  UpdateFilmRequest,
} from '@/shared/types/api'
import { toast } from 'sonner'

/**
 * 필름지 생성
 * POST /api/admin/film-optimizer/films
 */
export function useCreateFilm() {
  const queryClient = useQueryClient()

  return useStandardMutation<FilmDetail, Error, CreateFilmRequest>({
    mutationFn: async (requestData) => {
      const { data } = await axiosInstance.post<FilmDetail>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.CREATE,
        requestData
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(ADMIN_API.FILM_OPTIMIZER.FILMS.LIST),
      })
      toast.success('필름지가 생성되었습니다.')
    },
  })
}

/**
 * 필름지 수정
 * POST /api/admin/film-optimizer/films/:id/update
 */
export function useUpdateFilm() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    FilmDetail,
    Error,
    { id: number | string; data: UpdateFilmRequest }
  >({
    mutationFn: async ({ id, data: requestData }) => {
      const { data } = await axiosInstance.post<FilmDetail>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.UPDATE(id),
        requestData
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(ADMIN_API.FILM_OPTIMIZER.FILMS.LIST),
      })
      toast.success('필름지가 수정되었습니다.')
    },
  })
}

/**
 * 필름지 삭제
 * POST /api/admin/film-optimizer/films/:id/delete
 */
export function useDeleteFilm() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, number | string>({
    mutationFn: async (id) => {
      const { data } = await axiosInstance.post<void>(
        ADMIN_API.FILM_OPTIMIZER.FILMS.DELETE(id)
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: generateQueryKeysFromUrl(ADMIN_API.FILM_OPTIMIZER.FILMS.LIST),
      })
      toast.success('필름지가 삭제되었습니다.')
    },
  })
}
