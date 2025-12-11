import { useMemo, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import type { CreateServiceRequest, Service } from '@/shared/types/api'
import { Button } from '@/shared/ui/button'
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@/shared/ui/color-picker'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from '@/shared/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { DurationPicker } from '@/shared/ui/duration-picker'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Switch } from '@/shared/ui/switch'
import { Textarea } from '@/shared/ui/textarea'
import { useDebouncedIconsSearch } from '../../api/use-icons-query'
import {
  useCreateService,
  useUpdateService,
} from '../../api/use-services-mutation'
import { useServiceForm, type ServiceFormValues } from '../../model'
import { RegionFeeSelector } from '../region-fee-selector/RegionFeeSelector'
import { ScheduleSelector } from '../schedule-selector'
import styles from './styles.module.scss'

interface ServiceFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service
}

export function ServiceFormModal({
  open,
  onOpenChange,
  service,
}: ServiceFormModalProps) {
  const isEditMode = Boolean(service)
  const createService = useCreateService()
  const updateService = useUpdateService()

  // useServiceForm 훅 사용
  const form = useServiceForm({ service, isOpen: open })
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = form

  // 아이콘 검색 상태
  const [iconSearchQuery, setIconSearchQuery] = useState('')
  const { data: icons = [], isLoading: iconsLoading } =
    useDebouncedIconsSearch(iconSearchQuery)

  // 모달 닫힐 때 로컬 상태 초기화
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIconSearchQuery('')
    }
    onOpenChange(open)
  }

  // Combobox용 데이터 변환
  const iconData = useMemo(
    () =>
      icons.slice(0, 100).map((icon) => ({
        label: icon.name,
        value: icon.name,
      })),
    [icons]
  )

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

  const handleFormSubmit = () => {
    handleSubmit(onSubmit)()
  }

  const isPending = createService.isPending || updateService.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.modalContent}>
        <FormProvider {...form}>
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
            <div className={styles.form}>
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
                          서비스명{' '}
                          <span className={styles.labelRequired}>*</span>
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
                          <Combobox
                            data={iconData}
                            type='아이콘'
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <ComboboxTrigger className='w-full' />
                            <ComboboxContent
                              popoverOptions={{ className: 'w-[400px]' }}
                            >
                              <ComboboxInput
                                placeholder='아이콘 검색...'
                                value={iconSearchQuery}
                                onValueChange={setIconSearchQuery}
                              />
                              <ComboboxEmpty>
                                {iconsLoading
                                  ? '검색 중...'
                                  : iconSearchQuery.length < 2
                                    ? '최소 2글자 이상 입력하세요'
                                    : '아이콘을 찾을 수 없습니다.'}
                              </ComboboxEmpty>
                              <ComboboxList className='max-h-[400px]'>
                                <ComboboxGroup>
                                  {iconData.map((icon) => (
                                    <ComboboxItem
                                      key={icon.value}
                                      value={icon.value}
                                    >
                                      {icon.label}
                                    </ComboboxItem>
                                  ))}
                                </ComboboxGroup>
                              </ComboboxList>
                            </ComboboxContent>
                          </Combobox>
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
                            배경색{' '}
                            <span className={styles.labelRequired}>*</span>
                          </FieldLabel>
                          <ColorPicker
                            value={field.value}
                            onChange={field.onChange}
                            className='bg-background w-[380px] rounded-lg border p-4 shadow-sm'
                          >
                            <ColorPickerSelection className='mb-4 h-[280px] rounded-lg' />
                            <ColorPickerHue className='mb-3' />
                            <ColorPickerAlpha className='mb-4' />
                            <div className='flex items-center gap-2'>
                              <ColorPickerOutput />
                              <ColorPickerFormat />
                            </div>
                          </ColorPicker>
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
                  <Controller
                    name='duration'
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='duration'>
                          소요 시간{' '}
                          <span className={styles.labelRequired}>*</span>
                        </FieldLabel>
                        <DurationPicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder='소요 시간 선택'
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className={styles.infoBox}>
                    <p className={styles.infoBoxText}>
                      💡 정렬 순서는 자동으로 할당됩니다. 순서 변경은 서비스
                      목록에서 드래그 앤 드롭으로 가능합니다.
                    </p>
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
                <RegionFeeSelector />
                {errors.regions && <FieldError errors={[errors.regions]} />}
              </div>

              {/* 예약 일정 설정 */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>예약 일정 설정</h3>
                <ScheduleSelector />
              </div>
            </div>
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
            <Button
              type='button'
              onClick={handleFormSubmit}
              disabled={isPending}
            >
              {isPending ? '저장 중...' : isEditMode ? '수정하기' : '추가하기'}
            </Button>
          </div>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
