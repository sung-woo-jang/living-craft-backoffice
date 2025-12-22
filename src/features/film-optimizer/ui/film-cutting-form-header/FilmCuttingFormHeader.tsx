import { useNavigate } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { useFilmsList, useCreateCuttingProject, useUpdateCuttingProject } from '../../api'
import { useFilmCuttingForm, useBinPacker } from '../../model'
import styles from './styles.module.scss'

/**
 * 필름 재단 폼 헤더
 * - 제목, 설명
 * - 취소, 저장 버튼
 */
export function FilmCuttingFormHeader() {
  const navigate = useNavigate()

  const {
    editingProjectId,
    projectName,
    selectedFilmId,
    allowRotation,
    localPieces,
  } = useFilmCuttingForm([
    'editingProjectId',
    'projectName',
    'selectedFilmId',
    'allowRotation',
    'localPieces',
  ])

  const isEditMode = Boolean(editingProjectId)

  // 필름 정보
  const { data: filmsList } = useFilmsList()
  const selectedFilm = filmsList?.find(
    (f) => f.id.toString() === selectedFilmId
  )

  // 패킹 결과
  const { packingResult } = useBinPacker(localPieces, {
    filmWidth: selectedFilm?.width ?? 1220,
    filmMaxLength: selectedFilm?.length ?? 60000,
    allowRotation,
  })

  // 뮤테이션
  const createProject = useCreateCuttingProject()
  const updateProject = useUpdateCuttingProject()

  const isPending = createProject.isPending || updateProject.isPending

  const handleSave = async () => {
    if (!projectName.trim() || !selectedFilmId) {
      return
    }

    try {
      if (isEditMode && editingProjectId) {
        // 수정 모드
        await updateProject.mutateAsync({
          id: editingProjectId,
          data: {
            name: projectName,
            filmId: parseInt(selectedFilmId, 10),
            allowRotation,
            wastePercentage: packingResult?.wastePercentage,
            usedLength: packingResult?.usedLength,
            packingResult: packingResult ?? undefined,
          },
        })
      } else {
        // 생성 모드
        const result = await createProject.mutateAsync({
          name: projectName,
          filmId: parseInt(selectedFilmId, 10),
          allowRotation,
          pieces: localPieces.map((p) => ({
            width: p.width,
            height: p.height,
            quantity: p.quantity,
            label: p.label ?? undefined,
          })),
        })

        // 생성된 프로젝트로 이동
        navigate(`/film-cutting/${result.data.id}`)
        return
      }

      navigate('/film-cutting')
    } catch {
      // 에러는 mutation hook에서 처리
    }
  }

  const handleCancel = () => {
    navigate('/film-cutting')
  }

  return (
    <div className={styles.header}>
      <div className={styles.headerInfo}>
        <h1 className={styles.title}>
          {isEditMode ? '재단 프로젝트 수정' : '새 재단 프로젝트'}
        </h1>
        <p className={styles.description}>
          {isEditMode
            ? '프로젝트를 수정하고 재단 배치를 확인합니다.'
            : '재단할 조각을 입력하면 최적 배치를 계산합니다.'}
        </p>
      </div>
      <div className={styles.headerActions}>
        <Button variant="outline" onClick={handleCancel} disabled={isPending}>
          취소
        </Button>
        <Button
          onClick={handleSave}
          disabled={isPending || !projectName || !selectedFilmId}
        >
          {isPending ? '저장 중...' : '저장'}
        </Button>
      </div>
    </div>
  )
}
