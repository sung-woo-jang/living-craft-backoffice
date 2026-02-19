import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { projectsRepository } from '@/shared/lib/indexeddb'

/**
 * 재단 프로젝트 삭제 (IndexedDB)
 */
export function useDeleteCuttingProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => projectsRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'projects'],
      })
      toast.success('프로젝트가 삭제되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`프로젝트 삭제 실패: ${error.message}`)
    },
  })
}
