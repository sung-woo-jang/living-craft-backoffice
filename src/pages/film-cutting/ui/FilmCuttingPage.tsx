import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  useCuttingProjectsList,
  useDeleteCuttingProject,
} from '@/features/film-optimizer/api'
import styles from './FilmCuttingPage.module.scss'

/**
 * 필름 재단 최적화 목록 페이지
 */
export function FilmCuttingPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useCuttingProjectsList()
  const deleteProject = useDeleteCuttingProject()

  const handleCreateProject = () => {
    navigate('/film-cutting/new')
  }

  const handleEditProject = (projectId: number) => {
    navigate(`/film-cutting/${projectId}`)
  }

  const handleDeleteProject = async (projectId: number) => {
    try {
      await deleteProject.mutateAsync(projectId)
    } catch {
      // 에러는 mutation hook에서 toast로 처리
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>필름 재단 최적화</h1>
          <p className={styles.description}>
            인테리어 필름 재단 시 손실율을 최소화하는 배치를 계산합니다.
          </p>
        </div>
        <Button onClick={handleCreateProject}>
          <Plus className='h-4 w-4' />새 프로젝트
        </Button>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>프로젝트를 불러오는 중...</p>
        </div>
      )}

      {error && (
        <div className={styles.error}>
          <p>프로젝트를 불러오는데 실패했습니다.</p>
        </div>
      )}

      {!isLoading &&
        !error &&
        data?.data &&
        (data.data as unknown as Array<unknown>).length > 0 && (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>프로젝트명</th>
                  <th>필름</th>
                  <th className={styles.thCenter}>조각 수</th>
                  <th className={styles.thCenter}>진행률</th>
                  <th className={styles.thCenter}>손실율</th>
                  <th className={styles.thCenter}>사용 길이</th>
                  <th>생성일</th>
                  <th className={styles.thCenter}>작업</th>
                </tr>
              </thead>
              <tbody>
                {(
                  data.data as unknown as Array<{
                    id: number
                    name: string
                    filmName: string
                    filmWidth: number
                    pieceCount: number
                    completedPieceCount: number
                    wastePercentage: number | null
                    usedLength: number | null
                    createdAt: string
                  }>
                ).map((project) => {
                  const progressRate =
                    project.pieceCount > 0
                      ? Math.round(
                          (project.completedPieceCount / project.pieceCount) *
                            100
                        )
                      : 0

                  return (
                    <tr key={project.id}>
                      <td>
                        <button
                          className={styles.projectName}
                          onClick={() => handleEditProject(project.id)}
                        >
                          {project.name}
                        </button>
                      </td>
                      <td>
                        {project.filmName} ({project.filmWidth}mm)
                      </td>
                      <td className={styles.tdCenter}>
                        {project.pieceCount}개
                      </td>
                      <td className={styles.tdCenter}>
                        <span
                          className={`${styles.progressBadge} ${progressRate === 100 ? styles.progressComplete : ''}`}
                        >
                          {project.completedPieceCount}/{project.pieceCount} (
                          {progressRate}%)
                        </span>
                      </td>
                      <td className={styles.tdCenter}>
                        {project.wastePercentage !== null
                          ? `${project.wastePercentage.toFixed(1)}%`
                          : '-'}
                      </td>
                      <td className={styles.tdCenter}>
                        {project.usedLength !== null
                          ? `${project.usedLength}mm`
                          : '-'}
                      </td>
                      <td>
                        {new Date(project.createdAt).toLocaleDateString(
                          'ko-KR'
                        )}
                      </td>
                      <td className={styles.tdCenter}>
                        <div className={styles.actions}>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleEditProject(project.id)}
                            title='수정'
                          >
                            <Pencil className='h-4 w-4' />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='ghost'
                                size='icon'
                                className={styles.deleteButton}
                                title='삭제'
                              >
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  프로젝트 삭제
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  "{project.name}" 프로젝트를 삭제하시겠습니까?
                                  <br />이 작업은 되돌릴 수 없습니다.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>취소</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteProject(project.id)
                                  }
                                >
                                  삭제
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      {!isLoading &&
        !error &&
        (!data?.data ||
          (data.data as unknown as Array<unknown>).length === 0) && (
          <div className={styles.empty}>
            <p>등록된 프로젝트가 없습니다.</p>
            <Button variant='outline' onClick={handleCreateProject}>
              <Plus className='h-4 w-4' />첫 프로젝트 만들기
            </Button>
          </div>
        )}
    </div>
  )
}
