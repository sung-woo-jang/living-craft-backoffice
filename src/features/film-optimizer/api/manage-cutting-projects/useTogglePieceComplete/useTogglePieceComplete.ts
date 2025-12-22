import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { CuttingPiece } from '../../fetch-cutting-projects'
import type { PieceActionVariables } from '../types'

const togglePieceComplete = async ({
  projectId,
  pieceId,
}: PieceActionVariables): Promise<ApiResponse<CuttingPiece>> => {
  const { data } = await axiosInstance.post<CuttingPiece>(
    ADMIN_API.FILM_OPTIMIZER.PIECES.TOGGLE_COMPLETE(projectId, pieceId)
  )
  return data
}

export function useTogglePieceComplete() {
  const queryClient = useQueryClient()

  return useStandardMutation<CuttingPiece, Error, PieceActionVariables>({
    mutationFn: togglePieceComplete,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...generateQueryKeysFromUrl(
            ADMIN_API.FILM_OPTIMIZER.PROJECTS.DETAIL(variables.projectId)
          ),
        ],
      })
    },
  })
}
