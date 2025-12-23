import type { IconType, IconAdminListItem } from '@/shared/types/api'

export interface FetchIconsListParams {
  search?: string
  type?: IconType
}

export type FetchIconsListResponse = IconAdminListItem[]
