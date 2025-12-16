import { useQueryClient } from '@tanstack/react-query'
import { axiosInstance, ADMIN_API, type ApiResponse } from '@/shared/api'
import { useStandardMutation } from '@/shared/hooks/custom-query'
import { toast } from 'sonner'
import type { OperatingHours } from '../fetch-operating-hours'
import { operatingHoursKeys, holidaysKeys } from '../query-keys'
import type { AddHolidayRequest } from './types'

/**
 * 운영 시간 수정 API
 */
const updateOperatingHours = async (
  request: OperatingHours
): Promise<ApiResponse<void>> => {
  const { data } = await axiosInstance.post<void>(
    ADMIN_API.SETTINGS.OPERATING_HOURS.UPDATE,
    request
  )
  return data
}

/**
 * 휴무일 추가 API
 */
const addHoliday = async (
  request: AddHolidayRequest
): Promise<ApiResponse<void>> => {
  const { data } = await axiosInstance.post<void>(
    ADMIN_API.SETTINGS.HOLIDAYS.CREATE,
    request
  )
  return data
}

/**
 * 휴무일 삭제 API
 */
const deleteHoliday = async (date: string): Promise<ApiResponse<void>> => {
  const { data } = await axiosInstance.post<void>(
    ADMIN_API.SETTINGS.HOLIDAYS.DELETE(date)
  )
  return data
}

/**
 * 운영 시간 수정
 *
 * POST /api/admin/settings/operating-hours
 */
export function useUpdateOperatingHours() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, OperatingHours>({
    mutationFn: updateOperatingHours,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...operatingHoursKeys.all()] })
      toast.success('운영 시간이 저장되었습니다.')
    },
  })
}

/**
 * 휴무일 추가
 *
 * POST /api/admin/settings/holidays
 */
export function useAddHoliday() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, AddHolidayRequest>({
    mutationFn: addHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...holidaysKeys.all()] })
      toast.success('휴무일이 추가되었습니다.')
    },
  })
}

/**
 * 휴무일 삭제
 *
 * POST /api/admin/settings/holidays/:date/delete
 */
export function useDeleteHoliday() {
  const queryClient = useQueryClient()

  return useStandardMutation<void, Error, string>({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...holidaysKeys.all()] })
      toast.success('휴무일이 삭제되었습니다.')
    },
  })
}
