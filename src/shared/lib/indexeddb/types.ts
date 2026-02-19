/**
 * IndexedDB 레코드 타입 정의
 * API 타입과 호환되도록 구성
 */

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
  /** 조각 목록에서의 인덱스 (1부터 시작) */
  listIndex: number
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
 * Films 테이블 레코드
 */
export interface FilmRecord {
  id: number
  name: string
  width: number
  length: number
  description: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Cutting Projects 테이블 레코드
 */
export interface CuttingProjectRecord {
  id: number
  name: string
  filmId: number
  allowRotation: boolean
  wastePercentage: number | null
  usedLength: number | null
  packingResult: PackingResult | null
  createdAt: string
  updatedAt: string
}

/**
 * Cutting Pieces 테이블 레코드
 */
export interface CuttingPieceRecord {
  id: number
  projectId: number
  width: number
  height: number
  quantity: number
  label: string | null
  sortOrder: number
  isCompleted: boolean
  allowRotation: boolean
  fixedPosition: {
    x: number
    y: number
    width: number
    height: number
    rotated: boolean
  } | null
  createdAt: string
  updatedAt: string
}

/**
 * API 호환 타입 (Repository 반환 타입)
 */

export interface FilmListItem extends FilmRecord {
  projectCount: number
}

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

export interface CuttingProjectFilmInfo {
  id: number
  name: string
  width: number
  length: number
}

export interface CuttingProjectDetail {
  id: number
  name: string
  allowRotation: boolean
  wastePercentage: number | null
  usedLength: number | null
  packingResult: PackingResult | null
  film: CuttingProjectFilmInfo
  pieces: CuttingPieceRecord[]
  createdAt: string
  updatedAt: string
}
