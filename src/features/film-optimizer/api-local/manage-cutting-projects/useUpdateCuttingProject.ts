import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  projectsRepository,
  type CuttingProjectRecord,
} from '@/shared/lib/indexeddb'

/**
 * 재단 프로젝트 수정 (IndexedDB)
 */
export function useUpdateCuttingProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Partial<
        Omit<CuttingProjectRecord, 'id' | 'filmId' | 'createdAt' | 'updatedAt'>
      >
    }) => projectsRepository.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'projects'],
      })
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'projects', variables.id],
      })
      toast.success('프로젝트가 수정되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`프로젝트 수정 실패: ${error.message}`)
    },
  })
}
