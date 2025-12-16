/**
 * QueryKey 팩토리 유틸리티
 *
 * TanStack Query의 queryKey를 일관되게 관리하기 위한 팩토리 함수들
 */

/**
 * URL에서 queryKey 배열 생성
 * @example
 * generateQueryKeysFromUrl('/admin/services')
 * // => ['admin', 'services']
 *
 * generateQueryKeysFromUrl('/admin/services/123')
 * // => ['admin', 'services', '123']
 */
export function generateQueryKeysFromUrl(url: string): string[] {
  return url.split('/').filter((segment) => segment !== '' && segment !== 'api')
}

/**
 * 도메인별 queryKey 팩토리 생성
 *
 * @example
 * const servicesKeys = createQueryKeyFactory('admin', 'services')
 *
 * servicesKeys.all()           // ['admin', 'services']
 * servicesKeys.lists()         // ['admin', 'services', 'list']
 * servicesKeys.list()          // ['admin', 'services', 'list']
 * servicesKeys.list({ page: 1 }) // ['admin', 'services', 'list', { page: 1 }]
 * servicesKeys.details()       // ['admin', 'services', 'detail']
 * servicesKeys.detail(1)       // ['admin', 'services', 'detail', 1]
 */
export function createQueryKeyFactory<T extends string>(...baseKeys: T[]) {
  return {
    /** 도메인 전체 키 (캐시 무효화용) */
    all: () => [...baseKeys] as const,

    /** 목록 쿼리 키 패턴 (캐시 무효화용) */
    lists: () => [...baseKeys, 'list'] as const,

    /** 목록 쿼리 키 (필터 포함 가능) */
    list: ((filters?: Record<string, unknown>) => {
      if (filters !== undefined) {
        return [...baseKeys, 'list', filters] as const
      }
      return [...baseKeys, 'list'] as const
    }) as {
      (): readonly [...T[], 'list']
      <F extends Record<string, unknown>>(
        filters?: F
      ): readonly [...T[], 'list', F] | readonly [...T[], 'list']
    },

    /** 상세 쿼리 키 패턴 (캐시 무효화용) */
    details: () => [...baseKeys, 'detail'] as const,

    /** 상세 쿼리 키 */
    detail: (id: string | number) => [...baseKeys, 'detail', id] as const,
  }
}
