import { useMemo, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import type { CreateServiceRequest } from '@/shared/types/api'
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
import { useNavigate, useParams } from 'react-router-dom'
import {
  useDebouncedIconsSearch,
  useCreateService,
  useUpdateService,
} from '@/features/services/api'
import { useServiceDetail } from '@/features/services/api/use-services-query'
import {
  useServiceFormPage,
  type ServiceFormValues,
} from '@/features/services/model'
import { RegionFeeSelector } from '@/features/services/ui/region-fee-selector/RegionFeeSelector'
import { ScheduleSelector } from '@/features/services/ui/schedule-selector'
import styles from './ServiceFormPage.module.scss'

export function ServiceFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  // 수정 모드일 때 서비스 상세 데이터 조회
  const { data: serviceDetailResponse, isLoading } = useServiceDetail(id)
  const serviceDetail = serviceDetailResponse?.data

  // 폼 훅
  const form = useServiceFormPage({
    serviceDetail,
    isLoading,
  })

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = form

  // 뮤테이션 훅
  const createService = useCreateService()
  const updateService = useUpdateService()

  // 아이콘 검색 상태
  const [iconSearchQuery, setIconSearchQuery] = useState('')
  const { data: iconsResponse, isLoading: iconsLoading } =
    useDebouncedIconsSearch(iconSearchQuery)

  // Combobox용 데이터 변환
  const iconData = useMemo(() => {
    const icons = iconsResponse?.data ?? []
    return icons.slice(0, 100).map((icon) => ({
      label: icon.name,
      value: icon.name,
    }))
  }, [iconsResponse?.data])

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      if (isEditMode && id) {
        await updateService.mutateAsync({
          id,
          data,
        })
      } else {
        await createService.mutateAsync(data as CreateServiceRequest)
      }
      navigate('/services')
    } catch {
      // 에러는 mutation hook에서 toast로 처리
    }
  }

  const handleFormSubmit = () => {
    handleSubmit(onSubmit)()
  }

  const handleCancel = () => {
    navigate('/services')
  }

  const isPending = createService.isPending || updateService.isPending

  // 로딩 상태
  if (isEditMode && isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <p>서비스 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <FormProvider {...form}>
        {/* 페이지 헤더 - ServicesPage와 동일한 패턴 */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>
              {isEditMode ? '서비스 수정' : '새 서비스 추가'}
            </h1>
            <p className={styles.description}>
              {isEditMode
                ? '서비스 정보를 수정합니다. 변경 사항은 즉시 반영됩니다.'
                : '새로운 서비스를 추가합니다. 필수 항목(*)을 모두 입력해주세요.'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button
              type='button'
              variant='outline'
              onClick={handleCancel}
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
        </div>

        {/* 폼 본문 */}
        <div className={styles.formBody}>
          <div className={styles.form}>
            {/* 2단 레이아웃: 기본 정보 + 아이콘 설정 */}
            <div className={styles.formGrid}>
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
                          rows={4}
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
                          배경색 <span className={styles.labelRequired}>*</span>
                        </FieldLabel>
                        <ColorPicker
                          value={field.value}
                          onChange={field.onChange}
                          className='bg-background w-full rounded-lg border p-4 shadow-sm'
                        >
                          <ColorPickerSelection className='mb-4 h-[200px] rounded-lg' />
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
                </FieldGroup>
              </div>
            </div>

            {/* 2단 레이아웃: 작업 시간 설정 */}
            <div className={styles.formGrid}>
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

              {/* 정렬 순서 안내 */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>정렬 순서</h3>
                <div className={styles.infoBox}>
                  <p className={styles.infoBoxText}>
                    정렬 순서는 자동으로 할당됩니다. 순서 변경은 서비스 목록에서
                    드래그 앤 드롭으로 가능합니다.
                  </p>
                </div>
              </div>
            </div>

            {/* 전체 너비: 서비스 지역 */}
            <div className={styles.formFullWidth}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  서비스 지역 <span className={styles.labelRequired}>*</span>
                </h3>
                <RegionFeeSelector />
                {errors.regions && <FieldError errors={[errors.regions]} />}
              </div>
            </div>

            {/* 전체 너비: 예약 일정 설정 */}
            <div className={styles.formFullWidth}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>예약 일정 설정</h3>
                <ScheduleSelector />
              </div>
            </div>
          </div>
        </div>

        {/* 하단 푸터 (모바일용 추가 버튼) */}
        <div className={styles.footer}>
          <Button
            type='button'
            variant='outline'
            onClick={handleCancel}
            disabled={isPending}
          >
            취소
          </Button>
          <Button type='button' onClick={handleFormSubmit} disabled={isPending}>
            {isPending ? '저장 중...' : isEditMode ? '수정하기' : '추가하기'}
          </Button>
        </div>
      </FormProvider>
    </div>
  )
}
