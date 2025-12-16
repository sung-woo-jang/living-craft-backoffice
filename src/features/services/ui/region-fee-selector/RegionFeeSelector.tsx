import { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { GroupedServiceRegion } from '@/shared/types/api'
import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
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
import { Input } from '@/shared/ui/input'
import { ChevronDown, MapPin, Trash2, X } from 'lucide-react'
import { useDistricts } from '../../api/use-districts'
import { groupRegionsBySido } from '../../lib/region-utils'
import type { ServiceFormValues } from '../../model'
import styles from './styles.module.scss'

export function RegionFeeSelector() {
  const { watch, setValue } = useFormContext<ServiceFormValues>()
  const value = watch('regions')

  // 폼 상태
  const [selectedSido, setSelectedSido] = useState<string>('')
  const [selectedSigungu, setSelectedSigungu] = useState<string>('')
  const [estimateFee, setEstimateFee] = useState<string>('0')
  const [setSidoFee, setSetSidoFee] = useState<boolean>(true)
  const [setExceptionFee, setSetExceptionFee] = useState<boolean>(false)

  // 아코디언 열림 상태
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  // 인라인 편집 상태
  const [editingDistrictId, setEditingDistrictId] = useState<number | null>(
    null
  )
  const [editingFee, setEditingFee] = useState<string>('')

  // 시/도 목록 조회
  const { data: sidoResponse } = useDistricts({ level: 'SIDO' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sidoList = sidoResponse?.data ?? []

  // 선택된 시/도의 시/군/구 목록 조회
  const sidoId = selectedSido ? parseInt(selectedSido) : null
  const { data: sigunguResponse } = useDistricts({
    level: 'SIGUNGU',
    parentId: sidoId || undefined,
  })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sigunguList = sigunguResponse?.data ?? []

  // 전체 지역 조회 (그룹핑용)
  const { data: allDistrictsResponse } = useDistricts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allDistricts = allDistrictsResponse?.data ?? []

  // Combobox용 데이터 변환
  const sidoData = useMemo(
    () =>
      sidoList.map((sido) => ({
        label: sido.name,
        value: sido.id.toString(),
      })),
    [sidoList]
  )

  const sigunguData = useMemo(
    () =>
      sigunguList.map((sigungu) => ({
        label: sigungu.name,
        value: sigungu.id.toString(),
      })),
    [sigunguList]
  )

  // 선택된 지역을 시/도별로 그룹화
  const groupedRegions = useMemo(
    () => groupRegionsBySido(value, allDistricts),
    [value, allDistricts]
  )

  // 아코디언 토글
  const toggleAccordion = (sidoId: number) => {
    setOpenItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sidoId)) {
        newSet.delete(sidoId)
      } else {
        newSet.add(sidoId)
      }
      return newSet
    })
  }

  // 지역 추가 핸들러
  const handleAddRegion = () => {
    if (!selectedSido) return

    const fee = parseFloat(estimateFee)
    if (isNaN(fee) || fee < 0) return

    const sidoIdNum = parseInt(selectedSido)

    // Case 1: 시/도 전체에 기본 출장비 설정
    if (setSidoFee && !setExceptionFee) {
      // 기존 해당 시/도 관련 데이터 모두 제거
      const filteredValue = value.filter((r) => {
        const district = allDistricts.find((d) => d.id === r.districtId)
        if (!district) return true
        if (district.level === 'SIDO' && district.id === sidoIdNum) return false
        if (district.level === 'SIGUNGU' && district.parentId === sidoIdNum)
          return false
        return true
      })

      // SIDO 레코드 추가 + 모든 SIGUNGU 레코드 추가
      const newRegions = [
        { districtId: sidoIdNum, estimateFee: fee },
        ...sigunguList.map((sigungu) => ({
          districtId: sigungu.id,
          estimateFee: fee,
        })),
      ]

      setValue('regions', [...filteredValue, ...newRegions])

      // 새로 추가된 시/도 아코디언 열기
      setOpenItems((prev) => new Set(prev).add(sidoIdNum))
    }
    // Case 2: 특정 구/군에 예외 출장비 설정
    else if (setExceptionFee && selectedSigungu) {
      const sigunguIdNum = parseInt(selectedSigungu)

      // 해당 구/군이 이미 있으면 업데이트, 없으면 추가
      const existingIndex = value.findIndex(
        (r) => r.districtId === sigunguIdNum
      )
      if (existingIndex >= 0) {
        const updatedValue = [...value]
        updatedValue[existingIndex] = {
          ...updatedValue[existingIndex],
          estimateFee: fee,
        }
        setValue('regions', updatedValue)
      } else {
        setValue('regions', [
          ...value,
          { districtId: sigunguIdNum, estimateFee: fee },
        ])
      }
    }

    // 폼 초기화
    setSelectedSido('')
    setSelectedSigungu('')
    setEstimateFee('0')
    setSetSidoFee(true)
    setSetExceptionFee(false)
  }

  // 시/도 전체 삭제
  const handleRemoveSido = (
    e: React.MouseEvent,
    sidoId: number,
    group: GroupedServiceRegion
  ) => {
    e.stopPropagation()

    // 해당 시/도의 SIDO 레코드와 모든 SIGUNGU 레코드 삭제
    const districtIdsToRemove = new Set<number>([sidoId])
    group.sigungus.forEach((s) => districtIdsToRemove.add(s.districtId))

    setValue(
      'regions',
      value.filter((r) => !districtIdsToRemove.has(r.districtId))
    )
  }

  // 구/군 개별 삭제
  const handleRemoveSigungu = (districtId: number) => {
    setValue(
      'regions',
      value.filter((r) => r.districtId !== districtId)
    )
  }

  // 인라인 편집 시작
  const handleStartEdit = (districtId: number, currentFee: number) => {
    setEditingDistrictId(districtId)
    setEditingFee(currentFee.toString())
  }

  // 인라인 편집 저장
  const handleSaveFee = (districtId: number) => {
    const newFee = parseFloat(editingFee)
    if (!isNaN(newFee) && newFee >= 0) {
      const updatedValue = value.map((r) =>
        r.districtId === districtId ? { ...r, estimateFee: newFee } : r
      )
      setValue('regions', updatedValue)
    }
    setEditingDistrictId(null)
    setEditingFee('')
  }

  // 인라인 편집 키보드 핸들링
  const handleKeyDown = (e: React.KeyboardEvent, districtId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveFee(districtId)
    } else if (e.key === 'Escape') {
      setEditingDistrictId(null)
      setEditingFee('')
    }
  }

  // 시/도 기본 출장비 표시 텍스트
  const getSidoFeeText = (group: GroupedServiceRegion): string => {
    if (group.sidoEstimateFee !== null) {
      return `기본: ${group.sidoEstimateFee.toLocaleString()}원`
    }
    // 모든 구/군의 출장비가 같으면 그 값 표시
    if (group.sigungus.length > 0) {
      const fees = group.sigungus.map((s) => s.estimateFee)
      const uniqueFees = [...new Set(fees)]
      if (uniqueFees.length === 1) {
        return `공통: ${uniqueFees[0].toLocaleString()}원`
      }
      return `${Math.min(...fees).toLocaleString()} ~ ${Math.max(...fees).toLocaleString()}원`
    }
    return ''
  }

  return (
    <div className={styles.container}>
      {/* 선택된 지역 목록 (아코디언) */}
      {groupedRegions.length > 0 ? (
        <div className={styles.regionAccordion}>
          {groupedRegions.map((group) => (
            <Collapsible
              key={group.sidoId}
              open={openItems.has(group.sidoId)}
              onOpenChange={() => toggleAccordion(group.sidoId)}
            >
              <div className={styles.accordionItem}>
                <CollapsibleTrigger asChild>
                  <button type='button' className={styles.accordionHeader}>
                    <div className={styles.accordionHeaderLeft}>
                      <ChevronDown
                        size={16}
                        className={styles.accordionChevron}
                        data-open={openItems.has(group.sidoId)}
                      />
                      <span className={styles.accordionSidoName}>
                        {group.sidoName}
                      </span>
                      <span className={styles.accordionSidoCount}>
                        {group.sigungus.length}개 구/군
                      </span>
                    </div>
                    <div className={styles.accordionHeaderRight}>
                      <span className={styles.accordionSidoFee}>
                        {getSidoFeeText(group)}
                      </span>
                      <button
                        type='button'
                        onClick={(e) =>
                          handleRemoveSido(e, group.sidoId, group)
                        }
                        className={styles.accordionDeleteBtn}
                        title='시/도 전체 삭제'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </button>
                </CollapsibleTrigger>

                <CollapsibleContent className={styles.accordionContent}>
                  <div className={styles.sigunguList}>
                    {group.sigungus.map((sigungu) => {
                      const isException =
                        group.sidoEstimateFee !== null &&
                        sigungu.estimateFee !== group.sidoEstimateFee

                      return (
                        <div
                          key={sigungu.districtId}
                          className={styles.sigunguItem}
                        >
                          <span className={styles.sigunguName}>
                            {sigungu.districtName}
                          </span>
                          <div className={styles.sigunguFeeWrapper}>
                            {editingDistrictId === sigungu.districtId ? (
                              <div className={styles.sigunguFeeEdit}>
                                <Input
                                  type='number'
                                  value={editingFee}
                                  onChange={(e) =>
                                    setEditingFee(e.target.value)
                                  }
                                  onKeyDown={(e) =>
                                    handleKeyDown(e, sigungu.districtId)
                                  }
                                  onBlur={() =>
                                    handleSaveFee(sigungu.districtId)
                                  }
                                  autoFocus
                                  min='0'
                                  step='1000'
                                  className={styles.sigunguFeeInput}
                                />
                                <span className={styles.sigunguFeeEditSuffix}>
                                  원
                                </span>
                              </div>
                            ) : (
                              <button
                                type='button'
                                onClick={() =>
                                  handleStartEdit(
                                    sigungu.districtId,
                                    sigungu.estimateFee
                                  )
                                }
                                className={styles.sigunguFeeBtn}
                                title='클릭하여 수정'
                              >
                                {isException ? (
                                  <span
                                    className={`${styles.sigunguFee} ${styles.sigunguFeeException}`}
                                  >
                                    {sigungu.estimateFee.toLocaleString()}원
                                    (예외)
                                  </span>
                                ) : group.sidoEstimateFee !== null ? (
                                  <span className={styles.sigunguFeeDefault}>
                                    기본값 적용
                                  </span>
                                ) : (
                                  <span className={styles.sigunguFee}>
                                    {sigungu.estimateFee.toLocaleString()}원
                                  </span>
                                )}
                              </button>
                            )}
                            <button
                              type='button'
                              onClick={() =>
                                handleRemoveSigungu(sigungu.districtId)
                              }
                              className={styles.sigunguDeleteBtn}
                              title='삭제'
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <MapPin size={24} />
          <p className={styles.emptyStateText}>선택된 서비스 지역이 없습니다</p>
          <p className={styles.emptyStateHint}>아래에서 지역을 추가해주세요</p>
        </div>
      )}

      {/* 지역 추가 폼 */}
      <div className={styles.addForm}>
        {/* 시/도 선택 */}
        <div className={styles.fieldGroup}>
          <label className={styles.label}>시/도 선택</label>
          <Combobox
            data={sidoData}
            type='시/도'
            value={selectedSido}
            onValueChange={(val) => {
              setSelectedSido(val)
              setSelectedSigungu('')
            }}
          >
            <ComboboxTrigger className='w-full' />
            <ComboboxContent>
              <ComboboxInput placeholder='시/도 검색...' />
              <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
              <ComboboxList>
                <ComboboxGroup>
                  {sidoData.map((sido) => (
                    <ComboboxItem key={sido.value} value={sido.value}>
                      {sido.label}
                    </ComboboxItem>
                  ))}
                </ComboboxGroup>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        {/* 옵션 선택 */}
        {selectedSido && (
          <>
            {/* 시/도 전체 기본 출장비 설정 */}
            <div className={styles.addFormSection}>
              <div className={styles.checkboxRow}>
                <Checkbox
                  id='setSidoFee'
                  checked={setSidoFee}
                  onCheckedChange={(checked) => {
                    setSetSidoFee(checked === true)
                    if (checked) {
                      setSetExceptionFee(false)
                    }
                  }}
                />
                <label htmlFor='setSidoFee' className={styles.checkboxLabel}>
                  시/도 전체에 기본 출장비 설정
                </label>
              </div>

              {setSidoFee && !setExceptionFee && (
                <div className={styles.indentedField}>
                  <div className={styles.feeInputWrapper}>
                    <label className={styles.label}>기본 출장비</label>
                    <Input
                      type='number'
                      placeholder='0'
                      value={estimateFee}
                      onChange={(e) => setEstimateFee(e.target.value)}
                      min='0'
                      step='1000'
                      className={styles.feeInput}
                    />
                    <span className={styles.feeSuffix}>원</span>
                  </div>
                </div>
              )}
            </div>

            {/* 특정 구/군 예외 출장비 설정 */}
            <div className={styles.addFormSection}>
              <div className={styles.checkboxRow}>
                <Checkbox
                  id='setExceptionFee'
                  checked={setExceptionFee}
                  onCheckedChange={(checked) => {
                    setSetExceptionFee(checked === true)
                    if (checked) {
                      setSetSidoFee(false)
                    }
                  }}
                />
                <label
                  htmlFor='setExceptionFee'
                  className={styles.checkboxLabel}
                >
                  특정 구/군에 예외 출장비 설정
                </label>
              </div>

              {setExceptionFee && (
                <div className={styles.indentedField}>
                  <div className={styles.selectRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>구/군 선택</label>
                      <Combobox
                        data={sigunguData}
                        type='구/군'
                        value={selectedSigungu}
                        onValueChange={setSelectedSigungu}
                      >
                        <ComboboxTrigger className='w-full' />
                        <ComboboxContent>
                          <ComboboxInput placeholder='구/군 검색...' />
                          <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
                          <ComboboxList>
                            <ComboboxGroup>
                              {sigunguData.map((sigungu) => (
                                <ComboboxItem
                                  key={sigungu.value}
                                  value={sigungu.value}
                                >
                                  {sigungu.label}
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                    </div>

                    <div className={styles.feeInputWrapper}>
                      <label className={styles.label}>예외 출장비</label>
                      <Input
                        type='number'
                        placeholder='0'
                        value={estimateFee}
                        onChange={(e) => setEstimateFee(e.target.value)}
                        min='0'
                        step='1000'
                        className={styles.feeInput}
                      />
                      <span className={styles.feeSuffix}>원</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 추가 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type='button'
            onClick={handleAddRegion}
            disabled={
              !selectedSido ||
              !estimateFee ||
              (setExceptionFee && !selectedSigungu)
            }
            variant='secondary'
            className={styles.addButton}
          >
            추가
          </Button>
        </div>
      </div>
    </div>
  )
}
