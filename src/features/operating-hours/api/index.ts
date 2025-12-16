// ===== Query Hooks =====
export {
  useFetchOperatingHours,
  useFetchHolidays,
} from './fetch-operating-hours'

// ===== Mutation Hooks =====
export {
  useUpdateOperatingHours,
  useAddHoliday,
  useDeleteHoliday,
} from './update-operating-hours'

// ===== Query Keys =====
export { operatingHoursKeys, holidaysKeys } from './query-keys'

// ===== Types =====
export type {
  OperatingHours,
  Holiday,
  DayOfWeek,
  TimeSlot,
} from './fetch-operating-hours'

export type { AddHolidayRequest } from './update-operating-hours'
