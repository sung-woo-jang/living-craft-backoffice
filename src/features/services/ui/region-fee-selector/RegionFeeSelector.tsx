import { useState } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import type { ServiceRegionInput, District } from '@/shared/types/api'
import { useDistricts } from '../../api/use-districts'

interface RegionFeeSelectorProps {
  value: ServiceRegionInput[]
  onChange: (value: ServiceRegionInput[]) => void
}

export function RegionFeeSelector({ value, onChange }: RegionFeeSelectorProps) {
  const [selectedSido, setSelectedSido] = useState<number | null>(null)
  const [selectedSigungu, setSelectedSigungu] = useState<number | null>(null)
  const [estimateFee, setEstimateFee] = useState<string>('')

  // 시/도 목록 조회
  const { data: sidoList = [] } = useDistricts({ level: 'SIDO' })

  // 선택된 시/도의 시/군/구 목록 조회
  const { data: sigunguList = [] } = useDistricts({
    level: 'SIGUNGU',
    parentId: selectedSido || undefined,
  })

  // 선택된 지역 정보 조회 (Badge 표시용)
  const { data: allDistricts = [] } = useDistricts()

  const selectedRegions = value
    .map((region) => {
      const district = allDistricts.find((d) => d.id === region.districtId)
      return district ? { ...region, district } : null
    })
    .filter((r): r is ServiceRegionInput & { district: District } => r !== null)

  const handleAddRegion = () => {
    const districtId = selectedSigungu || selectedSido

    if (!districtId) {
      return
    }

    const fee = parseFloat(estimateFee)
    if (isNaN(fee) || fee < 0) {
      return
    }

    // 중복 체크
    if (value.some((r) => r.districtId === districtId)) {
      alert('이미 추가된 지역입니다.')
      return
    }

    onChange([...value, { districtId, estimateFee: fee }])

    // 폼 초기화
    setSelectedSido(null)
    setSelectedSigungu(null)
    setEstimateFee('')
  }

  const handleRemoveRegion = (districtId: number) => {
    onChange(value.filter((r) => r.districtId !== districtId))
  }

  return (
    <div className='space-y-4'>
      {/* 선택된 지역 목록 */}
      {selectedRegions.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {selectedRegions.map((region) => (
            <Badge key={region.districtId} variant='outline' className='gap-1'>
              <span>
                {region.district.name} - {region.estimateFee.toLocaleString()}원
              </span>
              <button
                type='button'
                onClick={() => handleRemoveRegion(region.districtId)}
                className='hover:bg-muted ml-1 rounded-full'
              >
                <X className='h-3 w-3' />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 지역 추가 폼 */}
      <div className='grid gap-4 rounded-lg border p-4'>
        <div className='grid gap-2'>
          <Label htmlFor='sido'>시/도</Label>
          <Select
            value={selectedSido?.toString()}
            onValueChange={(value) => {
              setSelectedSido(parseInt(value))
              setSelectedSigungu(null) // 시/도 변경 시 시/군/구 초기화
            }}
          >
            <SelectTrigger id='sido'>
              <SelectValue placeholder='시/도를 선택하세요' />
            </SelectTrigger>
            <SelectContent>
              {sidoList.map((sido) => (
                <SelectItem key={sido.id} value={sido.id.toString()}>
                  {sido.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSido && (
          <div className='grid gap-2'>
            <Label htmlFor='sigungu'>시/군/구 (선택사항)</Label>
            <Select
              value={selectedSigungu?.toString() || ''}
              onValueChange={(value) => {
                setSelectedSigungu(value ? parseInt(value) : null)
              }}
            >
              <SelectTrigger id='sigungu'>
                <SelectValue placeholder='전체 (시/도 전체)' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=''>전체 (시/도 전체)</SelectItem>
                {sigunguList.map((sigungu) => (
                  <SelectItem key={sigungu.id} value={sigungu.id.toString()}>
                    {sigungu.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className='grid gap-2'>
          <Label htmlFor='estimateFee'>출장비 (원)</Label>
          <Input
            id='estimateFee'
            type='number'
            placeholder='0'
            value={estimateFee}
            onChange={(e) => setEstimateFee(e.target.value)}
            min='0'
            step='1000'
          />
        </div>

        <Button
          type='button'
          onClick={handleAddRegion}
          disabled={!selectedSido || !estimateFee}
          variant='outline'
        >
          지역 추가
        </Button>
      </div>
    </div>
  )
}
