/**
 * API 엔드포인트 상수 정의
 * 모든 API 엔드포인트를 중앙에서 관리합니다.
 */

const API_BASE = '/api'

// ===== 인증 API =====
export const AUTH_API = {
  LOGIN: `${API_BASE}/admin/auth/login`,
  LOGOUT: `${API_BASE}/admin/auth/logout`,
  REFRESH: `${API_BASE}/admin/auth/refresh`,
  ME: `${API_BASE}/admin/auth/me`,
} as const

// ===== 예약 관리 API =====
export const ADMIN_API = {
  // 예약 관리
  RESERVATIONS: {
    LIST: `${API_BASE}/admin/reservations`,
    DETAIL: (id: string) => `${API_BASE}/admin/reservations/${id}`,
    STATUS: (id: string) => `${API_BASE}/admin/reservations/${id}/status`,
    CANCEL: (id: string) => `${API_BASE}/admin/reservations/${id}/cancel`,
  },

  // 서비스 관리
  SERVICES: {
    LIST: `${API_BASE}/admin/services`,
    CREATE: `${API_BASE}/admin/services`,
    DETAIL: (id: string) => `${API_BASE}/admin/services/${id}`,
    UPDATE: (id: string) => `${API_BASE}/admin/services/${id}`,
    DELETE: (id: string) => `${API_BASE}/admin/services/${id}/delete`,
  },

  // 포트폴리오 관리
  PORTFOLIOS: {
    LIST: `${API_BASE}/admin/portfolios`,
    CREATE: `${API_BASE}/admin/portfolios`,
    DETAIL: (id: string) => `${API_BASE}/admin/portfolios/${id}`,
    UPDATE: (id: string) => `${API_BASE}/admin/portfolios/${id}`,
    DELETE: (id: string) => `${API_BASE}/admin/portfolios/${id}/delete`,
  },

  // 리뷰 관리
  REVIEWS: {
    LIST: `${API_BASE}/admin/reviews`,
    DETAIL: (id: string) => `${API_BASE}/admin/reviews/${id}`,
    DELETE: (id: string) => `${API_BASE}/admin/reviews/${id}/delete`,
  },

  // 고객 관리
  CUSTOMERS: {
    LIST: `${API_BASE}/admin/customers`,
    DETAIL: (id: string) => `${API_BASE}/admin/customers/${id}`,
  },

  // 운영 설정
  SETTINGS: {
    OPERATING_HOURS: {
      GET: `${API_BASE}/admin/settings/operating-hours`,
      UPDATE: `${API_BASE}/admin/settings/operating-hours`,
    },
    HOLIDAYS: {
      LIST: `${API_BASE}/admin/settings/holidays`,
      CREATE: `${API_BASE}/admin/settings/holidays`,
      DELETE: (date: string) => `${API_BASE}/admin/settings/holidays/${date}`,
    },
  },

  // 대시보드 통계
  DASHBOARD: {
    STATS: `${API_BASE}/admin/dashboard/stats`,
  },

  // 이미지 업로드
  UPLOAD: {
    IMAGE: `${API_BASE}/upload`,
  },
} as const

// ===== 고객용 API (참고용, 백오피스에서는 사용하지 않음) =====
export const PUBLIC_API = {
  SERVICES: {
    LIST: `${API_BASE}/services`,
    DETAIL: (id: string) => `${API_BASE}/services/${id}`,
    AVAILABLE_TIMES: `${API_BASE}/services/available-times`,
  },
  PORTFOLIOS: {
    LIST: `${API_BASE}/portfolios`,
    DETAIL: (id: string) => `${API_BASE}/portfolios/${id}`,
  },
  REVIEWS: {
    LIST: `${API_BASE}/reviews`,
    DETAIL: (id: string) => `${API_BASE}/reviews/${id}`,
  },
} as const
