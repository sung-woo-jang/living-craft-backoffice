import { useState } from 'react'
import type { Service } from '@/shared/types/api'
import { Button } from '@/shared/ui/button'
import { Plus } from 'lucide-react'
import { useServicesList } from '@/features/services/api/use-services-query'
import { ServiceFormModal } from '@/features/services/ui/service-form-modal'
import { ServicesTable } from '@/features/services/ui/services-table'

/**
 * 서비스 관리 페이지
 */
export function ServicesPage() {
  const { data, isLoading, error } = useServicesList()
  const [formOpen, setFormOpen] = useState(false)
  const [editService, setEditService] = useState<Service | undefined>(undefined)

  const handleCreateService = () => {
    setEditService(undefined)
    setFormOpen(true)
  }

  const handleEditService = (service: Service) => {
    setEditService(service)
    setFormOpen(true)
  }

  return (
    <div className='flex h-full flex-col gap-4 p-4 md:gap-8 md:p-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>서비스 관리</h1>
          <p className='text-muted-foreground mt-2'>
            제공하는 서비스를 관리하고 지역별 출장비를 설정합니다.
          </p>
        </div>
        <Button onClick={handleCreateService}>
          <Plus className='mr-2 size-4' />
          서비스 추가
        </Button>
      </div>

      {isLoading && (
        <div className='flex h-[400px] items-center justify-center'>
          <div className='text-center'>
            <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent'></div>
            <p className='text-muted-foreground'>서비스를 불러오는 중...</p>
          </div>
        </div>
      )}

      {error && (
        <div className='flex h-[400px] items-center justify-center'>
          <p className='text-destructive'>서비스를 불러오는데 실패했습니다.</p>
        </div>
      )}

      {!isLoading &&
        !error &&
        data &&
        Array.isArray(data) &&
        data.length > 0 && (
          <ServicesTable data={data} onEdit={handleEditService} />
        )}

      {!isLoading &&
        !error &&
        (!data || !Array.isArray(data) || data.length === 0) && (
          <div className='flex h-[400px] items-center justify-center'>
            <p className='text-muted-foreground'>등록된 서비스가 없습니다.</p>
          </div>
        )}

      <ServiceFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        service={editService}
      />
    </div>
  )
}
