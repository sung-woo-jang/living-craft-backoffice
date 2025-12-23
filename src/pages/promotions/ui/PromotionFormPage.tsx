import { useEffect, useState } from 'react'
import { Controller, FormProvider } from 'react-hook-form'
import { Button } from '@/shared/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useFetchPromotionDetail,
  useCreatePromotion,
  useUpdatePromotion,
} from '@/features/promotions/api'
import {
  usePromotionFormPage,
  LINK_TYPE_OPTIONS,
  INTERNAL_LINK_OPTIONS,
  isCustomInternalUrl,
  type PromotionFormValues,
} from '@/features/promotions/model'
import { IconUploader } from '@/features/promotions/ui/icon-uploader'
import styles from './PromotionFormPage.module.scss'

export function PromotionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditMode = Boolean(id)

  // 수정 모드일 때 프로모션 상세 데이터 조회
  const { data: promotionDetailResponse, isLoading } =
    useFetchPromotionDetail(id)
  const promotionDetail = promotionDetailResponse?.data

  // 폼 훅
  const form = usePromotionFormPage({
    promotionDetail,
    isLoading,
  })

  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = form

  // 뮤테이션 훅
  const createPromotion = useCreatePromotion()
  const updatePromotion = useUpdatePromotion()

  const linkType = watch('linkType')
  const linkUrl = watch('linkUrl')

  // 직접 입력 모드 상태 관리
  const [isDirectInput, setIsDirectInput] = useState(false)

  // linkUrl 변경 시 직접 입력 모드 동기화 (양방향)
  useEffect(() => {
    if (linkType === 'internal') {
      // linkUrl이 미리 정의된 옵션 중 하나인지 확인
      const isPredefined = INTERNAL_LINK_OPTIONS.some(
        (opt) => opt.value === linkUrl && opt.value !== '__custom__'
      )
      setIsDirectInput(!isPredefined && linkUrl !== '')
    } else {
      setIsDirectInput(false)
    }
  }, [linkUrl, linkType])

  const onSubmit = async (data: PromotionFormValues) => {
    try {
      if (isEditMode && id) {
        await updatePromotion.mutateAsync({
          id,
          data: {
            title: data.title,
            subtitle: data.subtitle || undefined,
            linkUrl: data.linkUrl || undefined,
            linkType: data.linkType,
            startDate: data.startDate || undefined,
            endDate: data.endDate || undefined,
            isActive: data.isActive,
            sortOrder: data.sortOrder,
          },
          icon: data.newIcon || undefined,
        })
      } else {
        await createPromotion.mutateAsync({
          title: data.title,
          subtitle: data.subtitle || undefined,
          linkUrl: data.linkUrl || undefined,
          linkType: data.linkType,
          startDate: data.startDate || undefined,
          endDate: data.endDate || undefined,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          icon: data.newIcon || undefined,
        })
      }
      navigate('/promotions')
    } catch {
      // 에러는 mutation hook에서 toast로 처리
    }
  }

  const handleFormSubmit = () => {
    handleSubmit(onSubmit)()
  }

  const handleCancel = () => {
    navigate('/promotions')
  }

  const isPending = createPromotion.isPending || updatePromotion.isPending

  // 로딩 상태
  if (isEditMode && isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingContainer}>
          <p>프로모션 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <FormProvider {...form}>
        {/* 페이지 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>
              {isEditMode ? '프로모션 배너 수정' : '새 프로모션 배너 추가'}
            </h1>
            <p className={styles.description}>
              {isEditMode
                ? '프로모션 배너 정보를 수정합니다.'
                : '새로운 프로모션 배너를 추가합니다. 필수 항목(*)을 모두 입력해주세요.'}
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
            {/* 2단 레이아웃 */}
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
                          제목 <span className={styles.labelRequired}>*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          id='title'
                          placeholder='예: 친구 초대하고 함께 쿠폰 받기'
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name='subtitle'
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='subtitle'>부제목</FieldLabel>
                        <Input
                          {...field}
                          id='subtitle'
                          value={field.value ?? ''}
                          placeholder='예: 이용하는 친구 초대하고 할인 쿠폰 받기!'
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>선택사항</FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <div className={styles.fieldRow}>
                    <Controller
                      name='sortOrder'
                      control={control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor='sortOrder'>
                            정렬 순서{' '}
                            <span className={styles.labelRequired}>*</span>
                          </FieldLabel>
                          <Input
                            {...field}
                            type='number'
                            id='sortOrder'
                            min={0}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                            aria-invalid={fieldState.invalid}
                          />
                          <FieldDescription>
                            숫자가 작을수록 먼저 표시
                          </FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )}
                    />

                    <Controller
                      name='isActive'
                      control={control}
                      render={({ field }) => (
                        <Field>
                          <FieldLabel htmlFor='isActive'>활성 상태</FieldLabel>
                          <div className={styles.switchContainer}>
                            <Switch
                              id='isActive'
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                            <span className={styles.switchLabel}>
                              {field.value ? '활성' : '비활성'}
                            </span>
                          </div>
                        </Field>
                      )}
                    />
                  </div>
                </FieldGroup>
              </div>

              {/* 링크 설정 */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>링크 설정</h3>

                <FieldGroup>
                  <Controller
                    name='linkType'
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='linkType'>링크 타입</FieldLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger id='linkType'>
                            <SelectValue placeholder='링크 타입 선택' />
                          </SelectTrigger>
                          <SelectContent>
                            {LINK_TYPE_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name='linkUrl'
                    control={control}
                    render={({ field, fieldState }) => {
                      // Select에서 표시할 값 결정
                      const selectValue = isDirectInput
                        ? '__custom__'
                        : (field.value ?? '')

                      return (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor='linkUrl'>링크 URL</FieldLabel>
                          {linkType === 'internal' ? (
                            <div className={styles.internalLinkContainer}>
                              <Select
                                value={selectValue}
                                onValueChange={(val) => {
                                  if (val === '__custom__') {
                                    // 직접 입력 선택 시 Input 값은 유지하고 직접 입력 모드만 활성화
                                    setIsDirectInput(true)
                                  } else {
                                    // 미리 정의된 경로 선택 시 직접 입력 모드 비활성화하고 Input에 동기화
                                    setIsDirectInput(false)
                                    field.onChange(val)
                                  }
                                }}
                              >
                                <SelectTrigger id='linkUrl'>
                                  <SelectValue placeholder='이동할 페이지 선택' />
                                </SelectTrigger>
                                <SelectContent>
                                  {INTERNAL_LINK_OPTIONS.map((option) => (
                                    <SelectItem
                                      key={option.value}
                                      value={option.value}
                                    >
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* 항상 Input 표시 (URL 확인 및 직접 입력용) */}
                              <Input
                                value={field.value ?? ''}
                                onChange={(e) => {
                                  const newValue = e.target.value
                                  field.onChange(newValue)

                                  // Input 값이 INTERNAL_LINK_OPTIONS에 없으면 직접 입력 모드로 전환
                                  const isPredefinedValue =
                                    INTERNAL_LINK_OPTIONS.some(
                                      (opt) =>
                                        opt.value === newValue &&
                                        opt.value !== '__custom__'
                                    )

                                  if (!isPredefinedValue && newValue !== '') {
                                    setIsDirectInput(true)
                                  } else if (isPredefinedValue) {
                                    setIsDirectInput(false)
                                  }
                                }}
                                placeholder='/reservation/service?serviceId=1'
                                className={styles.customLinkInput}
                              />
                            </div>
                          ) : (
                            <Input
                              {...field}
                              id='linkUrl'
                              value={field.value ?? ''}
                              placeholder='https://example.com'
                              aria-invalid={fieldState.invalid}
                            />
                          )}
                          <FieldDescription>
                            {linkType === 'internal'
                              ? '앱 내 이동할 페이지를 선택하거나 직접 입력하세요 (예: /reservation/service?serviceId=1)'
                              : '외부 링크 URL을 입력하세요'}
                          </FieldDescription>
                          {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      )
                    }}
                  />
                </FieldGroup>
              </div>
            </div>

            {/* 게시 기간 */}
            <div className={styles.formFullWidth}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>게시 기간</h3>

                <div className={styles.fieldRow}>
                  <Controller
                    name='startDate'
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='startDate'>시작일</FieldLabel>
                        <Input
                          {...field}
                          type='date'
                          id='startDate'
                          value={field.value ?? ''}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>비워두면 즉시 게시</FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name='endDate'
                    control={control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor='endDate'>종료일</FieldLabel>
                        <Input
                          {...field}
                          type='date'
                          id='endDate'
                          value={field.value ?? ''}
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>
                          비워두면 무기한 게시
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* 아이콘 이미지 */}
            <div className={styles.formFullWidth}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>아이콘 이미지</h3>
                <IconUploader
                  existingIconUrl={watch('existingIconUrl')}
                  newIcon={watch('newIcon') ?? null}
                  onIconChange={(file) => setValue('newIcon', file)}
                  onRemoveExisting={() => setValue('existingIconUrl', null)}
                />
                <FieldDescription>
                  권장 크기: 112x112px (2x 해상도). 정사각형 이미지가 가장 잘
                  보입니다.
                </FieldDescription>
                {errors.newIcon && (
                  <p className={styles.errorText}>
                    {String(errors.newIcon.message)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 하단 푸터 */}
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
