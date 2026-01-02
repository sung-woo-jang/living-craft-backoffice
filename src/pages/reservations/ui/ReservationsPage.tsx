/**
 * 예약 관리 페이지
 */
import { useFetchReservations } from '@/features/reservations/api'
import { ReservationsTable } from '@/features/reservations/ui/reservations-table/ReservationsTable'

export function ReservationsPage() {
  const { data: reservationsResponse, isLoading, error } = useFetchReservations()
  const data = reservationsResponse?.data

  return (
    <div className='flex h-full flex-col gap-4 p-4 md:gap-8 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>예약 관리</h1>
          <p className='text-muted-foreground mt-2'>
            고객 예약을 조회하고 상태를 관리합니다.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-center'>
            <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent'></div>
            <p className='text-muted-foreground'>예약을 불러오는 중...</p>
          </div>
        </div>
      )}

      {error && (
        <div className='flex h-[400px] items-center justify-center'>
          <p className='text-destructive'>예약을 불러오는데 실패했습니다.</p>
        </div>
      )}

      {!isLoading && !error && data?.items && (
        <ReservationsTable data={data.items} />
      )}
    </div>
  )
}
