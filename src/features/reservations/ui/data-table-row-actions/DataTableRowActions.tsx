import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { type Reservation } from '@/entities/reservation'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { MoreHorizontal, Eye, CheckCircle, XCircle } from 'lucide-react'
import {
  useUpdateReservationStatus,
  useCancelReservation,
} from '@/features/reservations/api/use-reservations-mutation'
import { ReservationDetailDialog } from '../reservation-detail-dialog'

interface DataTableRowActionsProps {
  row: Row<Reservation>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [detailOpen, setDetailOpen] = useState(false)
  const reservation = row.original

  const updateStatus = useUpdateReservationStatus()
  const cancelReservation = useCancelReservation()

  const canConfirm = reservation.status === 'pending'
  const canComplete = reservation.status === 'confirmed'
  const canCancel = ['pending', 'confirmed'].includes(reservation.status)

  const handleConfirm = () => {
    updateStatus.mutate({ id: reservation.id, status: 'confirmed' })
  }

  const handleComplete = () => {
    updateStatus.mutate({ id: reservation.id, status: 'completed' })
  }

  const handleCancel = () => {
    if (confirm('정말 이 예약을 취소하시겠습니까?')) {
      cancelReservation.mutate({ id: reservation.id })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex size-8 p-0'
          >
            <MoreHorizontal className='size-4' />
            <span className='sr-only'>메뉴 열기</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          <DropdownMenuItem onClick={() => setDetailOpen(true)}>
            <Eye className='mr-2 size-4' />
            상세 보기
          </DropdownMenuItem>

          {canConfirm && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleConfirm}>
                <CheckCircle className='mr-2 size-4' />
                확정하기
              </DropdownMenuItem>
            </>
          )}

          {canComplete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleComplete}>
                <CheckCircle className='mr-2 size-4' />
                완료하기
              </DropdownMenuItem>
            </>
          )}

          {canCancel && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCancel}
                className='text-destructive'
              >
                <XCircle className='mr-2 size-4' />
                취소하기
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ReservationDetailDialog
        reservation={reservation}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  )
}
