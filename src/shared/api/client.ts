/**
 * API 클라이언트 설정
 * Axios 인스턴스, 인터셉터, 에러 핸들링
 */
import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'
import { toast } from 'sonner'
// import { useAuthStore } from '@/features/auth/model/auth-store' // 기존 인증 스토어는 사용하지 않음

import type { ErrorResponse, SuccessResponse } from '../types/api'

// ===== Axios 인스턴스 생성 =====

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ===== Request 인터셉터 =====

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 쿠키에서 액세스 토큰 가져오기
    const cookies = document.cookie.split('; ')
    const accessTokenCookie = cookies.find((row) =>
      row.startsWith('access_token=')
    )
    const accessToken = accessTokenCookie?.split('=')[1]

    // 토큰이 있으면 Authorization 헤더에 추가
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// ===== Response 인터셉터 =====

apiClient.interceptors.response.use(
  (response: AxiosResponse<SuccessResponse<unknown>>) => {
    // SuccessResponse<T> 구조에서 data만 추출하여 반환
    if (
      response.data &&
      response.data.success &&
      response.data.data !== undefined
    ) {
      return {
        ...response,
        data: response.data.data,
      }
    }

    // SuccessResponse 구조가 아닌 경우 그대로 반환
    return response
  },
  (error: AxiosError<ErrorResponse>) => {
    // 에러 응답 처리
    const { response } = error

    if (!response) {
      // 네트워크 에러 또는 타임아웃
      toast.error('네트워크 연결을 확인해주세요.')
      return Promise.reject(error)
    }

    const { status, data } = response

    switch (status) {
      case 401: {
        // Unauthorized - 인증 실패
        // 쿠키 삭제
        document.cookie =
          'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        document.cookie =
          'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

        toast.error('인증이 만료되었습니다. 다시 로그인해주세요.')

        // 로그인 페이지로 리다이렉트 (현재 경로를 저장)
        const currentPath = window.location.pathname
        if (currentPath !== '/sign-in') {
          window.location.href = `/sign-in?redirect=${encodeURIComponent(currentPath)}`
        }
        break
      }

      case 403: {
        // Forbidden - 권한 없음
        toast.error('접근 권한이 없습니다.')
        break
      }

      case 404: {
        // Not Found
        toast.error('요청한 리소스를 찾을 수 없습니다.')
        break
      }

      case 400: {
        // Bad Request - 잘못된 요청
        const message = data?.message || '잘못된 요청입니다.'
        toast.error(message)
        break
      }

      case 500: {
        // Internal Server Error
        toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
        break
      }

      default: {
        // 기타 에러
        const message = data?.message || '오류가 발생했습니다.'
        toast.error(message)
      }
    }

    return Promise.reject(error)
  }
)

// ===== 헬퍼 함수 =====

/**
 * API 에러 메시지 추출
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ErrorResponse>
    return axiosError.response?.data?.message || '오류가 발생했습니다.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return '알 수 없는 오류가 발생했습니다.'
}

/**
 * API 에러인지 확인
 */
export function isApiError(error: unknown): error is AxiosError<ErrorResponse> {
  return axios.isAxiosError(error)
}

/**
 * 특정 상태 코드인지 확인
 */
export function hasStatusCode(error: unknown, statusCode: number): boolean {
  return isApiError(error) && error.response?.status === statusCode
}
