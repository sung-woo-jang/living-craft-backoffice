import { useQuery } from '@tanstack/react-query'

import { projectsRepository } from '@/shared/lib/indexeddb'

/**
 * 재단 프로젝트 상세 조회 (IndexedDB)
 */
export function useFetchCuttingProjectDetail(id: number | undefined) {
  return useQuery({
    queryKey: ['film-optimizer', 'projects', id],
    queryFn: async () => {
      if (!id) {
        throw new Error('프로젝트 ID가 필요합니다.')
      }
      const project = await projectsRepository.findById(id)
      if (!project) {
        throw new Error(`프로젝트를 찾을 수 없습니다. (id: ${id})`)
      }
      return project
    },
    staleTime: 0,
    enabled: !!id,
  })
}
