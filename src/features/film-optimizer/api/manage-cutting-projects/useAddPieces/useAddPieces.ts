import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { CuttingPiece } from '../../fetch-cutting-projects'
import type { AddPiecesVariables } from '../types'

const addPieces = async ({
  projectId,
  data: requestData,
}: AddPiecesVariables): Promise<ApiResponse<CuttingPiece[]>> => {
  const { data } = await axiosInstance.post<CuttingPiece[]>(
    ADMIN_API.FILM_OPTIMIZER.PIECES.ADD(projectId),
    requestData
  )
  return data
}

export function useAddPieces() {
  const queryClient = useQueryClient()

  return useStandardMutation<CuttingPiece[], Error, AddPiecesVariables>({
    mutationFn: addPieces,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...generateQueryKeysFromUrl(ADMIN_API.FILM_OPTIMIZER.PROJECTS.DETAIL(variables.projectId))],
      })
      toast.success('재단 조각이 추가되었습니다.')
    },
  })
}
