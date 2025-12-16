/**
 * 패킹된 직사각형 (배치 결과)
 */
export interface PackedRect {
  x: number
  y: number
  width: number
  height: number
  originalWidth: number
  originalHeight: number
  rotated: boolean
  pieceId: number
  label: string | null
}

/**
 * 패킹 빈 (필름 롤 영역)
 */
export interface PackedBin {
  rects: PackedRect[]
  usedArea: number
  usedWidth: number
  usedHeight: number
}

/**
 * 패킹 결과 JSON 구조
 */
export interface PackingResult {
  bins: PackedBin[]
  usedLength: number
  totalUsedArea: number
  totalPieceArea: number
  totalWasteArea: number
  wastePercentage: number
}

/**
 * 재단 조각 응답
 */
export interface CuttingPiece {
  id: number
  width: number
  height: number
  quantity: number
  label: string | null
  sortOrder: number
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

/**
 * 재단 프로젝트 목록 아이템
 * GET /api/admin/film-optimizer/projects 응답
 */
export interface CuttingProjectListItem {
  id: number
  name: string
  filmId: number
  filmName: string
  filmWidth: number
  allowRotation: boolean
  wastePercentage: number | null
  usedLength: number | null
  pieceCount: number
  completedPieceCount: number
  createdAt: string
  updatedAt: string
}

/**
 * 재단 프로젝트 상세의 필름 정보
 */
export interface CuttingProjectFilmInfo {
  id: number
  name: string
  width: number
  length: number
}

/**
 * 재단 프로젝트 상세
 * GET /api/admin/film-optimizer/projects/:id 응답
 */
export interface CuttingProjectDetail {
  id: number
  name: string
  allowRotation: boolean
  wastePercentage: number | null
  usedLength: number | null
  packingResult: PackingResult | null
  film: CuttingProjectFilmInfo
  pieces: CuttingPiece[]
  createdAt: string
  updatedAt: string
}

export type FetchCuttingProjectsResponse = CuttingProjectListItem[]
