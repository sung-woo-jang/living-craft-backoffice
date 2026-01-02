/**
 * 예약 상태
 */
export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

/**
 * 예약 정보
 */
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

/**
 * 예약 목록 응답
 */
export interface FetchReservationsResponse {
  items: Reservation[]
  total: number
}
