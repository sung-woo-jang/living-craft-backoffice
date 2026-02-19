import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { piecesRepository, type CuttingPieceRecord } from '@/shared/lib/indexeddb'

/**
 * 조각 수정 (IndexedDB)
 */
export function useUpdatePiece() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      pieceId,
      data,
    }: {
      projectId: number
      pieceId: number
      data: Partial<
        Pick<
          CuttingPieceRecord,
          'width' | 'height' | 'quantity' | 'label' | 'allowRotation'
        >
      >
    }) => piecesRepository.updatePiece(projectId, pieceId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'projects', variables.projectId],
      })
      toast.success('조각이 수정되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`조각 수정 실패: ${error.message}`)
    },
  })
}
