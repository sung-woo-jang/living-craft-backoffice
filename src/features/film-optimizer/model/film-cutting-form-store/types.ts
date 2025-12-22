import type { CuttingPiece, CuttingProjectDetail } from '@/shared/types/api'

/**
 * 다이얼로그 타입
 */
export type FilmCuttingFormDialogType = 'bulkInput' | 'createFilm' | null

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
  togglePieceComplete: (pieceId: number) => void

  // 편집 모드 정보
  editingProjectId: string | null
  setEditingProjectId: (id: string | null) => void

  // 초기화
  reset: () => void
  initFromProjectDetail: (detail: CuttingProjectDetail) => void
}
