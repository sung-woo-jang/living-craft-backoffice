import { type ColumnDef } from '@tanstack/react-table'
import { formatCurrency } from '@/shared/lib/format'
import type { Service } from '@/shared/types/api'
import { DataTableColumnHeader } from '@/shared/ui-kit/data-table'
import { Badge } from '@/shared/ui/badge'
import { Checkbox } from '@/shared/ui/checkbox'
import { Paintbrush, Sparkles, type LucideIcon } from 'lucide-react'
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
      const iconName = row.original.iconName
      const color = row.original.color

      let IconComponent: LucideIcon | null = null
      if (iconName === 'paintbrush') {
        IconComponent = Paintbrush
      } else if (iconName === 'sparkles') {
        IconComponent = Sparkles
      }

      return (
        <div className='flex items-center gap-2'>
          {IconComponent && (
            <div
              className='flex size-8 items-center justify-center rounded-md'
              style={{ backgroundColor: color || '#3B82F6' }}
            >
              <IconComponent className='size-4 text-white' />
            </div>
          )}
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
    accessorKey: 'estimatedDuration',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='소요 시간' />
    ),
    cell: ({ row }) => {
      const duration = row.getValue('estimatedDuration') as number
      const hours = Math.floor(duration / 60)
      const minutes = duration % 60
      return (
        <span>
          {hours > 0 && `${hours}시간 `}
          {minutes > 0 && `${minutes}분`}
        </span>
      )
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
      const regions = (row.getValue('serviceableRegions') as string[]) || []

      if (regions.length === 0) {
        return <span className='text-muted-foreground'>-</span>
      }

      return (
        <div className='flex flex-wrap gap-1'>
          {regions.slice(0, 2).map((region) => (
            <Badge key={region} variant='outline'>
              {region}
            </Badge>
          ))}
          {regions.length > 2 && (
            <Badge variant='outline'>+{regions.length - 2}개</Badge>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'travelFees',
    header: '출장비',
    cell: ({ row }) => {
      const fees = row.original.travelFees || []
      if (fees.length === 0)
        return <span className='text-muted-foreground'>미설정</span>
      const minFee = Math.min(...fees.map((f) => f.fee))
      const maxFee = Math.max(...fees.map((f) => f.fee))
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
    accessorKey: 'displayOrder',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='표시 순서' />
    ),
    cell: ({ row }) => {
      const order = row.getValue('displayOrder') as number | null
      return order !== null ? order : '-'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
