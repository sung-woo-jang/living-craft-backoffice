import { useEffect, useState } from 'react'
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { CreateServiceRequest, Service } from '@/shared/types/api'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import {
  useCreateService,
  useUpdateService,
} from '../../api/use-services-mutation'
import { useIconsList } from '../../api/use-icons-query'
import { RegionFeeSelector } from '../region-fee-selector/RegionFeeSelector'
import styles from './styles.module.scss'

interface ServiceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service
}

const serviceFormSchema = z.object({
  title: z
    .string()
    .min(1, '서비스명을 입력하세요')
    .max(100, '서비스명은 100자 이내로 입력하세요'),
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

export function ServiceFormModal({
  open,
  onOpenChange,
  service,
}: ServiceFormModalProps) {
  const isEditMode = Boolean(service)
  const createService = useCreateService()
  const updateService = useUpdateService()

  // 아이콘 Combobox 상태
  const [iconPopoverOpen, setIconPopoverOpen] = useState(false)
  const { data: icons = [], isLoading: iconsLoading } = useIconsList()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    control,
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
      // serviceableRegions 계층 구조를 평면화하여 regions 배열 생성
      // serviceableRegions는 시/도 레벨, cities는 시/군/구 레벨
      // DB에는 시/군/구(SIGUNGU) 레벨만 저장되므로 cities를 평면화해야 함
      const flattenedRegions = service.serviceableRegions.flatMap((region) =>
        region.cities.map((city) => ({
          districtId: parseInt(city.id),
          // 시/군/구별 개별 출장비가 있으면 사용, 없으면 시/도 기본 출장비 사용
          estimateFee: city.estimateFee ?? region.estimateFee,
        }))
      )

      reset({
        title: service.title,
        description: service.description,
        iconName: service.iconName,
        iconBgColor: service.iconBgColor,
        duration: service.duration,
        requiresTimeSelection: service.requiresTimeSelection,
        sortOrder: service.sortOrder,
        regions: flattenedRegions,
      })
    } else if (!open) {
      reset()
    }
  }, [service, open, reset])

  const regions = watch('regions')
  const iconBgColor = watch('iconBgColor')

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
    } catch {
      // 에러는 mutation hook에서 toast로 처리
    }
  }

  const isPending = createService.isPending || updateService.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={styles.modalContent}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? '서비스 수정' : '새 서비스 추가'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? '서비스 정보를 수정합니다.'
              : '새로운 서비스를 추가합니다. 필수 항목을 모두 입력해주세요.'}
          </DialogDescription>
        </DialogHeader>

        <div className={styles.modalBody}>
          <form
            id='service-form'
            onSubmit={handleSubmit(onSubmit)}
            className={styles.form}
          >
            {/* 기본 정보 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>기본 정보</h3>

              <FieldGroup>
                <Controller
                  name='title'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='title'>
                        서비스명 <span className={styles.labelRequired}>*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        id='title'
                        placeholder='예: 인테리어 필름'
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name='description'
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor='description'>
                        설명 <span className={styles.labelRequired}>*</span>
                      </FieldLabel>
                      <Textarea
                        {...field}
                        id='description'
                        placeholder='서비스에 대한 간단한 설명을 입력하세요'
                        rows={3}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {/* 아이콘 설정 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>아이콘 설정</h3>

              <FieldGroup>
                <div className={styles.fieldRow}>
                  <Controller
                    name='iconName'
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='iconName'>
                          아이콘 이름{' '}
                          <span className={styles.labelRequired}>*</span>
                        </FieldLabel>
                        <Popover
                          open={iconPopoverOpen}
                          onOpenChange={setIconPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant='outline'
                              role='combobox'
                              aria-expanded={iconPopoverOpen}
                              className={cn(
                                'w-full justify-between',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value
                                ? icons.find((icon) => icon.name === field.value)
                                    ?.name || field.value
                                : '아이콘 선택'}
                              <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className='w-full p-0'>
                            <Command>
                              <CommandInput
                                placeholder='아이콘 검색...'
                                className='h-9'
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {iconsLoading
                                    ? '로딩 중...'
                                    : '아이콘을 찾을 수 없습니다.'}
                                </CommandEmpty>
                                <CommandGroup>
                                  {icons.map((icon) => (
                                    <CommandItem
                                      key={icon.id}
                                      value={icon.name}
                                      onSelect={(currentValue) => {
                                        field.onChange(
                                          currentValue === field.value
                                            ? ''
                                            : currentValue
                                        )
                                        setIconPopoverOpen(false)
                                      }}
                                    >
                                      {icon.name}
                                      <Check
                                        className={cn(
                                          'ml-auto h-4 w-4',
                                          field.value === icon.name
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name='iconBgColor'
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='iconBgColor'>
                          배경색 <span className={styles.labelRequired}>*</span>
                        </FieldLabel>
                        <div className={styles.colorInputWrapper}>
                          <Input
                            {...field}
                            id='iconBgColor'
                            placeholder='#3B82F6'
                            className={styles.colorInput}
                            aria-invalid={fieldState.invalid}
                          />
                          <div
                            className={styles.colorPreview}
                            style={{ backgroundColor: iconBgColor }}
                          />
                        </div>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </FieldGroup>
            </div>

            {/* 작업 시간 설정 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>작업 시간</h3>

              <FieldGroup>
                <div className={styles.fieldRow}>
                  <Controller
                    name='duration'
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='duration'>
                          소요 시간{' '}
                          <span className={styles.labelRequired}>*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id='duration'
                          placeholder='예: 2-3시간'
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Field>
                    <FieldLabel htmlFor='sortOrder'>정렬 순서</FieldLabel>
                    <Input
                      id='sortOrder'
                      type='number'
                      {...register('sortOrder', { valueAsNumber: true })}
                      placeholder='0'
                      min='0'
                    />
                    {errors.sortOrder && (
                      <FieldError errors={[errors.sortOrder]} />
                    )}
                  </Field>
                </div>

                <Controller
                  name='requiresTimeSelection'
                  control={control}
                  render={({ field }) => (
                    <Field orientation='horizontal'>
                      <div className={styles.switchInfo}>
                        <FieldLabel htmlFor='requiresTimeSelection'>
                          시간 선택 필요
                        </FieldLabel>
                        <FieldDescription>
                          고객이 작업 시간대를 선택해야 하는지 설정합니다
                        </FieldDescription>
                      </div>
                      <Switch
                        id='requiresTimeSelection'
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {/* 지역별 출장비 설정 */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                서비스 지역 <span className={styles.labelRequired}>*</span>
              </h3>
              <RegionFeeSelector
                value={regions}
                onChange={(value) => setValue('regions', value)}
              />
              {errors.regions && <FieldError errors={[errors.regions]} />}
            </div>
          </form>
        </div>

        <div className={styles.footer}>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button type='submit' form='service-form' disabled={isPending}>
            {isPending ? '저장 중...' : isEditMode ? '수정하기' : '추가하기'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
