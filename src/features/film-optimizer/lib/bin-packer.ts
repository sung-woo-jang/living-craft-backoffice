import { MaxRectsPacker, Rectangle } from 'maxrects-packer'
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
 * MaxRectsPacker를 사용하여 2D bin packing 수행
 * Strip Packing 방식: 폭 고정, 길이 방향으로 확장
 */
export function packPieces(
  items: PackerInputItem[],
  options: PackerOptions
): PackingResult {
  const { filmWidth, filmMaxLength, allowRotation, padding = 0 } = options

  // MaxRectsPacker 인스턴스 생성
  // 주의: maxrects-packer는 width가 가로, height가 세로
  // 우리의 경우 필름 폭이 고정이므로 width=filmWidth, height=filmMaxLength
  const packer = new MaxRectsPacker<Rectangle>(filmWidth, filmMaxLength, padding, {
    smart: true, // 스마트 패킹 활성화
    pot: false, // Power of Two 비활성화
    square: false, // 정사각형 강제 비활성화
    allowRotation, // 회전 허용 여부
    tag: false, // 태그 사용 안 함
  })

  // 아이템 추가
  const rectangles: Rectangle[] = items.map((item, index) => {
    const rect = new Rectangle(item.width, item.height)
    rect.data = {
      pieceId: item.id,
      label: item.label,
      index,
      originalWidth: item.width,
      originalHeight: item.height,
    }
    return rect
  })

  // 패킹 수행
  packer.addArray(rectangles)

  // 결과 변환
  const bins: PackedBin[] = packer.bins.map((bin) => {
    const rects: PackedRect[] = bin.rects.map((rect) => ({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      originalWidth: rect.data?.originalWidth ?? rect.width,
      originalHeight: rect.data?.originalHeight ?? rect.height,
      rotated: rect.rot ?? false,
      pieceId: rect.data?.pieceId ?? 0,
      label: rect.data?.label ?? null,
    }))

    // 사용된 영역 계산
    const usedArea = rects.reduce(
      (sum, rect) => sum + rect.width * rect.height,
      0
    )
    const usedHeight = Math.max(...rects.map((r) => r.y + r.height), 0)

    return {
      rects,
      usedArea,
      usedWidth: filmWidth,
      usedHeight,
    }
  })

  // 전체 통계 계산
  const usedLength = bins.reduce((sum, bin) => sum + bin.usedHeight, 0)
  const totalUsedArea = filmWidth * usedLength
  const totalPieceArea = bins.reduce((sum, bin) => sum + bin.usedArea, 0)
  const totalWasteArea = totalUsedArea - totalPieceArea
  const wastePercentage =
    totalUsedArea > 0 ? (totalWasteArea / totalUsedArea) * 100 : 0

  return {
    bins,
    usedLength,
    totalUsedArea,
    totalPieceArea,
    totalWasteArea,
    wastePercentage: Math.round(wastePercentage * 100) / 100, // 소수점 2자리
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
