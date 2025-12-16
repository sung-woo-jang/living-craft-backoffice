/**
 * 포트폴리오 카테고리
 */
export type PortfolioCategory =
  | '인테리어 필름'
  | '유리 청소'
  | '외부 유리'
  | '내부 유리'
  | '기타'

/**
 * 포트폴리오 정보
 */
export interface Portfolio {
  id: string
  category: PortfolioCategory
  projectName: string
  clientName: string
  duration: string
  shortDescription: string
  detailedDescription: string
  images: string[]
  tags: string[]
  relatedServiceIds: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type FetchPortfoliosResponse = Portfolio[]
