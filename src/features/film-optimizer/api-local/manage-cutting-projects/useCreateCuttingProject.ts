import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { projectsRepository } from '@/shared/lib/indexeddb'

/**
 * 재단 프로젝트 생성 (IndexedDB)
 */
export function useCreateCuttingProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      name: string
      filmId: number
      allowRotation: boolean
      pieces?: Array<{
        width: number
        height: number
        quantity: number
        label: string | null
        allowRotation: boolean
      }>
    }) => projectsRepository.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['film-optimizer', 'projects'],
      })
      toast.success('재단 프로젝트가 생성되었습니다.')
    },
    onError: (error: Error) => {
      toast.error(`프로젝트 생성 실패: ${error.message}`)
    },
  })
}
