import { useState } from 'react'
import type { Portfolio } from '@/shared/types/api'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  Calendar,
  User,
} from 'lucide-react'
import { toast } from 'sonner'

interface PortfolioCardProps {
  portfolio: Portfolio
}

export function PortfolioCard({ portfolio }: PortfolioCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleEdit = () => {
    // TODO: Phase 5 - 포트폴리오 수정 Dialog 열기
    toast.info('포트폴리오 수정 기능은 곧 구현됩니다.')
  }

  const handleDelete = async () => {
    if (
      !confirm(`"${portfolio.projectName}" 포트폴리오를 정말 삭제하시겠습니까?`)
    ) {
      return
    }

    setIsLoading(true)
    try {
      // TODO: API 연동
      toast.success('포트폴리오가 삭제되었습니다.')
    } catch (_error) {
      toast.error('포트폴리오 삭제에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async () => {
    const action = portfolio.isActive ? '비활성화' : '활성화'

    setIsLoading(true)
    try {
      // TODO: API 연동
      toast.success(`포트폴리오가 ${action}되었습니다.`)
    } catch (_error) {
      toast.error(`포트폴리오 ${action}에 실패했습니다.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className='overflow-hidden'>
      {/* 이미지 썸네일 */}
      <div className='bg-muted relative aspect-video w-full overflow-hidden'>
        <img
          src={portfolio.images[0]}
          alt={portfolio.projectName}
          className='size-full object-cover transition-transform hover:scale-105'
        />
        <div className='absolute top-2 right-2'>
          <Badge variant={portfolio.isActive ? 'default' : 'secondary'}>
            {portfolio.isActive ? '활성' : '비활성'}
          </Badge>
        </div>
      </div>

      {/* 카드 헤더 */}
      <CardHeader className='space-y-2'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <Badge variant='outline' className='mb-2'>
              {portfolio.category}
            </Badge>
            <h3 className='line-clamp-1 text-lg font-semibold'>
              {portfolio.projectName}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='size-8 p-0'
                disabled={isLoading}
              >
                <MoreHorizontal className='size-4' />
                <span className='sr-only'>메뉴 열기</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className='mr-2 size-4' />
                수정
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive}>
                <Eye className='mr-2 size-4' />
                {portfolio.isActive ? '비활성화' : '활성화'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-destructive'
              >
                <Trash2 className='mr-2 size-4' />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* 카드 내용 */}
      <CardContent className='space-y-3'>
        <p className='text-muted-foreground line-clamp-2 text-sm'>
          {portfolio.shortDescription}
        </p>

        <div className='text-muted-foreground flex items-center gap-4 text-sm'>
          <div className='flex items-center gap-1'>
            <User className='size-4' />
            <span>{portfolio.clientName}</span>
          </div>
          <div className='flex items-center gap-1'>
            <Calendar className='size-4' />
            <span>{portfolio.duration}</span>
          </div>
        </div>

        {portfolio.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {portfolio.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant='secondary' className='text-xs'>
                {tag}
              </Badge>
            ))}
            {portfolio.tags.length > 3 && (
              <Badge variant='secondary' className='text-xs'>
                +{portfolio.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      {/* 카드 푸터 */}
      <CardFooter className='text-muted-foreground text-xs'>
        {portfolio.images.length}개의 이미지
      </CardFooter>
    </Card>
  )
}
