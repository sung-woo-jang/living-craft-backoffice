import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { piecesRepository } from '@/shared/lib/indexeddb'

/**
 * 조각 일괄 추가 (IndexedDB)
 */
export function useAddPieces() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      pieces,
    }: {
      projectId: number
      pieces: Array<{
        width: number
        height: number
        quantity: number
        label: string | null
        allowRotation: boolean
      }>
    }) => piecesRepository.addPieces(projectId, pieces),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'projects', variables.projectId],
      })
      toast.success('조각이 추가되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`조각 추가 실패: ${error.message}`)
    },
  })
}
