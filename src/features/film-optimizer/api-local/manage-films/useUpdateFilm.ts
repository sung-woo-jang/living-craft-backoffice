import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { filmsRepository, type FilmRecord } from '@/shared/lib/indexeddb'

/**
 * 필름지 수정 (IndexedDB)
 */
export function useUpdateFilm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<Omit<FilmRecord, 'id' | 'createdAt' | 'updatedAt'>>
    }) => filmsRepository.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'films'],
      })
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'films', variables.id],
      })
      toast.success('필름지가 수정되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`필름지 수정 실패: ${error.message}`)
    },
  })
}
