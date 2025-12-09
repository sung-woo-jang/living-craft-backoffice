import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import { Switch } from '@/shared/ui/switch'
import type { Service, CreateServiceRequest } from '@/shared/types/api'
import { useCreateService, useUpdateService } from '../../api/use-services-mutation'
import { RegionFeeSelector } from '../region-fee-selector/RegionFeeSelector'

interface ServiceFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service
}

const serviceFormSchema = z.object({
  title: z.string().min(1, '서비스명을 입력하세요').max(100, '서비스명은 100자 이내로 입력하세요'),
  description: z.string().min(1, '설명을 입력하세요'),
  iconName: z.string().min(1, '아이콘 이름을 입력하세요'),
  iconBgColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '올바른 색상 코드를 입력하세요 (예: #3B82F6)'),
  duration: z.string().min(1, '소요 시간을 입력하세요'),
  requiresTimeSelection: z.boolean(),
  sortOrder: z.number().min(0, '정렬 순서는 0 이상이어야 합니다').optional(),
  regions: z
    .array(
      z.object({
        districtId: z.number(),
        estimateFee: z.number().min(0, '출장비는 0 이상이어야 합니다'),
      })
    )
    .min(1, '최소 1개 이상의 지역을 선택해야 합니다'),
})

type ServiceFormValues = z.infer<typeof serviceFormSchema>

export function ServiceFormDrawer({
  open,
  onOpenChange,
  service,
}: ServiceFormDrawerProps) {
  const isEditMode = Boolean(service)
  const createService = useCreateService()
  const updateService = useUpdateService()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      title: '',
      description: '',
      iconName: '',
      iconBgColor: '#3B82F6',
      duration: '',
      requiresTimeSelection: false,
      sortOrder: 0,
      regions: [],
    },
  })

  // 수정 모드일 때 기존 데이터 로드
  useEffect(() => {
    if (service && open) {
      reset({
        title: service.title,
        description: service.description,
        iconName: service.iconName,
        iconBgColor: service.iconBgColor,
        duration: service.duration,
        requiresTimeSelection: service.requiresTimeSelection,
        sortOrder: service.sortOrder,
        regions: service.serviceableRegions.map((region) => ({
          districtId: parseInt(region.id),
          estimateFee: region.estimateFee,
        })),
      })
    } else if (!open) {
      // Drawer 닫힐 때 초기화
      reset()
    }
  }, [service, open, reset])

  const regions = watch('regions')
  const iconBgColor = watch('iconBgColor')
  const requiresTimeSelection = watch('requiresTimeSelection')

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      if (isEditMode && service) {
        await updateService.mutateAsync({
          id: service.id,
          data,
        })
      } else {
        await createService.mutateAsync(data as CreateServiceRequest)
      }
      onOpenChange(false)
    } catch (error) {
      console.error('서비스 저장 실패:', error)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='overflow-y-auto sm:max-w-[540px]'>
        <SheetHeader>
          <SheetTitle>{isEditMode ? '서비스 수정' : '서비스 추가'}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? '서비스 정보를 수정합니다.'
              : '새로운 서비스를 추가합니다.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 py-6'>
          {/* 기본 정보 */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>기본 정보</h3>

            <div className='grid gap-2'>
              <Label htmlFor='title'>
                서비스명 <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='title'
                {...register('title')}
                placeholder='인테리어 필름'
              />
              {errors.title && (
                <p className='text-destructive text-sm'>{errors.title.message}</p>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='description'>
                설명 <span className='text-destructive'>*</span>
              </Label>
              <Textarea
                id='description'
                {...register('description')}
                placeholder='서비스에 대한 간단한 설명을 입력하세요'
                rows={3}
              />
              {errors.description && (
                <p className='text-destructive text-sm'>
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>

          {/* 아이콘 설정 */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>아이콘 설정</h3>

            <div className='grid gap-2'>
              <Label htmlFor='iconName'>
                아이콘 이름 <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='iconName'
                {...register('iconName')}
                placeholder='Paintbrush'
              />
              {errors.iconName && (
                <p className='text-destructive text-sm'>{errors.iconName.message}</p>
              )}
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='iconBgColor'>
                배경색 <span className='text-destructive'>*</span>
              </Label>
              <div className='flex gap-2'>
                <Input
                  id='iconBgColor'
                  {...register('iconBgColor')}
                  placeholder='#3B82F6'
                />
                <div
                  className='h-10 w-10 flex-shrink-0 rounded-md border'
                  style={{ backgroundColor: iconBgColor }}
                />
              </div>
              {errors.iconBgColor && (
                <p className='text-destructive text-sm'>
                  {errors.iconBgColor.message}
                </p>
              )}
            </div>
          </div>

          {/* 작업 시간 설정 */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>작업 시간 설정</h3>

            <div className='grid gap-2'>
              <Label htmlFor='duration'>
                소요 시간 <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='duration'
                {...register('duration')}
                placeholder='2-3시간'
              />
              {errors.duration && (
                <p className='text-destructive text-sm'>{errors.duration.message}</p>
              )}
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label htmlFor='requiresTimeSelection'>시간 선택 필요</Label>
                <p className='text-muted-foreground text-sm'>
                  고객이 작업 시간대를 선택해야 하는지 설정합니다
                </p>
              </div>
              <Switch
                id='requiresTimeSelection'
                checked={requiresTimeSelection}
                onCheckedChange={(checked) =>
                  setValue('requiresTimeSelection', checked)
                }
              />
            </div>

            <div className='grid gap-2'>
              <Label htmlFor='sortOrder'>정렬 순서</Label>
              <Input
                id='sortOrder'
                type='number'
                {...register('sortOrder', { valueAsNumber: true })}
                placeholder='0'
                min='0'
              />
              {errors.sortOrder && (
                <p className='text-destructive text-sm'>{errors.sortOrder.message}</p>
              )}
            </div>
          </div>

          {/* 지역별 출장비 설정 */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold'>
              지역별 출장비 설정 <span className='text-destructive'>*</span>
            </h3>
            <RegionFeeSelector
              value={regions}
              onChange={(value) => setValue('regions', value)}
            />
            {errors.regions && (
              <p className='text-destructive text-sm'>{errors.regions.message}</p>
            )}
          </div>

          <SheetFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              취소
            </Button>
            <Button
              type='submit'
              disabled={createService.isPending || updateService.isPending}
            >
              {createService.isPending || updateService.isPending
                ? '저장 중...'
                : isEditMode
                  ? '수정'
                  : '추가'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
