/**
 * 예약 상태 관리 컴포넌트
 * FSD features 레이어: 상태 변경이라는 사용자 액션 구현
 */
import { useState } from 'react'
import { reservationStatuses } from '@/entities/reservation'
import {
  useUpdateReservationStatus,
  type ReservationStatus,
} from '@/features/reservations/api'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import styles from './StatusManager.module.scss'

interface StatusManagerProps {
  reservationId: string
  currentStatus: ReservationStatus
  onStatusChanged?: () => void
  onCancelRequested?: () => void
}

export function StatusManager({
  reservationId,
  currentStatus,
  onStatusChanged,
  onCancelRequested,
}: StatusManagerProps) {
  const [selectedStatus, setSelectedStatus] =
    useState<ReservationStatus>(currentStatus)
  const updateStatus = useUpdateReservationStatus()

  const handleStatusChange = async () => {
    if (selectedStatus === currentStatus) return

    // 취소 상태로 변경하려는 경우 별도 처리
    if (selectedStatus === 'cancelled') {
      onCancelRequested?.()
      return
    }

    await updateStatus.mutateAsync(
      {
        id: reservationId,
        status: selectedStatus,
      },
      {
        onSuccess: () => {
          onStatusChanged?.()
        },
      }
    )
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>상태 관리</h3>
      <div className={styles.controls}>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setSelectedStatus(value as ReservationStatus)}
        >
          <SelectTrigger className={styles.selectTrigger}>
            <SelectValue placeholder='상태 선택' />
          </SelectTrigger>
          <SelectContent>
            {reservationStatuses
              .filter((s) => s.value !== 'cancelled')
              .map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  <div className={styles.selectItem}>
                    {s.icon && <s.icon className={styles.selectItemIcon} />}
                    {s.label}
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {selectedStatus !== currentStatus && (
          <Button
            onClick={handleStatusChange}
            disabled={updateStatus.isPending}
            size='sm'
          >
            {updateStatus.isPending ? '변경 중...' : '상태 변경'}
          </Button>
        )}
      </div>
    </div>
  )
}
