import { type Reservation, reservationStatuses } from '@/entities/reservation'
import {
  formatDateTimeDot,
  formatPhoneNumber,
  formatFullAddress,
} from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Separator } from '@/shared/ui/separator'

interface ReservationDetailDialogProps {
  reservation: Reservation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReservationDetailDialog({
  reservation,
  open,
  onOpenChange,
}: ReservationDetailDialogProps) {
  const status = reservationStatuses.find((s) => s.value === reservation.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            예약 상세 정보
            {status && (
              <Badge variant={status.variant}>
                {status.icon && <status.icon className='mr-1 size-3' />}
                {status.label}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            예약번호: {reservation.reservationNumber}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* 고객 정보 */}
          <div>
            <h3 className='mb-2 text-sm font-semibold'>고객 정보</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex'>
                <span className='text-muted-foreground w-24'>이름</span>
                <span>{reservation.customerName}</span>
              </div>
              <div className='flex'>
                <span className='text-muted-foreground w-24'>전화번호</span>
                <span>{formatPhoneNumber(reservation.customerPhone)}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 서비스 정보 */}
          <div>
            <h3 className='mb-2 text-sm font-semibold'>서비스 정보</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex'>
                <span className='text-muted-foreground w-24'>서비스</span>
                <span>{reservation.serviceName}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 일정 정보 */}
          <div>
            <h3 className='mb-2 text-sm font-semibold'>일정 정보</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex'>
                <span className='text-muted-foreground w-24'>견적 일시</span>
                <span>
                  {formatDateTimeDot(
                    `${reservation.estimateDate}T${reservation.estimateTime}`
                  )}
                </span>
              </div>
              <div className='flex'>
                <span className='text-muted-foreground w-24'>시공 일시</span>
                <span>
                  {reservation.constructionTime
                    ? formatDateTimeDot(
                        `${reservation.constructionDate}T${reservation.constructionTime}`
                      )
                    : `${formatDateTimeDot(reservation.constructionDate)} (하루 종일)`}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 주소 정보 */}
          <div>
            <h3 className='mb-2 text-sm font-semibold'>주소 정보</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex'>
                <span className='text-muted-foreground w-24'>주소</span>
                <span className='flex-1'>
                  {formatFullAddress(
                    reservation.address,
                    reservation.detailAddress
                  )}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* 메모 */}
          {reservation.memo && (
            <>
              <div>
                <h3 className='mb-2 text-sm font-semibold'>메모</h3>
                <p className='text-sm whitespace-pre-wrap'>
                  {reservation.memo}
                </p>
              </div>
              <Separator />
            </>
          )}

          {/* 사진 */}
          {reservation.photos.length > 0 && (
            <>
              <div>
                <h3 className='mb-2 text-sm font-semibold'>
                  첨부 사진 ({reservation.photos.length}장)
                </h3>
                <div className='grid grid-cols-3 gap-2'>
                  {reservation.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`사진 ${index + 1}`}
                      className='aspect-square rounded-md object-cover'
                    />
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* 취소 정보 */}
          {reservation.status === 'cancelled' && reservation.cancelReason && (
            <>
              <div>
                <h3 className='text-destructive mb-2 text-sm font-semibold'>
                  취소 정보
                </h3>
                <div className='space-y-2 text-sm'>
                  <div className='flex'>
                    <span className='text-muted-foreground w-24'>
                      취소 사유
                    </span>
                    <span>{reservation.cancelReason}</span>
                  </div>
                  {reservation.canceledAt && (
                    <div className='flex'>
                      <span className='text-muted-foreground w-24'>
                        취소 일시
                      </span>
                      <span>{formatDateTimeDot(reservation.canceledAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* 기타 정보 */}
          <div>
            <h3 className='mb-2 text-sm font-semibold'>기타 정보</h3>
            <div className='space-y-2 text-sm'>
              <div className='flex'>
                <span className='text-muted-foreground w-24'>생성일</span>
                <span>{formatDateTimeDot(reservation.createdAt)}</span>
              </div>
              <div className='flex'>
                <span className='text-muted-foreground w-24'>수정일</span>
                <span>{formatDateTimeDot(reservation.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
