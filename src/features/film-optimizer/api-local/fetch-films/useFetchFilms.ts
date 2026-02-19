import { useQuery } from '@tanstack/react-query'

import { filmsRepository } from '@/shared/lib/indexeddb'

/**
 * 필름지 목록 조회 (IndexedDB)
 */
export function useFetchFilms() {
  return useQuery({
    queryKey: ['film-optimizer', 'films'],
    queryFn: () => filmsRepository.findAll(),
    staleTime: 0, // IndexedDB는 항상 최신
  })
}
