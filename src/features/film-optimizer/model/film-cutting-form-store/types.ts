import type { CuttingPiece, CuttingProjectDetail } from '@/shared/types/api'

/**
 * 다이얼로그 타입
 */
export type FilmCuttingFormDialogType = 'bulkInput' | 'createFilm' | null

/**
 * 조각 고정 위치 정보
 */
export interface PieceFixedPosition {
  x: number
  y: number
  width: number
  height: number
  rotated: boolean
}

/**
 * 필름 재단 폼 상태
 */
export interface FilmCuttingFormState {
  // 다이얼로그 상태
  open: FilmCuttingFormDialogType
  setOpen: (type: FilmCuttingFormDialogType) => void

  // 프로젝트 설정
  projectName: string
  setProjectName: (name: string) => void

  selectedFilmId: string
  setSelectedFilmId: (id: string) => void

  allowRotation: boolean
  setAllowRotation: (allow: boolean) => void

  // 로컬 조각 상태
  localPieces: CuttingPiece[]
  setLocalPieces: (pieces: CuttingPiece[]) => void
  addPiece: (piece: CuttingPiece) => void
  addPieces: (pieces: CuttingPiece[]) => void
  removePiece: (pieceId: number) => void
  /** 완료 상태 토글 (완료 시 fixedPosition 설정, 해제 시 null) */
  togglePieceComplete: (
    pieceId: number,
    fixedPosition?: PieceFixedPosition | null
  ) => void

  // 편집 모드 정보
  editingProjectId: string | null
  setEditingProjectId: (id: string | null) => void

  // 초기화
  reset: () => void
  initFromProjectDetail: (detail: CuttingProjectDetail) => void
}
