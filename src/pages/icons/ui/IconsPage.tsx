import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { useFetchIconsList } from '@/features/icons/api'
import { IconsTable, IconDialog } from '@/features/icons/ui'
import type { IconAdminListItem } from '@/shared/types/api'
import styles from './IconsPage.module.scss'

/**
 * 아이콘 관리 페이지
 */
export function IconsPage() {
  const { data: iconsData, isLoading, error } = useFetchIconsList()
  const data = iconsData?.data

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [selectedIcon, setSelectedIcon] = useState<IconAdminListItem>()

  const handleCreateIcon = () => {
    setDialogMode('create')
    setSelectedIcon(undefined)
    setDialogOpen(true)
  }

  const handleRowClick = (icon: IconAdminListItem) => {
    setDialogMode('edit')
    setSelectedIcon(icon)
    setDialogOpen(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>아이콘 관리</h1>
          <p className={styles.description}>
            서비스 및 프로모션에서 사용되는 아이콘을 관리합니다.
          </p>
        </div>
        <Button onClick={handleCreateIcon}>
          <Plus className='mr-2 size-4' />
          아이콘 추가
        </Button>
      </div>

      {isLoading && (
        <div className={styles.centerMessage}>
          <div className='text-center'>
            <div className={styles.spinner}></div>
            <p className='text-muted-foreground'>아이콘을 불러오는 중...</p>
          </div>
        </div>
      )}

      {error && (
        <div className={styles.centerMessage}>
          <p className='text-destructive'>아이콘을 불러오는데 실패했습니다.</p>
        </div>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <IconsTable data={data} onRowClick={handleRowClick} />
      )}

      <IconDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        icon={selectedIcon}
        mode={dialogMode}
      />
    </div>
  )
}
