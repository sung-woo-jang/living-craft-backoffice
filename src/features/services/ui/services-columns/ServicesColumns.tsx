import { type ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/shared/lib/format'
import type { Service, ServiceableRegionDto } from '@/shared/types/api'
import { DataTableColumnHeader } from '@/shared/ui-kit/data-table'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { DataTableRowActions } from '../data-table-row-actions'

/**
 * 서비스 테이블 컬럼 정의
 */
export const servicesColumns: ColumnDef<Service>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='서비스명' />
    ),
    cell: ({ row }) => {
      const iconBgColor = row.original.iconBgColor

      return (
        <div className='flex items-center gap-2'>
          <div
            className='flex size-8 items-center justify-center rounded-md text-xs font-medium text-white'
            style={{ backgroundColor: iconBgColor || '#3B82F6' }}
          >
            {row.getValue('title')?.toString().charAt(0) || '서'}
          </div>
          <span className='font-medium'>{row.getValue('title')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: '설명',
    cell: ({ row }) => (
      <div className='text-muted-foreground max-w-md truncate'>
        {row.getValue('description')}
      </div>
    ),
  },
  {
    accessorKey: 'duration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='소요 시간' />
    ),
    cell: ({ row }) => {
      const duration = row.getValue('duration') as string
      return <span>{duration}</span>
    },
  },
  {
    accessorKey: 'requiresTimeSelection',
    header: '시간 선택',
    cell: ({ row }) => {
      const requires = row.getValue('requiresTimeSelection') as boolean
      return (
        <Badge variant={requires ? 'default' : 'secondary'}>
          {requires ? '가능' : '하루 종일'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'serviceableRegions',
    header: '서비스 지역',
    cell: ({ row }) => {
      const regions = (row.getValue('serviceableRegions') as ServiceableRegionDto[]) || []

      if (regions.length === 0) {
        return <span className='text-muted-foreground'>-</span>
      }

      const regionNames = regions.map((r) => r.name)

      return (
        <div className='flex flex-wrap gap-1'>
          {regionNames.slice(0, 2).map((name) => (
            <Badge key={name} variant='outline'>
              {name}
            </Badge>
          ))}
          {regionNames.length > 2 && (
            <Badge variant='outline'>+{regionNames.length - 2}개</Badge>
          )}
        </div>
      )
    },
  },
  {
    id: 'estimateFees',
    header: '출장비',
    cell: ({ row }) => {
      const regions = row.original.serviceableRegions || []
      if (regions.length === 0) {
        return <span className='text-muted-foreground'>미설정</span>
      }

      // 모든 지역의 기본 출장비를 수집
      const allFees: number[] = []
      regions.forEach((region) => {
        allFees.push(region.estimateFee)
        region.cities.forEach((city) => {
          if (city.estimateFee !== null) {
            allFees.push(city.estimateFee)
          }
        })
      })

      if (allFees.length === 0) {
        return <span className='text-muted-foreground'>미설정</span>
      }

      const minFee = Math.min(...allFees)
      const maxFee = Math.max(...allFees)

      if (minFee === maxFee) {
        return formatCurrency(minFee)
      }
      return `${formatCurrency(minFee)} ~ ${formatCurrency(maxFee)}`
    },
  },
  {
    accessorKey: 'isActive',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='상태' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('isActive') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? '활성' : '비활성'}
        </Badge>
      )
    },
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: 'sortOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='정렬 순서' />
    ),
    cell: ({ row }) => {
      const order = row.getValue('sortOrder') as number
      return order
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => <DataTableRowActions row={row} table={table} />,
  },
]
