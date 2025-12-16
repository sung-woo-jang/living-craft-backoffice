/**
 * 스케줄 모드
 */
export enum ScheduleMode {
  GLOBAL = 'global',
  WEEKDAYS = 'weekdays',
  WEEKENDS = 'weekends',
  EVERYDAY = 'everyday',
  CUSTOM = 'custom',
  EVERYDAY_EXCEPT = 'everyday_except',
}

/**
 * 요일 코드
 */
export type DayCode = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

/**
 * 서비스 지역 입력
 */
export interface ServiceRegionInput {
  districtId: number
  estimateFee: number
}

/**
 * 서비스 스케줄 입력 타입
 *
 * 견적 가능 일정만 설정합니다.
 * 시공 일정은 견적 방문 후 예약관리에서 직접 지정합니다.
 */
export interface ServiceScheduleInput {
  estimateScheduleMode: ScheduleMode
  estimateAvailableDays?: DayCode[]
  estimateStartTime?: string
  estimateEndTime?: string
  estimateSlotDuration?: number
  bookingPeriodMonths?: number
}

/**
 * 서비스 생성 요청
 * POST /api/services/admin 요청
 */
export interface CreateServiceRequest {
  title: string
  description: string
  iconName: string
  iconBgColor: string
  duration: string
  requiresTimeSelection: boolean
  sortOrder?: number
  regions: ServiceRegionInput[]
  schedule?: ServiceScheduleInput
}
