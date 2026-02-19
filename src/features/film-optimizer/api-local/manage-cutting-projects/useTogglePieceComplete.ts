import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { piecesRepository } from '@/shared/lib/indexeddb'

/**
 * 조각 완료 상태 토글 (IndexedDB)
 */
export function useTogglePieceComplete() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      pieceId,
      fixedPosition,
    }: {
      projectId: number
      pieceId: number
      fixedPosition?: {
        x: number
        y: number
        width: number
        height: number
        rotated: boolean
      } | null
    }) => piecesRepository.toggleComplete(projectId, pieceId, fixedPosition),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'projects', variables.projectId],
      })
      toast.success('완료 상태가 변경되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`상태 변경 실패: ${error.message}`)
    },
  })
}
