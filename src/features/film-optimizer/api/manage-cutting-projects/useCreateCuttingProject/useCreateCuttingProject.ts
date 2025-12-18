import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl } from '@/shared/lib'
import type { CuttingProjectDetail } from '../../fetch-cutting-projects'
import type { CreateCuttingProjectRequest } from '../types'

const createCuttingProject = async (
  request: CreateCuttingProjectRequest
): Promise<ApiResponse<CuttingProjectDetail>> => {
  const { data } = await axiosInstance.post<CuttingProjectDetail>(
    ADMIN_API.FILM_OPTIMIZER.PROJECTS.CREATE,
    request
  )
  return data
}

export function useCreateCuttingProject() {
  const queryClient = useQueryClient()

  return useStandardMutation<
    CuttingProjectDetail,
    Error,
    CreateCuttingProjectRequest
  >({
    mutationFn: createCuttingProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...generateQueryKeysFromUrl(ADMIN_API.FILM_OPTIMIZER.PROJECTS.LIST)],
      })
      toast.success('재단 프로젝트가 생성되었습니다.')
    },
  })
}
