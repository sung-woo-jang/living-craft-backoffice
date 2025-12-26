import { useRef, useMemo, useState } from 'react'
import { useFetchFilms, useTogglePieceComplete } from '../../api'
import { useFilmCuttingForm, useBinPacker } from '../../model'
import { CuttingCanvas, type CuttingCanvasRef } from '../cutting-canvas'
import { ExportButtons } from '../export-buttons'
import styles from './styles.module.scss'

// 로컬에서 생성된 ID인지 확인 (Date.now()로 생성된 ID는 매우 큰 숫자)
// PostgreSQL integer 최대값: 2,147,483,647
const isLocalPieceId = (id: number) => id > 2_000_000_000

/**
 * 필름 재단 폼 시각화 섹션
 * - 재단 배치도
 * - 통계
 * - 캔버스
 */
export function FilmCuttingFormVisualization() {
  const canvasRef = useRef<CuttingCanvasRef | null>(null)
  const [togglingPieceId, setTogglingPieceId] = useState<number | null>(null)

  const {
    editingProjectId,
    projectName,
    selectedFilmId,
    allowRotation,
    localPieces,
  } = useFilmCuttingForm([
    'editingProjectId',
    'projectName',
    'selectedFilmId',
    'allowRotation',
    'localPieces',
  ])

  const isEditMode = Boolean(editingProjectId)

  // 필름 정보
  const { data: filmsResponse } = useFetchFilms()
  const filmsList = filmsResponse?.data
  const selectedFilm = filmsList?.find(
    (f) => f.id.toString() === selectedFilmId
  )

  // 패킹 계산
  const { packingResult, wastePercentage, usedLength } = useBinPacker(
    localPieces,
    {
      filmWidth: selectedFilm?.width ?? 1220,
      filmMaxLength: selectedFilm?.length ?? 60000,
      allowRotation,
    }
  )

  // 완료된 조각 ID 목록
  const completedPieceIds = useMemo(
    () => localPieces.filter((p) => p.isCompleted).map((p) => p.id),
    [localPieces]
  )

  // 뮤테이션
  const toggleCompleteMutation = useTogglePieceComplete()

  // 조각 클릭 시 완료 토글
  const { togglePieceComplete } = useFilmCuttingForm(['togglePieceComplete'])

  const handlePieceClick = async (pieceId: number) => {
    // 이미 처리 중이면 무시
    if (togglingPieceId !== null) return

    setTogglingPieceId(pieceId)

    try {
      // 현재 배치 결과에서 해당 조각의 위치 찾기
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
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>재단 배치도</h3>
        <ExportButtons
          canvasRef={canvasRef}
          projectName={projectName || '재단배치'}
          filmName={selectedFilm?.name}
          wastePercentage={wastePercentage}
          usedLength={usedLength}
          disabled={!packingResult}
        />
      </div>

      {/* 통계 */}
      {packingResult && (
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>사용 길이</span>
            <span className={styles.statValue}>{usedLength}mm</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>손실율</span>
            <span
              className={`${styles.statValue} ${wastePercentage > 20 ? styles.statWarning : ''}`}
            >
              {wastePercentage.toFixed(1)}%
            </span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>총 조각 면적</span>
            <span className={styles.statValue}>
              {(packingResult.totalPieceArea / 1000000).toFixed(2)}m²
            </span>
          </div>
        </div>
      )}

      {/* 캔버스 */}
      <CuttingCanvas
        ref={canvasRef}
        packingResult={packingResult}
        filmWidth={selectedFilm?.width ?? 1220}
        scale={0.6}
        completedPieceIds={completedPieceIds}
        onPieceClick={handlePieceClick}
      />
    </div>
  )
}
