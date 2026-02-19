import { useQuery } from '@tanstack/react-query'

import { projectsRepository } from '@/shared/lib/indexeddb'

/**
 * 재단 프로젝트 목록 조회 (IndexedDB)
 */
export function useFetchCuttingProjects(filmId?: number) {
  return useQuery({
    queryKey: filmId
      ? ['film-optimizer', 'projects', { filmId }]
      : ['film-optimizer', 'projects'],
    queryFn: () => projectsRepository.findAll(filmId),
    staleTime: 0,
  })
}
