import type {
  CuttingPiece,
  PackedBin,
  PackedRect,
  PackingResult,
} from '@/shared/types/api'

/**
 * 패킹 입력 아이템
 */
export interface PackerInputItem {
  id: number
  width: number
  height: number
  label: string | null
  /** 조각 목록에서의 인덱스 (1부터 시작) */
  listIndex: number
  /** 완료된 조각의 고정 위치 */
  fixedPosition?: {
    x: number
    y: number
    width: number
    height: number
    rotated: boolean
  } | null
}

/**
 * 패킹 옵션
 */
export interface PackerOptions {
  /** 필름 폭 (기본값: 1220mm) */
  filmWidth: number
  /** 필름 최대 길이 (기본값: 60000mm) */
  filmMaxLength: number
  /** 회전 허용 여부 (기본값: true) */
  allowRotation: boolean
  /** 패딩 (조각 간 간격, 기본값: 0) */
  padding?: number
}


/**
 * 재단 조각 목록을 패킹 입력으로 변환
 * quantity를 고려하여 개별 아이템으로 확장
 * listIndex는 원래 pieces 배열의 인덱스 기반
 */
export function piecesToPackerInput(pieces: CuttingPiece[]): PackerInputItem[] {
  const result: PackerInputItem[] = []

  pieces.forEach((piece, pieceIndex) => {
    // quantity 만큼 개별 아이템 생성
    for (let i = 0; i < piece.quantity; i++) {
      result.push({
        id: piece.id,
        width: piece.width,
        height: piece.height,
        label: piece.label,
        listIndex: pieceIndex + 1, // 1부터 시작
        fixedPosition: piece.fixedPosition,
      })
    }
  })

  return result
}

/**
 * 두 영역이 겹치는지 확인
 */
function rectsOverlap(
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number }
): boolean {
  return !(
    r1.x + r1.width <= r2.x ||
    r2.x + r2.width <= r1.x ||
    r1.y + r1.height <= r2.y ||
    r2.y + r2.height <= r1.y
  )
}

/**
 * 빈 공간을 찾아 조각을 배치할 수 있는 위치를 반환
 * y=0부터 시작해서 고정된 조각과 겹치지 않는 첫 번째 위치를 찾음
 */
function findPlacementPosition(
  itemWidth: number,
  itemHeight: number,
  filmWidth: number,
  fixedRects: PackedRect[],
  placedRects: PackedRect[],
  padding: number
): { x: number; y: number } | null {
  // 모든 배치된 조각 (고정 + 새로 배치된)
  const allRects = [...fixedRects, ...placedRects]

  // 배치할 수 없는 조각 (필름 폭보다 큼)
  if (itemWidth > filmWidth) {
    return null
  }

  // 빈 공간이면 (0,0)에 배치
  if (allRects.length === 0) {
    return { x: 0, y: 0 }
  }

  // Y 좌표 후보들 수집: 0, 각 조각의 상단(y+height)
  const yPositions = new Set<number>([0])
  for (const rect of allRects) {
    yPositions.add(rect.y + rect.height + padding)
  }

  // Y 좌표 오름차순 정렬
  const sortedYPositions = Array.from(yPositions).sort((a, b) => a - b)

  // 각 Y 좌표에서 배치 가능한 위치 찾기
  for (const y of sortedYPositions) {
    // 이 Y 레벨에서 X 좌표 후보들 수집: 0, 각 조각의 오른쪽(x+width)
    const xPositions = new Set<number>([0])
    for (const rect of allRects) {
      // 이 Y 레벨과 겹치는 조각들의 오른쪽 좌표
      if (rect.y < y + itemHeight && rect.y + rect.height > y) {
        xPositions.add(rect.x + rect.width + padding)
      }
    }

    // X 좌표 오름차순 정렬
    const sortedXPositions = Array.from(xPositions).sort((a, b) => a - b)

    for (const x of sortedXPositions) {
      // 필름 폭을 초과하면 스킵
      if (x + itemWidth > filmWidth) {
        continue
      }

      const candidateRect = {
        x,
        y,
        width: itemWidth,
        height: itemHeight,
      }

      // 모든 기존 조각과 겹치는지 확인
      let hasOverlap = false
      for (const rect of allRects) {
        if (rectsOverlap(candidateRect, rect)) {
          hasOverlap = true
          break
        }
      }

      if (!hasOverlap) {
        return { x, y }
      }
    }
  }

  // 모든 위치에서 배치 불가능하면 맨 아래에 배치
  const maxY =
    allRects.length > 0
      ? Math.max(...allRects.map((r) => r.y + r.height)) + padding
      : 0

  return { x: 0, y: maxY }
}

/**
 * Shelf First Fit Decreasing Height (FFDH) 알고리즘
 * Strip Packing에 최적화된 알고리즘
 *
 * 완료된 조각(fixedPosition 있는)은 고정 위치에 배치하고,
 * 미완료 조각만 남은 공간에서 최적화 배치
 *
 * 개선: 고정된 조각 옆의 빈 공간을 먼저 활용
 */
export function packPieces(
  items: PackerInputItem[],
  options: PackerOptions
): PackingResult {
  const { filmWidth, allowRotation, padding = 0 } = options

  if (items.length === 0) {
    return {
      bins: [],
      usedLength: 0,
      totalUsedArea: 0,
      totalPieceArea: 0,
      totalWasteArea: 0,
      wastePercentage: 0,
    }
  }

  // 고정된 조각과 미완료 조각 분리
  const fixedItems = items.filter((item) => item.fixedPosition)
  const unfixedItems = items.filter((item) => !item.fixedPosition)

  // 고정된 조각들을 먼저 배치 결과에 추가
  const fixedRects: PackedRect[] = fixedItems.map((item) => {
    const pos = item.fixedPosition!
    return {
      x: pos.x,
      y: pos.y,
      width: pos.width,
      height: pos.height,
      originalWidth: item.width,
      originalHeight: item.height,
      rotated: pos.rotated,
      pieceId: item.id,
      label: item.label,
      listIndex: item.listIndex,
    }
  })

  // 미완료 조각 정보를 회전 여부와 함께 준비
  const preparedItems = unfixedItems.map((item) => {
    let width = item.width
    let height = item.height
    let rotated = false

    // 회전이 필요한 경우 처리
    if (allowRotation) {
      // 폭이 필름 폭보다 크면 회전 필수
      if (width > filmWidth && height <= filmWidth) {
        ;[width, height] = [height, width]
        rotated = true
      }
      // 높이가 더 크면 회전해서 폭을 줄임 (더 많은 조각을 가로로 배치 가능)
      else if (height > width && width <= filmWidth) {
        ;[width, height] = [height, width]
        rotated = true
      }
    }

    return {
      ...item,
      packedWidth: width,
      packedHeight: height,
      rotated,
    }
  })

  // 높이 기준 내림차순 정렬 (같은 높이면 폭 내림차순)
  const sortedItems = [...preparedItems].sort((a, b) => {
    if (b.packedHeight !== a.packedHeight) {
      return b.packedHeight - a.packedHeight
    }
    return b.packedWidth - a.packedWidth
  })

  // 새로 배치된 조각들
  const placedRects: PackedRect[] = []

  // 각 조각을 배치
  for (const item of sortedItems) {
    // 배치할 수 없는 조각 (필름 폭보다 큼) 스킵
    if (item.packedWidth > filmWidth) {
      continue
    }

    // 빈 공간을 찾아 배치
    const position = findPlacementPosition(
      item.packedWidth,
      item.packedHeight,
      filmWidth,
      fixedRects,
      placedRects,
      padding
    )

    if (position) {
      const rect: PackedRect = {
        x: position.x,
        y: position.y,
        width: item.packedWidth,
        height: item.packedHeight,
        originalWidth: item.width,
        originalHeight: item.height,
        rotated: item.rotated,
        pieceId: item.id,
        label: item.label,
        listIndex: item.listIndex,
      }
      placedRects.push(rect)
    }
  }

  // 결과 병합 (고정 조각 + 새로 배치된 조각)
  const allRects: PackedRect[] = [...fixedRects, ...placedRects]

  const usedHeight =
    allRects.length > 0 ? Math.max(...allRects.map((r) => r.y + r.height)) : 0

  const usedArea = allRects.reduce(
    (sum, rect) => sum + rect.width * rect.height,
    0
  )

  const bin: PackedBin = {
    rects: allRects,
    usedArea,
    usedWidth: filmWidth,
    usedHeight,
  }

  // 전체 통계 계산
  const usedLength = usedHeight
  const totalUsedArea = filmWidth * usedLength
  const totalPieceArea = usedArea
  const totalWasteArea = totalUsedArea - totalPieceArea
  const wastePercentage =
    totalUsedArea > 0 ? (totalWasteArea / totalUsedArea) * 100 : 0

  return {
    bins: [bin],
    usedLength,
    totalUsedArea,
    totalPieceArea,
    totalWasteArea,
    wastePercentage: Math.round(wastePercentage * 100) / 100,
  }
}

/**
 * 재단 조각 목록으로 패킹 결과 계산
 * 편의 함수: piecesToPackerInput + packPieces 조합
 */
export function calculatePackingResult(
  pieces: CuttingPiece[],
  options: PackerOptions
): PackingResult {
  const items = piecesToPackerInput(pieces)
  return packPieces(items, options)
}

/**
 * 손실율 계산
 */
export function calculateWastePercentage(
  usedLength: number,
  filmWidth: number,
  totalPieceArea: number
): number {
  const totalUsedArea = usedLength * filmWidth
  if (totalUsedArea === 0) return 0
  const wasteArea = totalUsedArea - totalPieceArea
  return Math.round((wasteArea / totalUsedArea) * 10000) / 100 // 소수점 2자리
}
