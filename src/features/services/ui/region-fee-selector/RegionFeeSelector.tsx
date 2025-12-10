import { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import type { District, ServiceRegionInput } from '@/shared/types/api'
import { Button } from '@/shared/ui/button'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from '@/shared/ui/combobox'
import { Input } from '@/shared/ui/input'
import { MapPin, X } from 'lucide-react'
import { useDistricts } from '../../api/use-districts'
import type { ServiceFormValues } from '../../model'
import styles from './styles.module.scss'

export function RegionFeeSelector() {
  const { watch, setValue } = useFormContext<ServiceFormValues>()
  const value = watch('regions')
  const [selectedSido, setSelectedSido] = useState<string>('')
  const [selectedSigungu, setSelectedSigungu] = useState<string>('')
  const [estimateFee, setEstimateFee] = useState<string>('0')

  // 시/도 목록 조회
  const { data: sidoList = [] } = useDistricts({ level: 'SIDO' })

  // 선택된 시/도의 시/군/구 목록 조회
  const sidoId = selectedSido ? parseInt(selectedSido) : null
  const { data: sigunguList = [] } = useDistricts({
    level: 'SIGUNGU',
    parentId: sidoId || undefined,
  })

  // 선택된 지역 정보 조회 (태그 표시용)
  const { data: allDistricts = [] } = useDistricts()

  // Combobox용 데이터 변환
  const sidoData = useMemo(
    () =>
      sidoList.map((sido) => ({
        label: sido.name,
        value: sido.id.toString(),
      })),
    [sidoList]
  )

  const sigunguData = useMemo(() => {
    const data = sigunguList.map((sigungu) => ({
      label: sigungu.name,
      value: sigungu.id.toString(),
    }))
    // "__ALL__" 옵션을 맨 앞에 추가
    return [{ label: '전체 (시/도 전체)', value: '__ALL__' }, ...data]
  }, [sigunguList])

  const selectedRegions = value
    .map((region) => {
      const district = allDistricts.find((d) => d.id === region.districtId)
      return district ? { ...region, district } : null
    })
    .filter((r): r is ServiceRegionInput & { district: District } => r !== null)

  const handleAddRegion = () => {
    if (!selectedSido) {
      return
    }

    const fee = parseFloat(estimateFee)
    if (isNaN(fee) || fee < 0) {
      return
    }

    // Case 1: 특정 시/군/구 선택
    if (selectedSigungu && selectedSigungu !== '__ALL__') {
      const sigunguId = parseInt(selectedSigungu)
      // 중복 시 기존 항목 제거 후 새 값으로 교체
      const filteredValue = value.filter((r) => r.districtId !== sigunguId)
      setValue('regions', [
        ...filteredValue,
        { districtId: sigunguId, estimateFee: fee },
      ])
    }
    // Case 2: "전체 (시/도 전체)" 선택
    else {
      if (sigunguList.length === 0) {
        return
      }

      // 중복 체크: 이미 추가된 SIGUNGU ID 목록
      const existingDistrictIds = new Set(value.map((r) => r.districtId))

      // 중복되지 않은 SIGUNGU만 필터링
      const newRegions = sigunguList
        .filter((sigungu) => !existingDistrictIds.has(sigungu.id))
        .map((sigungu) => ({
          districtId: sigungu.id,
          estimateFee: fee,
        }))

      if (newRegions.length === 0) {
        return
      }

      setValue('regions', [...value, ...newRegions])
    }

    // 폼 초기화
    setSelectedSido('')
    setSelectedSigungu('')
    setEstimateFee('0')
  }

  const handleRemoveRegion = (districtId: number) => {
    setValue(
      'regions',
      value.filter((r) => r.districtId !== districtId)
    )
  }

  return (
    <div className={styles.container}>
      {/* 선택된 지역 목록 */}
      {selectedRegions.length > 0 ? (
        <div className={styles.selectedRegions}>
          {selectedRegions.map((region) => (
            <div key={region.districtId} className={styles.regionTag}>
              <span className={styles.regionTagText}>
                <span className={styles.regionName}>
                  {region.district.name}
                </span>
                <span className={styles.regionFee}>
                  {region.estimateFee.toLocaleString()}원
                </span>
              </span>
              <button
                type='button'
                onClick={() => handleRemoveRegion(region.districtId)}
                className={styles.removeButton}
              >
                <X size={12} />
              </button>
            </div>
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
        <div className={styles.selectRow}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>시/도</label>
            <Combobox
              data={sidoData}
              type='시/도'
              value={selectedSido}
              onValueChange={(val) => {
                setSelectedSido(val)
                setSelectedSigungu('') // 시/도 변경 시 시/군/구 초기화
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

          <div className={styles.fieldGroup}>
            <label className={styles.label}>시/군/구 (선택)</label>
            <Combobox
              data={sigunguData}
              type='시/군/구'
              value={selectedSigungu}
              onValueChange={setSelectedSigungu}
            >
              <ComboboxTrigger className='w-full' disabled={!selectedSido}>
                {selectedSigungu
                  ? sigunguData.find((s) => s.value === selectedSigungu)?.label
                  : selectedSido
                    ? '전체 (시/도 전체)'
                    : '시/도를 먼저 선택'}
              </ComboboxTrigger>
              <ComboboxContent>
                <ComboboxInput placeholder='시/군/구 검색...' />
                <ComboboxEmpty>검색 결과가 없습니다.</ComboboxEmpty>
                <ComboboxList>
                  <ComboboxGroup>
                    {/* "__ALL__" 옵션 */}
                    <ComboboxItem value='__ALL__'>
                      전체 (시/도 전체)
                    </ComboboxItem>

                    {/* 구분선 */}
                    {sigunguList.length > 0 && <ComboboxSeparator />}

                    {/* 시/군/구 목록 */}
                    {sigunguList.map((sigungu) => (
                      <ComboboxItem
                        key={sigungu.id}
                        value={sigungu.id.toString()}
                      >
                        {sigungu.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxGroup>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>

        <div className={styles.feeRow}>
          <div className={styles.feeInputWrapper}>
            <label className={styles.label}>출장비</label>
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
          <Button
            type='button'
            onClick={handleAddRegion}
            disabled={!selectedSido || !estimateFee}
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
