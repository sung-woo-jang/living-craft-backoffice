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
 * Shelf 구조체 (가로 줄)
 */
interface Shelf {
  y: number // shelf의 y 좌표 (시작 위치)
  height: number // shelf의 높이 (가장 큰 조각의 높이)
  usedWidth: number // 현재까지 사용된 폭
  rects: PackedRect[] // 이 shelf에 배치된 조각들
}

/**
 * 재단 조각 목록을 패킹 입력으로 변환
 * quantity를 고려하여 개별 아이템으로 확장
 */
export function piecesToPackerInput(pieces: CuttingPiece[]): PackerInputItem[] {
  const result: PackerInputItem[] = []

  pieces.forEach((piece) => {
    // quantity 만큼 개별 아이템 생성
    for (let i = 0; i < piece.quantity; i++) {
      result.push({
        id: piece.id,
        width: piece.width,
        height: piece.height,
        label: piece.label,
      })
    }
  })

  return result
}

/**
 * Shelf First Fit Decreasing Height (FFDH) 알고리즘
 * Strip Packing에 최적화된 알고리즘
 *
 * 1. 조각들을 높이 기준으로 내림차순 정렬
 * 2. 각 조각에 대해 기존 shelf에 들어갈 수 있는 첫 번째 shelf를 찾음
 * 3. 없으면 새 shelf 생성
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

  // 조각 정보를 회전 여부와 함께 준비
  const preparedItems = items.map((item) => {
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

  const shelves: Shelf[] = []
  let currentY = 0

  // 각 조각을 shelf에 배치
  for (const item of sortedItems) {
    const itemWidth = item.packedWidth + padding
    const itemHeight = item.packedHeight

    // 배치할 수 없는 조각 (필름 폭보다 큼) 스킵
    if (item.packedWidth > filmWidth) {
      continue
    }

    // 기존 shelf 중 들어갈 수 있는 곳 찾기 (First Fit)
    let placed = false
    for (const shelf of shelves) {
      if (shelf.usedWidth + itemWidth <= filmWidth + padding) {
        // 이 shelf에 배치
        const rect: PackedRect = {
          x: shelf.usedWidth,
          y: shelf.y,
          width: item.packedWidth,
          height: item.packedHeight,
          originalWidth: item.width,
          originalHeight: item.height,
          rotated: item.rotated,
          pieceId: item.id,
          label: item.label,
        }
        shelf.rects.push(rect)
        shelf.usedWidth += itemWidth
        placed = true
        break
      }
    }

    // 기존 shelf에 배치할 수 없으면 새 shelf 생성
    if (!placed) {
      const newShelf: Shelf = {
        y: currentY,
        height: itemHeight,
        usedWidth: itemWidth,
        rects: [
          {
            x: 0,
            y: currentY,
            width: item.packedWidth,
            height: item.packedHeight,
            originalWidth: item.width,
            originalHeight: item.height,
            rotated: item.rotated,
            pieceId: item.id,
            label: item.label,
          },
        ],
      }
      shelves.push(newShelf)
      currentY += itemHeight + padding
    }
  }

  // 결과 변환
  const allRects: PackedRect[] = shelves.flatMap((shelf) => shelf.rects)
  const usedHeight =
    shelves.length > 0
      ? Math.max(...allRects.map((r) => r.y + r.height))
      : 0

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
