import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { filmsRepository, type FilmRecord } from '@/shared/lib/indexeddb'

/**
 * 필름지 생성 (IndexedDB)
 */
export function useCreateFilm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (
      data: Omit<FilmRecord, 'id' | 'createdAt' | 'updatedAt'>
    ) => filmsRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'films'],
      })
      toast.success('필름지가 생성되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`필름지 생성 실패: ${error.message}`)
    },
  })
}
