import { createQueryKeyFactory } from '@/shared/api'

/**
 * 필름지 관련 queryKey
 */
export const filmsKeys = createQueryKeyFactory(
  'admin',
  'film-optimizer',
  'films'
)

/**
 * 재단 프로젝트 관련 queryKey
 */
export const cuttingProjectsKeys = createQueryKeyFactory(
  'admin',
  'film-optimizer',
  'projects'
)
