import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { filmsRepository } from '@/shared/lib/indexeddb'

/**
 * 필름지 삭제 (IndexedDB)
 */
export function useDeleteFilm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => filmsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'films'],
      })
      toast.success('필름지가 삭제되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`필름지 삭제 실패: ${error.message}`)
    },
  })
}
