import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { piecesRepository } from '@/shared/lib/indexeddb'

/**
 * 조각 삭제 (IndexedDB)
 */
export function useDeletePiece() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      pieceId,
    }: {
      projectId: number
      pieceId: number
    }) => piecesRepository.deletePiece(projectId, pieceId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'projects', variables.projectId],
      })
      toast.success('조각이 삭제되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`조각 삭제 실패: ${error.message}`)
    },
  })
}
