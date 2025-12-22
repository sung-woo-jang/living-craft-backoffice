import { useEffect, type ReactNode } from 'react'
import { startTransition } from 'react'
import { useParams } from 'react-router-dom'
import { useCuttingProjectDetail } from '../../api'
import { useFilmCuttingForm } from '../../model'

interface FilmCuttingFormProviderProps {
  children: ReactNode
}

/**
 * 필름 재단 폼 Provider
 * - 편집 모드 설정
 * - 프로젝트 데이터 초기화
 * - cleanup 시 상태 리셋
 */
export function FilmCuttingFormProvider({
  children,
}: FilmCuttingFormProviderProps) {
  const { id } = useParams<{ id: string }>()
  const { setEditingProjectId, initFromProjectDetail, reset } =
    useFilmCuttingForm([
      'setEditingProjectId',
      'initFromProjectDetail',
      'reset',
    ])

  // 프로젝트 상세 데이터 로드
  const { data: projectDetail } = useCuttingProjectDetail(id)

  // 편집 모드 설정 및 cleanup
  useEffect(() => {
    setEditingProjectId(id ?? null)
    return () => reset()
  }, [id, setEditingProjectId, reset])

  // 프로젝트 데이터 초기화
  useEffect(() => {
    if (projectDetail?.data) {
      startTransition(() => {
        initFromProjectDetail(projectDetail.data)
      })
    }
  }, [projectDetail, initFromProjectDetail])

  return <>{children}</>
}
