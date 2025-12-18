import { axiosInstance, ADMIN_API } from '@/shared/api'
import { useStandardQuery } from '@/shared/hooks/custom-query'
import { generateQueryKeysFromUrl, createQueryString } from '@/shared/lib'
import type { District, DistrictLevel } from '@/shared/types/api'

interface UseDistrictsParams extends Record<string, unknown> {
  level?: DistrictLevel
  parentId?: number
}

export function useDistricts(params?: UseDistrictsParams) {
  const queryString = createQueryString(params)
  const url = ADMIN_API.DISTRICTS.LIST + queryString

  return useStandardQuery<District[]>({
    queryKey: generateQueryKeysFromUrl(url),
    queryFn: async () => {
      const { data } = await axiosInstance.get<District[]>(url)
      return data
    },
  })
}
