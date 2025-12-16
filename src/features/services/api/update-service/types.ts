import type {
  ServiceRegionInput,
  ServiceScheduleInput,
} from '../create-service'

/**
 * 서비스 수정 요청
 * POST /api/services/admin/:id/update 요청
 */
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

/**
 * 서비스 수정 Mutation 변수
 */
export interface UpdateServiceVariables {
  id: string
  data: UpdateServiceRequest
}
