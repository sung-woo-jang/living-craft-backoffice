/**
 * 아이콘 타입
 */
export type IconType = 'FILL' | 'MONO' | 'COLOR'

/**
 * 아이콘 정보
 */
export interface IconItem {
  id: number
  name: string
  type: IconType
}

/**
 * 아이콘 조회 파라미터
 */
export interface FetchIconsParams extends Record<string, unknown> {
  type?: IconType
  search?: string
}

export type FetchIconsResponse = IconItem[]
