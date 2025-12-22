import { List } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import type { CuttingPiece, CuttingPieceInput } from '@/shared/types/api'
import { useFilmsList, useDeletePiece, useTogglePieceComplete } from '../../api'
import { useFilmCuttingForm } from '../../model'
import { PiecesInput } from '../pieces-input'
import { PiecesTable } from '../pieces-table'
import styles from './styles.module.scss'

/**
 * 필름 재단 폼 조각 섹션
 * - 조각 입력
 * - 조각 목록
 */
export function FilmCuttingFormPieces() {
  const {
    editingProjectId,
    selectedFilmId,
    localPieces,
    addPiece,
    removePiece,
    togglePieceComplete,
    setOpen,
  } = useFilmCuttingForm([
    'editingProjectId',
    'selectedFilmId',
    'localPieces',
    'addPiece',
    'removePiece',
    'togglePieceComplete',
    'setOpen',
  ])

  const isEditMode = Boolean(editingProjectId)

  // 필름 정보
  const { data: filmsList } = useFilmsList()
  const selectedFilm = filmsList?.find(
    (f) => f.id.toString() === selectedFilmId
  )

  // 뮤테이션
  const deletePieceMutation = useDeletePiece()
  const toggleCompleteMutation = useTogglePieceComplete()

  // 조각 추가
  const handleAddPiece = (piece: CuttingPieceInput) => {
    const newPiece: CuttingPiece = {
      id: Date.now(),
      width: piece.width,
      height: piece.height,
      quantity: piece.quantity ?? 1,
      label: piece.label ?? null,
      sortOrder: localPieces.length,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    addPiece(newPiece)
  }

  // 조각 삭제
  const handleDeletePiece = async (pieceId: number) => {
    if (isEditMode && editingProjectId) {
      try {
        await deletePieceMutation.mutateAsync({
          projectId: editingProjectId,
          pieceId,
        })
        removePiece(pieceId)
      } catch {
        // 에러는 mutation hook에서 처리
      }
    } else {
      removePiece(pieceId)
    }
  }

  // 완료 토글
  const handleToggleComplete = async (pieceId: number) => {
    if (isEditMode && editingProjectId) {
      try {
        await toggleCompleteMutation.mutateAsync({
          projectId: editingProjectId,
          pieceId,
        })
        togglePieceComplete(pieceId)
      } catch {
        // 에러는 mutation hook에서 처리
      }
    } else {
      togglePieceComplete(pieceId)
    }
  }

  return (
    <>
      {/* 조각 입력 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>조각 추가</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen('bulkInput')}
          >
            <List className="h-4 w-4" />
            일괄 입력
          </Button>
        </div>

        <PiecesInput
          onAdd={handleAddPiece}
          filmWidth={selectedFilm?.width ?? 1220}
          disabled={!selectedFilm}
        />
      </div>

      {/* 조각 목록 */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>조각 목록</h3>
        <PiecesTable
          pieces={localPieces}
          onDelete={handleDeletePiece}
          onToggleComplete={handleToggleComplete}
          deletingId={deletePieceMutation.isPending ? undefined : null}
          togglingId={toggleCompleteMutation.isPending ? undefined : null}
        />
      </div>
    </>
  )
}
