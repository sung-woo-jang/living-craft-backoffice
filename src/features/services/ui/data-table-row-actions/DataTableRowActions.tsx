import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import type { Service } from '@/shared/types/api'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface DataTableRowActionsProps {
  row: Row<Service>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const service = row.original
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    // TODO: Phase 4 - 서비스 수정 Drawer 열기
    toast.info('서비스 수정 기능은 곧 구현됩니다.')
  }

  const handleDelete = async () => {
    if (!confirm(`"${service.title}" 서비스를 정말 삭제하시겠습니까?`)) {
      return
    }

    setIsLoading(true)
    try {
      // TODO: API 연동
      toast.success('서비스가 삭제되었습니다.')
    } catch (_error) {
      toast.error('서비스 삭제에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async () => {
    const action = service.isActive ? '비활성화' : '활성화'

    setIsLoading(true)
    try {
      // TODO: API 연동
      toast.success(`서비스가 ${action}되었습니다.`)
    } catch (_error) {
      toast.error(`서비스 ${action}에 실패했습니다.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex size-8 p-0'
          disabled={isLoading}
        >
          <MoreHorizontal className='size-4' />
          <span className='sr-only'>메뉴 열기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-40'>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className='mr-2 size-4' />
          수정
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleActive}>
          <Eye className='mr-2 size-4' />
          {service.isActive ? '비활성화' : '활성화'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className='text-destructive'>
          <Trash2 className='mr-2 size-4' />
          삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
