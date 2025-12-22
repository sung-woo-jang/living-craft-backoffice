import type { CuttingPiece, CuttingPieceInput } from '@/shared/types/api'
import { useFilmCuttingForm } from '../../model'
import { BulkInputDialog } from '../bulk-input-dialog'
import { CreateFilmDialog } from '../create-film-dialog'

/**
 * 필름 재단 폼 다이얼로그 조합
 * - BulkInputDialog: 일괄 입력
 * - CreateFilmDialog: 새 필름 생성
 */
export function FilmCuttingFormDialogs() {
  const { open, setOpen, localPieces, addPieces, setSelectedFilmId } =
    useFilmCuttingForm([
      'open',
      'setOpen',
      'localPieces',
      'addPieces',
      'setSelectedFilmId',
    ])

  // 일괄 추가 핸들러
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
    addPieces(newPieces)
    setOpen(null)
  }

  // 필름 생성 성공 핸들러
  const handleFilmSuccess = (filmId: number) => {
    setSelectedFilmId(filmId.toString())
    setOpen(null)
  }

  return (
    <>
      <BulkInputDialog
        open={open === 'bulkInput'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'bulkInput' : null)}
        onAdd={handleBulkAdd}
      />

      <CreateFilmDialog
        open={open === 'createFilm'}
        onOpenChange={(isOpen) => setOpen(isOpen ? 'createFilm' : null)}
        onSuccess={handleFilmSuccess}
      />
    </>
  )
}
