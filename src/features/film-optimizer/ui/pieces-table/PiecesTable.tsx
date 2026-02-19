import type { CuttingPiece } from '@/shared/types/api'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Trash2 } from 'lucide-react'
import styles from './styles.module.scss'

interface PiecesTableProps {
  /** 재단 조각 목록 */
  pieces: CuttingPiece[]
  /** 조각 삭제 콜백 */
  onDelete?: (pieceId: number) => void
  /** 완료 상태 토글 콜백 */
  onToggleComplete?: (pieceId: number) => void
  /** 조각별 회전 허용 토글 콜백 */
  onTogglePieceRotation?: (pieceId: number) => void
  /** 전체 회전 일괄 설정 콜백 */
  onSetAllRotation?: (allowRotation: boolean) => void
  /** 삭제 중인 조각 ID */
  deletingId?: number | null
  /** 토글 중인 조각 ID */
  togglingId?: number | null
  /** 비활성화 상태 */
  disabled?: boolean
  /** 필름 폭 (회전 제약 계산용) */
  filmWidth?: number
}

type RotationConstraint = 'required' | 'impossible' | 'optional'

/**
 * 회전 제약 조건 판별
 */
function getRotationConstraint(
  piece: CuttingPiece,
  filmWidth: number
): RotationConstraint {
  if (piece.width > filmWidth && piece.height <= filmWidth) return 'required'
  if (piece.width <= filmWidth && piece.height > filmWidth) return 'impossible'
  return 'optional'
}

/**
 * 재단 조각 목록 테이블 컴포넌트
 *
 * - 조각 번호, 크기, 수량, 라벨 표시
 * - 완료 상태 체크박스
 * - 삭제 버튼
 */
export function PiecesTable({
  pieces,
  onDelete,
  onToggleComplete,
  onTogglePieceRotation,
  onSetAllRotation,
  deletingId,
  togglingId,
  disabled = false,
  filmWidth = 1220,
}: PiecesTableProps) {
  if (pieces.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>추가된 조각이 없습니다.</p>
      </div>
    )
  }

  // 총 면적 계산
  const totalArea = pieces.reduce(
    (sum, piece) => sum + piece.width * piece.height * piece.quantity,
    0
  )
  const totalCount = pieces.reduce((sum, piece) => sum + piece.quantity, 0)
  const completedCount = pieces
    .filter((p) => p.isCompleted)
    .reduce((sum, piece) => sum + piece.quantity, 0)

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <span>
          총 <strong>{totalCount}</strong>개 (완료: {completedCount}개)
        </span>
        <span>
          총 면적: <strong>{(totalArea / 1000000).toFixed(2)}m²</strong>
        </span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thCenter}>#</th>
              <th>크기 (mm)</th>
              <th className={styles.thCenter}>수량</th>
              <th>라벨</th>
              <th className={styles.thCenter}>
                <div className={styles.rotationHeader}>
                  <span>회전</span>
                  {onSetAllRotation && (
                    <div className={styles.rotationHeaderActions}>
                      <button
                        className={styles.rotationHeaderButton}
                        onClick={() => onSetAllRotation(true)}
                        disabled={disabled}
                        type='button'
                      >
                        전체 허용
                      </button>
                      <span className={styles.rotationHeaderDivider}>|</span>
                      <button
                        className={styles.rotationHeaderButton}
                        onClick={() => onSetAllRotation(false)}
                        disabled={disabled}
                        type='button'
                      >
                        전체 해제
                      </button>
                    </div>
                  )}
                </div>
              </th>
              <th className={styles.thCenter}>완료</th>
              <th className={styles.thCenter}>삭제</th>
            </tr>
          </thead>
          <tbody>
            {pieces.map((piece, index) => (
              <tr
                key={piece.id}
                className={piece.isCompleted ? styles.rowCompleted : ''}
              >
                <td className={styles.tdCenter}>{index + 1}</td>
                <td>
                  {piece.width} × {piece.height}
                </td>
                <td className={styles.tdCenter}>{piece.quantity}</td>
                <td className={styles.labelCell}>
                  {piece.label || <span className={styles.emptyLabel}>-</span>}
                </td>
                <td className={styles.tdCenter}>
                  {(() => {
                    const constraint = getRotationConstraint(piece, filmWidth)
                    const isConstrained = constraint !== 'optional'
                    return (
                      <Checkbox
                        checked={piece.allowRotation}
                        onCheckedChange={() =>
                          !isConstrained && onTogglePieceRotation?.(piece.id)
                        }
                        disabled={disabled || isConstrained}
                        aria-label={
                          constraint === 'required'
                            ? `${piece.label || `조각 ${index + 1}`} 회전 필수`
                            : constraint === 'impossible'
                              ? `${piece.label || `조각 ${index + 1}`} 회전 불가`
                              : `${piece.label || `조각 ${index + 1}`} 회전 허용`
                        }
                        title={
                          constraint === 'required'
                            ? '필름 폭 초과로 회전 필수'
                            : constraint === 'impossible'
                              ? '회전 시 필름 폭 초과로 회전 불가'
                              : undefined
                        }
                      />
                    )
                  })()}
                </td>
                <td className={styles.tdCenter}>
                  <Checkbox
                    checked={piece.isCompleted}
                    onCheckedChange={() => onToggleComplete?.(piece.id)}
                    disabled={disabled || togglingId === piece.id}
                    aria-label={`${piece.label || `조각 ${index + 1}`} 완료 표시`}
                  />
                </td>
                <td className={styles.tdCenter}>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onDelete?.(piece.id)}
                    disabled={disabled || deletingId === piece.id}
                    className={styles.deleteButton}
                    aria-label={`${piece.label || `조각 ${index + 1}`} 삭제`}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
