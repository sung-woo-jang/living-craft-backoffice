import { useEffect, useMemo } from 'react'
import * as z from 'zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Service } from '@/shared/types/api'
import { useServicesList } from '../api/use-services-query'

// Zod 스키마 정의
export const serviceFormSchema = z.object({
  title: z
    .string()
    .min(1, '서비스명을 입력하세요')
    .max(100, '서비스명은 100자 이내로 입력하세요'),
  description: z.string().min(1, '설명을 입력하세요'),
  iconName: z.string().min(1, '아이콘 이름을 입력하세요'),
  iconBgColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력하세요 (예: #3B82F6)'),
  duration: z.string().min(1, '소요 시간을 입력하세요'),
  requiresTimeSelection: z.boolean(),
  sortOrder: z.number().min(1, '정렬 순서는 1 이상이어야 합니다'),
  regions: z
    .array(
      z.object({
        districtId: z.number(),
        estimateFee: z.number().min(0, '출장비는 0 이상이어야 합니다'),
      })
    )
    .min(1, '최소 1개 이상의 지역을 선택해야 합니다'),
})

export type ServiceFormValues = z.infer<typeof serviceFormSchema>

interface UseServiceFormOptions {
  service?: Service
  isOpen: boolean
}

export function useServiceForm({
  service,
  isOpen,
}: UseServiceFormOptions): UseFormReturn<ServiceFormValues> {
  const isEditMode = Boolean(service)

  // 서비스 목록 조회
  const { data: services = [] } = useServicesList()

  // 다음 sortOrder 계산 (신규 추가 모드일 때만)
  const nextSortOrder = useMemo(() => {
    if (isEditMode) {
      // 수정 모드: 기존 sortOrder 사용 (null이면 1)
      return service?.sortOrder || 1
    }
    // 신규 추가: 최대값 + 1 (최소 1)
    return Math.max(...services.map((s) => s.sortOrder || 0), 0) + 1
  }, [services, isEditMode, service])

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      iconName: '',
      iconBgColor: '#3B82F6',
      duration: '',
      requiresTimeSelection: false,
      sortOrder: nextSortOrder,
      regions: [],
    },
  })

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (service && isOpen) {
      // serviceableRegions 계층 구조를 평면화하여 regions 배열 생성
      const flattenedRegions = (service.serviceableRegions || []).flatMap(
        (region) =>
          region.cities.map((city) => ({
            districtId: parseInt(city.id),
            estimateFee: city.estimateFee ?? region.estimateFee,
          }))
      )

      form.reset({
        title: service.title,
        description: service.description,
        iconName: service.iconName,
        iconBgColor: service.iconBgColor,
        duration: service.duration,
        requiresTimeSelection: service.requiresTimeSelection,
        sortOrder: service.sortOrder,
        regions: flattenedRegions,
      })
    } else if (!isOpen) {
      form.reset()
    }
  }, [service, isOpen, form])

  return form
}
