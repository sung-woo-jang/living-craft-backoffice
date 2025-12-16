import { useRef, useMemo, forwardRef, useImperativeHandle } from 'react'
import type { PackingResult, PackedRect } from '@/shared/types/api'
import styles from './styles.module.scss'

/**
 * 조각별 고유 색상 팔레트
 */
const PIECE_COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#84CC16', // lime-500
  '#F97316', // orange-500
  '#6366F1', // indigo-500
]

/**
 * 조각 ID에 따른 색상 반환
 */
function getPieceColor(pieceId: number, index: number): string {
  return PIECE_COLORS[(pieceId + index) % PIECE_COLORS.length]
}

interface CuttingCanvasProps {
  /** 패킹 결과 */
  packingResult: PackingResult | null
  /** 필름 폭 (mm) */
  filmWidth: number
  /** 표시 배율 (기본값: 0.5 = 50%) */
  scale?: number
  /** 조각 클릭 콜백 */
  onPieceClick?: (pieceId: number) => void
  /** 완료된 조각 ID 목록 */
  completedPieceIds?: number[]
  /** 클래스명 */
  className?: string
}

export interface CuttingCanvasRef {
  getSvgElement: () => SVGSVGElement | null
  getContainerElement: () => HTMLDivElement | null
}

/**
 * 재단 배치도 SVG 시각화 컴포넌트
 *
 * - 세로 방향 (필름 폭이 가로, 길이가 세로)
 * - 조각별 색상 구분
 * - 조각 번호 및 라벨 표시
 * - 회전된 조각 표시
 * - 완료된 조각 구분
 */
export const CuttingCanvas = forwardRef<CuttingCanvasRef, CuttingCanvasProps>(
  function CuttingCanvas(
    {
      packingResult,
      filmWidth,
      scale = 0.5,
      onPieceClick,
      completedPieceIds = [],
      className,
    },
    ref
  ) {
    const svgRef = useRef<SVGSVGElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useImperativeHandle(ref, () => ({
      getSvgElement: () => svgRef.current,
      getContainerElement: () => containerRef.current,
    }))

    // SVG 뷰박스 및 크기 계산
    const { viewBoxWidth, viewBoxHeight, displayWidth, displayHeight } =
      useMemo(() => {
        if (!packingResult || packingResult.bins.length === 0) {
          return {
            viewBoxWidth: filmWidth,
            viewBoxHeight: 500,
            displayWidth: filmWidth * scale,
            displayHeight: 500 * scale,
          }
        }

        const totalHeight = packingResult.usedLength
        // 여백 추가
        const paddedHeight = Math.max(totalHeight + 100, 500)

        return {
          viewBoxWidth: filmWidth,
          viewBoxHeight: paddedHeight,
          displayWidth: filmWidth * scale,
          displayHeight: paddedHeight * scale,
        }
      }, [packingResult, filmWidth, scale])

    // 조각 렌더링
    const renderedPieces = useMemo(() => {
      if (!packingResult) return null

      let yOffset = 0
      const pieces: React.ReactElement[] = []

      packingResult.bins.forEach((bin, binIndex) => {
        bin.rects.forEach((rect, rectIndex) => {
          const globalIndex = pieces.length
          const isCompleted = completedPieceIds.includes(rect.pieceId)
          const color = getPieceColor(rect.pieceId, globalIndex)

          pieces.push(
            <PieceRect
              key={`${binIndex}-${rectIndex}`}
              rect={rect}
              yOffset={yOffset}
              index={globalIndex + 1}
              color={color}
              isCompleted={isCompleted}
              onClick={() => onPieceClick?.(rect.pieceId)}
            />
          )
        })

        yOffset += bin.usedHeight
      })

      return pieces
    }, [packingResult, completedPieceIds, onPieceClick])

    // 빈 상태
    if (!packingResult || packingResult.bins.length === 0) {
      return (
        <div className={`${styles.container} ${className || ''}`}>
          <div className={styles.emptyState}>
            <p>재단 조각을 추가하면 배치도가 표시됩니다.</p>
          </div>
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className={`${styles.container} ${className || ''}`}
      >
        <svg
          ref={svgRef}
          width={displayWidth}
          height={displayHeight}
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className={styles.canvas}
        >
          {/* 배경 (필름 영역) */}
          <rect
            x={0}
            y={0}
            width={filmWidth}
            height={packingResult.usedLength}
            fill="#f3f4f6"
            stroke="#d1d5db"
            strokeWidth={2}
          />

          {/* 사용 길이 표시선 (조각들 아래에 렌더링) */}
          <line
            x1={0}
            y1={packingResult.usedLength}
            x2={filmWidth}
            y2={packingResult.usedLength}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="10,5"
          />

          {/* 조각들 */}
          {renderedPieces}

          {/* 치수 표시 */}
          <text
            x={filmWidth + 10}
            y={packingResult.usedLength / 2}
            className={styles.dimensionText}
            transform={`rotate(90, ${filmWidth + 10}, ${packingResult.usedLength / 2})`}
          >
            {packingResult.usedLength}mm
          </text>

          <text x={filmWidth / 2} y={-10} className={styles.dimensionText}>
            {filmWidth}mm
          </text>
        </svg>
      </div>
    )
  }
)

/**
 * 개별 조각 렌더링 컴포넌트
 */
interface PieceRectProps {
  rect: PackedRect
  yOffset: number
  index: number
  color: string
  isCompleted: boolean
  onClick?: () => void
}

function PieceRect({
  rect,
  yOffset,
  index,
  color,
  isCompleted,
  onClick,
}: PieceRectProps) {
  const x = rect.x
  const y = rect.y + yOffset
  const { width, height, rotated, label } = rect

  // 라벨 텍스트
  const displayLabel = label || `#${index}`
  // 크기 표시
  const sizeText = rotated
    ? `${rect.originalHeight}×${rect.originalWidth}↻`
    : `${rect.originalWidth}×${rect.originalHeight}`

  // 텍스트가 조각 안에 들어갈 수 있는지 확인
  const canFitText = width > 60 && height > 40
  const canFitSize = width > 80 && height > 50

  return (
    <g
      className={`${styles.piece} ${isCompleted ? styles.pieceCompleted : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* 조각 사각형 */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={isCompleted ? '#9ca3af' : color}
        stroke={isCompleted ? '#6b7280' : '#1f2937'}
        strokeWidth={1}
        opacity={isCompleted ? 0.6 : 0.85}
      />

      {/* 조각 번호/라벨 */}
      {canFitText && (
        <text
          x={x + width / 2}
          y={y + height / 2 - (canFitSize ? 30 : 0)}
          className={styles.pieceLabel}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {displayLabel}
        </text>
      )}

      {/* 크기 표시 */}
      {canFitSize && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 40}
          className={styles.pieceSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {sizeText}
        </text>
      )}

      {/* 완료 체크 표시 */}
      {isCompleted && canFitText && (
        <text
          x={x + width - 15}
          y={y + 15}
          className={styles.checkMark}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ✓
        </text>
      )}
    </g>
  )
}
