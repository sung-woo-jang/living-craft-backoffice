import { z } from 'zod'

/**
 * 예약 상태 타입
 */
export const reservationStatusSchema = z.enum([
  'pending',
  'confirmed',
  'completed',
  'cancelled',
])

export type ReservationStatus = z.infer<typeof reservationStatusSchema>

/**
 * 예약 엔티티 스키마
 */
export const reservationSchema = z.object({
  id: z.string(),
  reservationNumber: z.string(),
  userId: z.string(),
  serviceId: z.string(),
  serviceName: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  estimateDate: z.string(),
  estimateTime: z.string(),
  constructionDate: z.string(),
  constructionTime: z.string().nullable(),
  address: z.string(),
  detailAddress: z.string(),
  memo: z.string(),
  photos: z.array(z.string()),
  status: reservationStatusSchema,
  cancelReason: z.string().nullable(),
  canceledAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Reservation = z.infer<typeof reservationSchema>
