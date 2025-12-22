import { useEffect } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { PromotionAdmin } from '@/shared/types/api'

// ===== Zod 스키마 정의 =====

export const promotionFormSchema = z.object({
  title: z
    .string()
    .min(1, '제목을 입력하세요')
    .max(100, '제목은 100자 이내로 입력하세요'),
  subtitle: z.string().max(200, '부제목은 200자 이내로 입력하세요'),
  linkUrl: z.string(),
  linkType: z.enum(['external', 'internal']),
  startDate: z.string(),
  endDate: z.string(),
  isActive: z.boolean(),
  sortOrder: z.number().min(0, '정렬 순서는 0 이상이어야 합니다'),
  existingIconUrl: z.string().nullable(),
  newIcon: z.instanceof(File).nullable().optional(),
})

export type PromotionFormValues = z.infer<typeof promotionFormSchema>

// ===== 상수 =====

export const LINK_TYPE_OPTIONS = [
  { value: 'external', label: '외부 링크' },
  { value: 'internal', label: '앱 내 이동' },
] as const

export const INTERNAL_LINK_OPTIONS = [
  { value: '/reservation', label: '예약 페이지' },
  { value: '/portfolio', label: '포트폴리오 목록' },
  { value: '/review', label: '리뷰 목록' },
] as const

// ===== 헬퍼 함수 =====

/** 폼 기본값 생성 */
function getDefaultFormValues(): PromotionFormValues {
  return {
    title: '',
    subtitle: '',
    linkUrl: '',
    linkType: 'external',
    startDate: '',
    endDate: '',
    isActive: true,
    sortOrder: 0,
    existingIconUrl: null,
    newIcon: null,
  }
}

// ===== 페이지용 훅 =====

interface UsePromotionFormPageOptions {
  promotionDetail?: PromotionAdmin
  isLoading?: boolean
  nextSortOrder?: number
}

/**
 * 프로모션 폼 페이지용 훅
 *
 * 생성/수정 페이지에서 사용합니다.
 */
export function usePromotionFormPage({
  promotionDetail,
  isLoading,
  nextSortOrder = 0,
}: UsePromotionFormPageOptions) {
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      ...getDefaultFormValues(),
      sortOrder: nextSortOrder,
    },
  })

  // promotionDetail 변경 시 폼 상태 동기화
  useEffect(() => {
    if (isLoading) return

    if (promotionDetail) {
      form.reset({
        title: promotionDetail.title,
        subtitle: promotionDetail.subtitle ?? '',
        linkUrl: promotionDetail.linkUrl ?? '',
        linkType: promotionDetail.linkType,
        startDate: promotionDetail.startDate
          ? promotionDetail.startDate.split('T')[0]
          : '',
        endDate: promotionDetail.endDate
          ? promotionDetail.endDate.split('T')[0]
          : '',
        isActive: promotionDetail.isActive,
        sortOrder: promotionDetail.sortOrder,
        existingIconUrl: promotionDetail.iconUrl ?? null,
        newIcon: null,
      })
    } else {
      form.reset({
        ...getDefaultFormValues(),
        sortOrder: nextSortOrder,
      })
    }
  }, [promotionDetail, isLoading, nextSortOrder, form])

  return form
}
