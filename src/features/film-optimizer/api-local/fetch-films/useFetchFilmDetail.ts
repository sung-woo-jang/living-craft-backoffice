import { useQuery } from '@tanstack/react-query'

import { filmsRepository } from '@/shared/lib/indexeddb'

/**
 * 필름지 상세 조회 (IndexedDB)
 */
export function useFetchFilmDetail(id: number) {
  return useQuery({
    queryKey: ['film-optimizer', 'films', id],
    queryFn: async () => {
      const film = await filmsRepository.findById(id)
      if (!film) {
        throw new Error(`필름지를 찾을 수 없습니다. (id: ${id})`)
      }
      return film
    },
    staleTime: 0,
    enabled: !!id,
  })
}
