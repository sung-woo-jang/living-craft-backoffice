import { useState } from 'react'
import type { CuttingPiece, CuttingPieceInput } from '@/shared/types/api'
import { Button } from '@/shared/ui/button'
import { List } from 'lucide-react'
import {
  useFetchFilms,
  useDeletePiece,
  useTogglePieceComplete,
} from '../../api'
import { useFilmCuttingForm, useBinPacker } from '../../model'
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
    allowRotation,
    addPiece,
    removePiece,
    togglePieceComplete,
    setOpen,
  } = useFilmCuttingForm([
    'editingProjectId',
    'selectedFilmId',
    'localPieces',
    'allowRotation',
    'addPiece',
    'removePiece',
    'togglePieceComplete',
    'setOpen',
  ])

  const isEditMode = Boolean(editingProjectId)

  // 현재 처리 중인 pieceId 추적
  const [deletingPieceId, setDeletingPieceId] = useState<number | null>(null)
  const [togglingPieceId, setTogglingPieceId] = useState<number | null>(null)

  // 필름 정보
  const { data: filmsResponse } = useFetchFilms()
  const filmsList = filmsResponse?.data
  const selectedFilm = filmsList?.find(
    (f) => f.id.toString() === selectedFilmId
  )

  // 패킹 계산 (완료 시 위치 고정을 위해 필요)
  const { packingResult } = useBinPacker(localPieces, {
    filmWidth: selectedFilm?.width ?? 1220,
    filmMaxLength: selectedFilm?.length ?? 60000,
    allowRotation,
  })

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

  // 로컬에서 생성된 ID인지 확인 (Date.now()로 생성된 ID는 매우 큰 숫자)
  // PostgreSQL integer 최대값: 2,147,483,647
  const isLocalPieceId = (id: number) => id > 2_000_000_000

  // 조각 삭제
  const handleDeletePiece = async (pieceId: number) => {
    setDeletingPieceId(pieceId)

    try {
      // 편집 모드이고 서버에 저장된 조각인 경우에만 API 호출
      if (isEditMode && editingProjectId && !isLocalPieceId(pieceId)) {
        await deletePieceMutation.mutateAsync({
          projectId: editingProjectId,
          pieceId,
        })
      }
      removePiece(pieceId)
    } catch {
      // 에러는 mutation hook에서 처리
    } finally {
      setDeletingPieceId(null)
    }
  }

  // 완료 토글
  const handleToggleComplete = async (pieceId: number) => {
    setTogglingPieceId(pieceId)

    try {
      // 현재 조각 찾기
      const piece = localPieces.find((p) => p.id === pieceId)
      if (!piece) return

      // 완료로 전환 시 fixedPosition 계산
      let fixedPosition: {
        x: number
        y: number
        width: number
        height: number
        rotated: boolean
      } | null = null

      if (!piece.isCompleted && packingResult) {
        // 미완료 -> 완료: 현재 배치 위치를 fixedPosition으로 저장
        for (const bin of packingResult.bins) {
          const rect = bin.rects.find((r) => r.pieceId === pieceId)
          if (rect) {
            fixedPosition = {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
              rotated: rect.rotated,
            }
            break
          }
        }
      }

      // 편집 모드이고 서버에 저장된 조각인 경우에만 API 호출
      if (isEditMode && editingProjectId && !isLocalPieceId(pieceId)) {
        await toggleCompleteMutation.mutateAsync({
          projectId: editingProjectId,
          pieceId,
          data: fixedPosition ? { fixedPosition } : undefined,
        })
      }

      // 로컬 상태 업데이트
      if (piece.isCompleted) {
        // 완료 -> 미완료: fixedPosition 해제
        togglePieceComplete(pieceId, null)
      } else {
        // 미완료 -> 완료: fixedPosition 설정
        togglePieceComplete(pieceId, fixedPosition)
      }
    } catch {
      // 에러는 mutation hook에서 처리
    } finally {
      setTogglingPieceId(null)
    }
  }

  return (
    <>
      {/* 조각 입력 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>조각 추가</h3>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setOpen('bulkInput')}
          >
            <List className='h-4 w-4' />
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
          deletingId={deletingPieceId}
          togglingId={togglingPieceId}
        />
      </div>
    </>
  )
}
