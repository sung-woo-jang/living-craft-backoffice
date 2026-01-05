/**
 * 예약 관리 페이지
 * FSD pages 레이어: 위젯을 조합하여 완전한 페이지 구성
 */
import { ReservationListWidget } from '@/widgets/reservation'

export function ReservationsPage() {
  return (
    <div className='flex h-full flex-col gap-4 p-4 md:gap-8 md:p-8'>
      {/* 페이지 헤더 */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>예약 관리</h1>
          <p className='text-muted-foreground mt-2'>
            고객 예약을 조회하고 상태를 관리합니다.
          </p>
        </div>
      </div>

      {/* 예약 목록 위젯 */}
      <ReservationListWidget />
    </div>
  )
}
