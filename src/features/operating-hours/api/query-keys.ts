import { createQueryKeyFactory } from '@/shared/api'

/**
 * 운영 시간 관련 queryKey
 */
export const operatingHoursKeys = createQueryKeyFactory(
  'admin',
  'settings',
  'operating-hours'
)

/**
 * 휴무일 관련 queryKey
 */
export const holidaysKeys = createQueryKeyFactory(
  'admin',
  'settings',
  'holidays'
)
