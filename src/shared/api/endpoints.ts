/**
 * API 엔드포인트 상수 정의
 * baseURL에 /api가 포함되므로 상대 경로 사용
 */

// ===== 인증 API =====
export const AUTH_API = {
  LOGIN: '/admin/auth/login',
  REFRESH: '/admin/auth/refresh',
  ME: '/admin/auth/me',
} as const

// ===== 예약 관리 API =====
export const ADMIN_API = {
  // 예약 관리
  RESERVATIONS: {
    LIST: '/admin/reservations',
    DETAIL: (id: string) => `/admin/reservations/${id}`,
    STATUS: (id: string) => `/admin/reservations/${id}/status`,
    CANCEL: (id: string) => `/admin/reservations/${id}/cancel`,
  },

  // 서비스 관리 (백엔드: /api/services/admin/*)
  SERVICES: {
    LIST: '/services/admin',
    CREATE: '/services/admin',
    DETAIL: (id: number | string) => `/services/admin/${id}`,
    UPDATE: (id: number | string) => `/services/admin/${id}/update`,
    DELETE: (id: number | string) => `/services/admin/${id}/delete`,
    TOGGLE: (id: number | string) => `/services/admin/${id}/toggle`,
    ORDER: '/services/admin/order',
  },

  // 행정구역 관리
  DISTRICTS: {
    LIST: '/admin/districts',
  },

  // 아이콘 관리
  ICONS: {
    LIST: '/icons',
  },

  // 포트폴리오 관리
  PORTFOLIOS: {
    LIST: '/admin/portfolios',
    CREATE: '/admin/portfolios',
    DETAIL: (id: string) => `/admin/portfolios/${id}`,
    UPDATE: (id: string) => `/admin/portfolios/${id}`,
    DELETE: (id: string) => `/admin/portfolios/${id}/delete`,
  },

  // 리뷰 관리
  REVIEWS: {
    LIST: '/admin/reviews',
    DETAIL: (id: string) => `/admin/reviews/${id}`,
    DELETE: (id: string) => `/admin/reviews/${id}/delete`,
  },

  // 고객 관리
  CUSTOMERS: {
    LIST: '/admin/customers',
    DETAIL: (id: string) => `/admin/customers/${id}`,
  },

  // 운영 설정
  SETTINGS: {
    OPERATING_HOURS: {
      GET: '/admin/settings/operating-hours',
      UPDATE: '/admin/settings/operating-hours',
    },
    HOLIDAYS: {
      LIST: '/admin/settings/holidays',
      CREATE: '/admin/settings/holidays',
      DELETE: (date: string) => `/admin/settings/holidays/${date}`,
    },
  },

  // 대시보드 통계
  DASHBOARD: {
    STATS: '/admin/dashboard/stats',
  },

  // 이미지 업로드
  UPLOAD: {
    IMAGE: '/upload',
  },
} as const

// ===== 고객용 API (참고용, 백오피스에서는 사용하지 않음) =====
export const PUBLIC_API = {
  SERVICES: {
    LIST: '/services',
    DETAIL: (id: string) => `/services/${id}`,
    AVAILABLE_TIMES: '/services/available-times',
  },
  PORTFOLIOS: {
    LIST: '/portfolios',
    DETAIL: (id: string) => `/portfolios/${id}`,
  },
  REVIEWS: {
    LIST: '/reviews',
    DETAIL: (id: string) => `/reviews/${id}`,
  },
} as const
