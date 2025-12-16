import { useRef, useState, useMemo, useEffect, startTransition } from 'react'
import type { CuttingPiece, CuttingPieceInput } from '@/shared/types/api'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { List, Plus } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useFilmsList,
  useCuttingProjectDetail,
  useCreateCuttingProject,
  useUpdateCuttingProject,
  useAddPieces,
  useDeletePiece,
  useTogglePieceComplete,
} from '@/features/film-optimizer/api'
import { useBinPacker } from '@/features/film-optimizer/model'
import {
  CuttingCanvas,
  PiecesInput,
  PiecesTable,
  BulkInputDialog,
  ExportButtons,
  CreateFilmDialog,
  type CuttingCanvasRef,
} from '@/features/film-optimizer/ui'
import styles from './FilmCuttingFormPage.module.scss'

/**
 * 필름 재단 프로젝트 생성/수정 페이지
 */
export function FilmCuttingFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  const canvasRef = useRef<CuttingCanvasRef | null>(null)

  // 상태
  const [projectName, setProjectName] = useState('')
  const [selectedFilmId, setSelectedFilmId] = useState<string>('')
  const [allowRotation, setAllowRotation] = useState(true)
  const [bulkInputOpen, setBulkInputOpen] = useState(false)
  const [createFilmDialogOpen, setCreateFilmDialogOpen] = useState(false)
  const [localPieces, setLocalPieces] = useState<CuttingPiece[]>([])

  // 쿼리
  const { data: films, isLoading: filmsLoading } = useFilmsList()
  const { data: projectDetail, isLoading: projectLoading } =
    useCuttingProjectDetail(id)

  // 뮤테이션
  const createProject = useCreateCuttingProject()
  const updateProject = useUpdateCuttingProject()
  const addPieces = useAddPieces()
  const deletePiece = useDeletePiece()
  const toggleComplete = useTogglePieceComplete()

  // 선택된 필름 정보
  const selectedFilm = useMemo(() => {
    if (!films?.data) return undefined
    const filmList = films.data as unknown as Array<{
      id: number
      name: string
      width: number
      length: number
    }>
    return filmList.find((f) => f.id.toString() === selectedFilmId)
  }, [films, selectedFilmId])

  // 프로젝트 데이터 로드 시 상태 초기화
  useEffect(() => {
    if (projectDetail?.data) {
      const detail = projectDetail.data as unknown as {
        name: string
        filmId: number
        allowRotation: boolean
        pieces: CuttingPiece[]
      }
      startTransition(() => {
        setProjectName(detail.name)
        setSelectedFilmId(detail.filmId.toString())
        setAllowRotation(detail.allowRotation)
        setLocalPieces(detail.pieces)
      })
    }
  }, [projectDetail])

  // 패킹 계산 (로컬 조각 또는 서버 조각 사용)
  const piecesForPacking = isEditMode ? localPieces : localPieces
  const { packingResult, wastePercentage, usedLength } = useBinPacker(
    piecesForPacking,
    {
      filmWidth: selectedFilm?.width ?? 1220,
      filmMaxLength: selectedFilm?.length ?? 60000,
      allowRotation,
    }
  )

  // 완료된 조각 ID 목록
  const completedPieceIds = useMemo(
    () => piecesForPacking.filter((p) => p.isCompleted).map((p) => p.id),
    [piecesForPacking]
  )

  // 조각 추가 (로컬)
  const handleAddPiece = (piece: CuttingPieceInput) => {
    const newPiece: CuttingPiece = {
      id: Date.now(), // 임시 ID
      width: piece.width,
      height: piece.height,
      quantity: piece.quantity ?? 1,
      label: piece.label ?? null,
      sortOrder: localPieces.length,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setLocalPieces((prev) => [...prev, newPiece])
  }

  // 일괄 추가 (로컬)
  const handleBulkAdd = (pieces: CuttingPieceInput[]) => {
    const newPieces: CuttingPiece[] = pieces.map((piece, index) => ({
      id: Date.now() + index,
      width: piece.width,
      height: piece.height,
      quantity: piece.quantity ?? 1,
      label: piece.label ?? null,
      sortOrder: localPieces.length + index,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
    setLocalPieces((prev) => [...prev, ...newPieces])
  }

  // 조각 삭제
  const handleDeletePiece = async (pieceId: number) => {
    if (isEditMode && id) {
      try {
        await deletePiece.mutateAsync({ projectId: id, pieceId })
        setLocalPieces((prev) => prev.filter((p) => p.id !== pieceId))
      } catch {
        // 에러는 mutation hook에서 처리
      }
    } else {
      setLocalPieces((prev) => prev.filter((p) => p.id !== pieceId))
    }
  }

  // 완료 토글
  const handleToggleComplete = async (pieceId: number) => {
    if (isEditMode && id) {
      try {
        await toggleComplete.mutateAsync({ projectId: id, pieceId })
        setLocalPieces((prev) =>
          prev.map((p) =>
            p.id === pieceId ? { ...p, isCompleted: !p.isCompleted } : p
          )
        )
      } catch {
        // 에러는 mutation hook에서 처리
      }
    } else {
      setLocalPieces((prev) =>
        prev.map((p) =>
          p.id === pieceId ? { ...p, isCompleted: !p.isCompleted } : p
        )
      )
    }
  }

  // 저장
  const handleSave = async () => {
    if (!projectName.trim()) {
      return
    }
    if (!selectedFilmId) {
      return
    }

    try {
      if (isEditMode && id) {
        // 수정 모드: 프로젝트 정보 + 패킹 결과 업데이트
        await updateProject.mutateAsync({
          id,
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
        // 생성 모드: 프로젝트 생성 후 조각 추가
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

  const isPending =
    createProject.isPending || updateProject.isPending || addPieces.isPending

  const isLoading = filmsLoading || (isEditMode && projectLoading)

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <p>데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* 헤더 */}
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
          <Button variant='outline' onClick={handleCancel} disabled={isPending}>
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

      {/* 본문 */}
      <div className={styles.content}>
        {/* 왼쪽: 설정 및 입력 */}
        <div className={styles.leftPanel}>
          {/* 프로젝트 설정 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>프로젝트 설정</h3>

            <div className={styles.formGroup}>
              <Label htmlFor='projectName'>프로젝트명 *</Label>
              <Input
                id='projectName'
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder='예: 거실 리모델링'
              />
            </div>

            <div className={styles.formGroup}>
              <Label htmlFor='film'>필름 선택 *</Label>
              <div className={styles.filmSelectRow}>
                <Select
                  value={selectedFilmId}
                  onValueChange={setSelectedFilmId}
                >
                  <SelectTrigger className={styles.filmSelect}>
                    <SelectValue placeholder='필름을 선택하세요' />
                  </SelectTrigger>
                  <SelectContent>
                    {(
                      films?.data as unknown as Array<{
                        id: number
                        name: string
                        width: number
                        length: number
                      }>
                    )?.map((film) => (
                      <SelectItem key={film.id} value={film.id.toString()}>
                        {film.name} ({film.width}mm × {film.length}mm)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setCreateFilmDialogOpen(true)}
                  disabled={isPending}
                  className={styles.addFilmButton}
                >
                  <Plus className='h-4 w-4' />새 필름
                </Button>
              </div>
            </div>

            <div className={styles.switchGroup}>
              <div className={styles.switchInfo}>
                <Label htmlFor='allowRotation'>회전 허용</Label>
                <p className={styles.switchDescription}>
                  조각을 90도 회전하여 배치할 수 있습니다
                </p>
              </div>
              <Switch
                id='allowRotation'
                checked={allowRotation}
                onCheckedChange={setAllowRotation}
              />
            </div>
          </div>

          {/* 조각 입력 */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>조각 추가</h3>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setBulkInputOpen(true)}
              >
                <List className='h-4 w-4' />
                일괄 입력
              </Button>
            </div>

            <PiecesInput
              onAdd={handleAddPiece}
              filmWidth={selectedFilm?.width ?? 1220}
              disabled={!selectedFilm}
            />
          </div>

          {/* 조각 목록 */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>조각 목록</h3>
            <PiecesTable
              pieces={piecesForPacking}
              onDelete={handleDeletePiece}
              onToggleComplete={handleToggleComplete}
              deletingId={deletePiece.isPending ? undefined : null}
              togglingId={toggleComplete.isPending ? undefined : null}
            />
          </div>
        </div>

        {/* 오른쪽: 시각화 */}
        <div className={styles.rightPanel}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>재단 배치도</h3>
              <ExportButtons
                canvasRef={canvasRef}
                projectName={projectName || '재단배치'}
                filmName={selectedFilm?.name}
                wastePercentage={wastePercentage}
                usedLength={usedLength}
                disabled={!packingResult}
              />
            </div>

            {/* 통계 */}
            {packingResult && (
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>사용 길이</span>
                  <span className={styles.statValue}>{usedLength}mm</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>손실율</span>
                  <span
                    className={`${styles.statValue} ${wastePercentage > 20 ? styles.statWarning : ''}`}
                  >
                    {wastePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>총 조각 면적</span>
                  <span className={styles.statValue}>
                    {(packingResult.totalPieceArea / 1000000).toFixed(2)}m²
                  </span>
                </div>
              </div>
            )}

            {/* 캔버스 */}
            <CuttingCanvas
              ref={canvasRef}
              packingResult={packingResult}
              filmWidth={selectedFilm?.width ?? 1220}
              scale={0.6}
              completedPieceIds={completedPieceIds}
              onPieceClick={(pieceId) => {
                // 조각 클릭 시 완료 토글
                handleToggleComplete(pieceId)
              }}
            />
          </div>
        </div>
      </div>

      {/* 일괄 입력 다이얼로그 */}
      <BulkInputDialog
        open={bulkInputOpen}
        onOpenChange={setBulkInputOpen}
        onAdd={handleBulkAdd}
      />

      {/* 필름 생성 다이얼로그 */}
      <CreateFilmDialog
        open={createFilmDialogOpen}
        onOpenChange={setCreateFilmDialogOpen}
        onSuccess={(filmId) => {
          setSelectedFilmId(filmId.toString())
        }}
      />
    </div>
  )
}
