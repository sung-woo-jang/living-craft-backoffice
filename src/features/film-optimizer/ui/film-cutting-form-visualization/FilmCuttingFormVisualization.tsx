import { useRef, useMemo } from 'react'
import { useFetchFilms } from '../../api'
import { useFilmCuttingForm, useBinPacker } from '../../model'
import { CuttingCanvas, type CuttingCanvasRef } from '../cutting-canvas'
import { ExportButtons } from '../export-buttons'
import styles from './styles.module.scss'

/**
 * 필름 재단 폼 시각화 섹션
 * - 재단 배치도
 * - 통계
 * - 캔버스
 */
export function FilmCuttingFormVisualization() {
  const canvasRef = useRef<CuttingCanvasRef | null>(null)

  const { projectName, selectedFilmId, allowRotation, localPieces } =
    useFilmCuttingForm([
      'projectName',
      'selectedFilmId',
      'allowRotation',
      'localPieces',
    ])

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

  // 조각 클릭 시 완료 토글
  const { togglePieceComplete } = useFilmCuttingForm(['togglePieceComplete'])
  const handlePieceClick = (pieceId: number) => {
    togglePieceComplete(pieceId)
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
