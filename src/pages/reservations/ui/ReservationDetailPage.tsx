/**
 * 예약 상세 페이지
 */
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { reservationStatuses } from '@/entities/reservation'
import {
  useFetchReservationDetail,
  useUpdateReservationStatus,
  useCancelReservation,
  type ReservationStatus,
} from '@/features/reservations/api'
import {
  formatDateTimeDot,
  formatPhoneNumber,
  formatFullAddress,
} from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import styles from './ReservationDetailPage.module.scss'

export function ReservationDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // 예약 상세 데이터 조회 (Hook은 조건문 이전에 호출)
  const { data: reservationResponse, isLoading } = useFetchReservationDetail(
    id || ''
  )
  const reservation = reservationResponse?.data

  // 상태 관리
  const [selectedStatus, setSelectedStatus] = useState<string>(
    reservation?.status || 'pending'
  )
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelInput, setShowCancelInput] = useState(false)

  const updateStatus = useUpdateReservationStatus()
  const cancelReservation = useCancelReservation()

  // id가 없으면 목록으로 리다이렉트
  if (!id) {
    navigate('/reservations')
    return null
  }

  // 예약이 로드되면 selectedStatus 업데이트
  if (reservation && selectedStatus !== reservation.status) {
    setSelectedStatus(reservation.status)
  }

  // 상태 변경 핸들러
  const handleStatusChange = async () => {
    if (!reservation || selectedStatus === reservation.status) return

    if (selectedStatus === 'cancelled') {
      setShowCancelInput(true)
      return
    }

    await updateStatus.mutateAsync(
      {
        id: reservation.id,
        status: selectedStatus as ReservationStatus,
      },
      {
        onSuccess: () => {
          // 성공 후 목록으로 이동하지 않고 현재 페이지 유지
        },
      }
    )
  }

  // 취소 처리 핸들러
  const handleCancel = async () => {
    if (!reservation) return

    if (!cancelReason.trim()) {
      alert('취소 사유를 입력해주세요.')
      return
    }

    await cancelReservation.mutateAsync(
      {
        id: reservation.id,
        reason: cancelReason,
      },
      {
        onSuccess: () => {
          setShowCancelInput(false)
          setCancelReason('')
          navigate('/reservations')
        },
      }
    )
  }

  const handleClose = () => {
    navigate('/reservations')
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <p>예약 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 예약이 없는 경우
  if (!reservation) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <p>예약을 찾을 수 없습니다.</p>
        </div>
      </div>
    )
  }

  const status = reservationStatuses.find((s) => s.value === reservation.status)

  return (
    <div className={styles.page}>
      {/* 페이지 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>예약 상세 정보</h1>
            {status && (
              <Badge variant={status.variant}>
                {status.icon && <status.icon className='mr-1 size-3' />}
                {status.label}
              </Badge>
            )}
          </div>
          <p className={styles.description}>
            예약번호: {reservation.reservationNumber}
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button variant='outline' onClick={handleClose}>
            목록으로
          </Button>
        </div>
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        <div className={styles.content}>
          {/* 예약 상태 변경 */}
          {reservation.status !== 'cancelled' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>상태 관리</h3>
              <div className={styles.statusSection}>
                <div className={styles.statusControls}>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='상태 선택' />
                    </SelectTrigger>
                    <SelectContent>
                      {reservationStatuses
                        .filter((s) => s.value !== 'cancelled')
                        .map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            <div className='flex items-center gap-2'>
                              {s.icon && <s.icon className='size-4' />}
                              {s.label}
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {selectedStatus !== reservation.status && (
                    <Button
                      onClick={handleStatusChange}
                      disabled={updateStatus.isPending}
                      size='sm'
                    >
                      {updateStatus.isPending ? '변경 중...' : '상태 변경'}
                    </Button>
                  )}
                </div>
                {showCancelInput && (
                  <div className={styles.cancelInputContainer}>
                    <label className={styles.cancelLabel}>취소 사유</label>
                    <Textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder='취소 사유를 입력하세요'
                      rows={3}
                    />
                    <div className={styles.cancelActions}>
                      <Button
                        onClick={handleCancel}
                        disabled={cancelReservation.isPending}
                        variant='destructive'
                        size='sm'
                      >
                        {cancelReservation.isPending ? '취소 처리 중...' : '취소 확정'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowCancelInput(false)
                          setSelectedStatus(reservation.status)
                        }}
                        variant='outline'
                        size='sm'
                      >
                        취소
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 고객 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>고객 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>이름</span>
                <span className={styles.infoValue}>{reservation.customerName}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>전화번호</span>
                <span className={styles.infoValue}>
                  {formatPhoneNumber(reservation.customerPhone)}
                </span>
              </div>
            </div>
          </div>

          {/* 서비스 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>서비스 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>서비스</span>
                <span className={styles.infoValue}>{reservation.serviceName}</span>
              </div>
            </div>
          </div>

          {/* 일정 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>일정 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>견적 일시</span>
                <span className={styles.infoValue}>
                  {formatDateTimeDot(
                    `${reservation.estimateDate}T${reservation.estimateTime}`
                  )}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>시공 일시</span>
                <span className={styles.infoValue}>
                  {reservation.constructionTime
                    ? formatDateTimeDot(
                        `${reservation.constructionDate}T${reservation.constructionTime}`
                      )
                    : `${formatDateTimeDot(reservation.constructionDate)} (하루 종일)`}
                </span>
              </div>
            </div>
          </div>

          {/* 주소 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>주소 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>주소</span>
                <span className={styles.infoValue}>
                  {formatFullAddress(
                    reservation.address,
                    reservation.detailAddress
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 메모 */}
          {reservation.memo && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>메모</h3>
              <p className={styles.memoText}>{reservation.memo}</p>
            </div>
          )}

          {/* 사진 - photos undefined 에러 수정 */}
          {reservation.photos && reservation.photos.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                첨부 사진 ({reservation.photos.length}장)
              </h3>
              <div className={styles.photosGrid}>
                {reservation.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`사진 ${index + 1}`}
                    className={styles.photoImage}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 취소 정보 */}
          {reservation.status === 'cancelled' && reservation.cancelReason && (
            <div className={`${styles.section} ${styles.cancelSection}`}>
              <h3 className={styles.sectionTitle}>취소 정보</h3>
              <div className={styles.infoList}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>취소 사유</span>
                  <span className={styles.infoValue}>
                    {reservation.cancelReason}
                  </span>
                </div>
                {reservation.canceledAt && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>취소 일시</span>
                    <span className={styles.infoValue}>
                      {formatDateTimeDot(reservation.canceledAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 기타 정보 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>기타 정보</h3>
            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>생성일</span>
                <span className={styles.infoValue}>
                  {formatDateTimeDot(reservation.createdAt)}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>수정일</span>
                <span className={styles.infoValue}>
                  {formatDateTimeDot(reservation.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 푸터 */}
      <div className={styles.footer}>
        {reservation.status !== 'cancelled' && (
          <Button
            onClick={() => {
              setSelectedStatus('cancelled')
              setShowCancelInput(true)
            }}
            variant='destructive'
            disabled={
              updateStatus.isPending ||
              cancelReservation.isPending ||
              showCancelInput
            }
          >
            예약 취소
          </Button>
        )}
        <Button variant='outline' onClick={handleClose}>
          닫기
        </Button>
      </div>
    </div>
  )
}
