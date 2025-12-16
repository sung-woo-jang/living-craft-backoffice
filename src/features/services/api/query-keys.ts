import { createQueryKeyFactory } from '@/shared/api'

/**
 * 서비스 관련 queryKey
 */
export const servicesKeys = createQueryKeyFactory('admin', 'services')

/**
 * 아이콘 관련 queryKey
 */
export const iconsKeys = createQueryKeyFactory('admin', 'icons')

/**
 * 행정구역 관련 queryKey
 */
export const districtsKeys = createQueryKeyFactory('admin', 'districts')
