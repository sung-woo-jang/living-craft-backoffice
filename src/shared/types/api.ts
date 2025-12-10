/**
 * 공통 API 타입 정의
 */

// ===== 공통 응답 타입 =====

export interface SuccessResponse<T> {
  success: true
  message: string
  data: T
  timestamp: string
}

export interface ErrorResponse {
  success: false
  error: string
  message: string
  statusCode: number
  timestamp: string
  path: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ===== 예약 관련 타입 =====

export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export interface Reservation {
  id: string
  reservationNumber: string
  userId: string
  serviceId: string
  serviceName: string
  customerName: string
  customerPhone: string
  estimateDate: string
  estimateTime: string
  constructionDate: string
  constructionTime: string | null
  address: string
  detailAddress: string
  memo: string
  photos: string[]
  status: ReservationStatus
  cancelReason: string | null
  canceledAt: string | null
  createdAt: string
  updatedAt: string
}

// ===== 아이콘 관련 타입 =====

export type IconType = 'FILL' | 'MONO' | 'COLOR'

export interface Icon {
  id: number
  name: string
  type: IconType
}

// ===== 서비스 관련 타입 =====

export interface CityDto {
  id: string
  name: string
  estimateFee: number | null
}

export interface ServiceableRegionDto {
  id: string
  name: string
  estimateFee: number
  cities: CityDto[]
}

export interface Service {
  id: string
  title: string
  description: string
  iconName: string
  iconBgColor: string
  duration: string // "하루 종일", "2-3시간" 등
  requiresTimeSelection: boolean
  isActive: boolean
  sortOrder: number
  serviceableRegions: ServiceableRegionDto[]
  schedule?: ServiceSchedule | null
  holidays?: ServiceHoliday[]
  createdAt: string
  updatedAt: string
}

export interface ServiceRegionInput {
  districtId: number
  estimateFee: number
}

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

export interface UpdateServiceRequest {
  title?: string
  description?: string
  iconName?: string
  iconBgColor?: string
  duration?: string
  requiresTimeSelection?: boolean
  sortOrder?: number
  regions?: ServiceRegionInput[]
  schedule?: ServiceScheduleInput
}

// ===== 행정구역 관련 타입 =====

export type DistrictLevel = 'SIDO' | 'SIGUNGU' | 'EUPMYEONDONG'

export interface District {
  id: number
  code: string
  name: string
  fullName: string
  level: DistrictLevel
  parentId: number | null
}

// ===== 포트폴리오 관련 타입 =====

export type PortfolioCategory =
  | '인테리어 필름'
  | '유리 청소'
  | '외부 유리'
  | '내부 유리'
  | '기타'

export interface Portfolio {
  id: string
  category: PortfolioCategory
  projectName: string
  clientName: string
  duration: string
  shortDescription: string
  detailedDescription: string
  images: string[]
  tags: string[]
  relatedServiceIds: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ===== 리뷰 관련 타입 =====

export interface Review {
  id: string
  userId: string
  customerName: string
  reservationId: string
  serviceId: string
  serviceName: string
  rating: number
  content: string
  photos: string[]
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

// ===== 고객 관련 타입 =====

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  totalReservations: number
  totalReviews: number
  averageRating?: number
  createdAt: string
  lastReservationAt?: string
}

export interface CustomerDetail extends Customer {
  reservations: Reservation[]
  reviews: Review[]
}

// ===== 운영 설정 관련 타입 =====

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface TimeSlot {
  startTime: string // HH:mm
  endTime: string // HH:mm
  interval: number // 분 단위 (30, 60, 120)
}

export interface OperatingHours {
  estimateSlots: {
    [key in DayOfWeek]?: TimeSlot
  }
  constructionSlots: {
    [key in DayOfWeek]?: TimeSlot
  }
}

export interface Holiday {
  date: string // YYYY-MM-DD
  reason: string
  createdAt: string
}

// ===== 대시보드 관련 타입 =====

export interface DashboardStats {
  todayReservations: {
    count: number
    change: number // 전일 대비 증감률 (%)
  }
  monthlyReservations: {
    count: number
    change: number // 전월 대비 증감률 (%)
  }
  averageRating: {
    value: number
    totalReviews: number
  }
  completionRate: {
    percentage: number
    completed: number
    total: number
  }
  monthlyChart: {
    labels: string[] // 월 이름
    data: number[] // 예약 건수
  }
  serviceDistribution: {
    labels: string[] // 서비스명
    data: number[] // 건수
  }
  timeDistribution: {
    labels: string[] // 시간대
    data: number[] // 건수
  }
  recentReservations: Reservation[]
  recentReviews: Review[]
}

// ===== 필터 관련 타입 =====

export interface ReservationFilters {
  status?: ReservationStatus
  startDate?: string
  endDate?: string
  search?: string // 고객명 또는 전화번호
  page?: number
  limit?: number
}

export interface ReviewFilters {
  rating?: number
  serviceId?: string
  search?: string
  page?: number
  limit?: number
}

export interface CustomerFilters {
  search?: string
  page?: number
  limit?: number
}

// ===== 서비스 스케줄 관련 타입 =====

export enum ScheduleMode {
  GLOBAL = 'global',
  WEEKDAYS = 'weekdays',
  WEEKENDS = 'weekends',
  EVERYDAY = 'everyday',
  CUSTOM = 'custom',
  EVERYDAY_EXCEPT = 'everyday_except',
}

export type DayCode = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'

export interface ServiceSchedule {
  id: number
  serviceId: number
  estimateScheduleMode: ScheduleMode
  estimateAvailableDays: DayCode[] | null
  estimateStartTime: string | null
  estimateEndTime: string | null
  estimateSlotDuration: number | null
  constructionScheduleMode: ScheduleMode
  constructionAvailableDays: DayCode[] | null
  constructionStartTime: string | null
  constructionEndTime: string | null
  constructionSlotDuration: number | null
  bookingPeriodMonths: number
  createdAt: string
  updatedAt: string
}

export interface ServiceScheduleInput {
  estimateScheduleMode: ScheduleMode
  estimateAvailableDays?: DayCode[]
  estimateStartTime?: string
  estimateEndTime?: string
  estimateSlotDuration?: number
  constructionScheduleMode: ScheduleMode
  constructionAvailableDays?: DayCode[]
  constructionStartTime?: string
  constructionEndTime?: string
  constructionSlotDuration?: number
  bookingPeriodMonths?: number
}

export interface ServiceHoliday {
  id: number
  serviceId: number
  date: string
  reason: string
  createdAt: string
  updatedAt: string
}

export interface ServiceHolidayInput {
  date: string
  reason: string
}
