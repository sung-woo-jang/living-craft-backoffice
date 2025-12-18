'use client'

import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as Slider from '@radix-ui/react-slider'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import Color from 'color'
import { PipetteIcon } from 'lucide-react'

interface ColorPickerContextValue {
  hue: number
  saturation: number
  lightness: number
  alpha: number
  mode: string
  setHue: (hue: number) => void
  setSaturation: (saturation: number) => void
  setLightness: (lightness: number) => void
  setAlpha: (alpha: number) => void
  setMode: (mode: string) => void
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(
  undefined
)

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext)
  if (!context) {
    throw new Error('useColorPicker must be used within a ColorPickerProvider')
  }
  return context
}

export type ColorPickerProps = HTMLAttributes<HTMLDivElement> & {
  value?: Parameters<typeof Color>[0]
  defaultValue?: Parameters<typeof Color>[0]
  onChange?: (value: string) => void
}

export const ColorPicker = ({
  value,
  defaultValue = '#000000',
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const selectedColor = value ? Color(value) : Color(defaultValue)
  const defaultColorObj = Color(defaultValue)

  const [hue, setHue] = useState(
    selectedColor.hue() || defaultColorObj.hue() || 0
  )
  const [saturation, setSaturation] = useState(
    selectedColor.saturationl() || defaultColorObj.saturationl() || 100
  )
  const [lightness, setLightness] = useState(
    selectedColor.lightness() || defaultColorObj.lightness() || 50
  )
  const [alpha, setAlpha] = useState(
    selectedColor.alpha() * 100 || defaultColorObj.alpha() * 100
  )
  const [mode, setMode] = useState('hex')

  // Update color when controlled value changes
  useEffect(() => {
    if (value) {
      const color = Color(value)
      const [h, s, l] = color.hsl().array()
      setHue(h)
      setSaturation(s)
      setLightness(l)
      setAlpha(color.alpha() * 100)
    }
  }, [value])

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      const color = Color.hsl(hue, saturation, lightness).alpha(alpha / 100)
      onChange(color.hex())
    }
  }, [hue, saturation, lightness, alpha, onChange])

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div
        className={cn('flex size-full flex-col gap-4', className)}
        {...(props as any)}
      />
    </ColorPickerContext.Provider>
  )
}

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerSelection = memo(
  ({ className, ...props }: ColorPickerSelectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [positionX, setPositionX] = useState(0)
    const [positionY, setPositionY] = useState(0)

    const { hue, saturation, lightness, alpha, setSaturation, setLightness } =
      useColorPicker()

    const backgroundGradient = useMemo(() => {
      return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`
    }, [hue])

    const currentColor = useMemo(() => {
      return Color.hsl(hue, saturation, lightness)
        .alpha(alpha / 100)
        .hex()
    }, [hue, saturation, lightness, alpha])

    const handlePointerMove = useCallback(
      (event: PointerEvent) => {
        if (!(isDragging && containerRef.current)) {
          return
        }

        const rect = containerRef.current.getBoundingClientRect()
        const x = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width)
        )
        const y = Math.max(
          0,
          Math.min(1, (event.clientY - rect.top) / rect.height)
        )

        setPositionX(x)
        setPositionY(y)
        setSaturation(x * 100)

        const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x)
        const lightness = topLightness * (1 - y)
        setLightness(lightness)
      },
      [isDragging, setSaturation, setLightness]
    )

    useEffect(() => {
      const handlePointerUp = () => setIsDragging(false)

      if (isDragging) {
        window.addEventListener('pointermove', handlePointerMove)
        window.addEventListener('pointerup', handlePointerUp)
      }

      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }, [isDragging, handlePointerMove])

    return (
      <div
        className={cn('relative size-full cursor-crosshair rounded', className)}
        onPointerDown={(e) => {
          e.preventDefault()
          setIsDragging(true)
          handlePointerMove(e.nativeEvent)
        }}
        ref={containerRef}
        style={{
          background: backgroundGradient,
        }}
        {...(props as any)}
      >
        {/* 왼쪽 상단 현재 색상 프리뷰 */}
        <div
          className='pointer-events-none absolute top-2.5 left-2.5 h-6 w-6 rounded-full border-2 border-white shadow-md'
          style={{ backgroundColor: currentColor }}
        />

        {/* 선택 인디케이터 */}
        <div
          className='pointer-events-none absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white'
          style={{
            left: `${positionX * 100}%`,
            top: `${positionY * 100}%`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    )
  }
)

ColorPickerSelection.displayName = 'ColorPickerSelection'

export type ColorPickerHueProps = ComponentProps<typeof Slider.Root>

export const ColorPickerHue = ({
  className,
  ...props
}: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker()

  return (
    <Slider.Root
      className={cn('relative flex h-4 w-full touch-none', className)}
      max={360}
      onValueChange={([hue]) => setHue(hue)}
      step={1}
      value={[hue]}
      {...(props as any)}
    >
      <Slider.Track className='relative my-0.5 h-3 w-full grow rounded-full bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]'>
        <Slider.Range className='absolute h-full' />
      </Slider.Track>
      <Slider.Thumb className='border-primary/50 bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50' />
    </Slider.Root>
  )
}

export type ColorPickerAlphaProps = ComponentProps<typeof Slider.Root>

export const ColorPickerAlpha = ({
  className,
  ...props
}: ColorPickerAlphaProps) => {
  const { alpha, setAlpha } = useColorPicker()

  return (
    <Slider.Root
      className={cn('relative flex h-4 w-full touch-none', className)}
      max={100}
      onValueChange={([alpha]) => setAlpha(alpha)}
      step={1}
      value={[alpha]}
      {...(props as any)}
    >
      <Slider.Track
        className='relative my-0.5 h-3 w-full grow rounded-full'
        style={{
          background:
            'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==") left center',
        }}
      >
        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-transparent to-black/50' />
        <Slider.Range className='absolute h-full rounded-full bg-transparent' />
      </Slider.Track>
      <Slider.Thumb className='border-primary/50 bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50' />
    </Slider.Root>
  )
}

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>

export const ColorPickerEyeDropper = ({
  className,
  ...props
}: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker()

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper()
      const result = await eyeDropper.open()
      const color = Color(result.sRGBHex)
      const [h, s, l] = color.hsl().array()
      setHue(h)
      setSaturation(s)
      setLightness(l)
      setAlpha(100)
    } catch (error) {
      console.error('EyeDropper failed:', error)
    }
  }

  return (
    <Button
      className={cn('text-muted-foreground shrink-0', className)}
      onClick={handleEyeDropper}
      size='icon'
      variant='outline'
      type='button'
      {...(props as any)}
    >
      <PipetteIcon size={16} />
    </Button>
  )
}

export type ColorPickerOutputProps = ComponentProps<typeof SelectTrigger>

const formats = ['hex', 'rgb', 'css', 'hsl']

export const ColorPickerOutput = ({
  className,
  ...props
}: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker()

  return (
    <Select onValueChange={setMode} value={mode}>
      <SelectTrigger className='h-8 w-20 shrink-0 text-xs' {...(props as any)}>
        <SelectValue placeholder='Mode' />
      </SelectTrigger>
      <SelectContent>
        {formats.map((format) => (
          <SelectItem className='text-xs' key={format} value={format}>
            {format.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type PercentageInputProps = ComponentProps<typeof Input>

const PercentageInput = ({ className, ...props }: PercentageInputProps) => {
  return (
    <div className='relative'>
      <Input
        readOnly
        type='text'
        {...(props as any)}
        className={cn(
          'bg-secondary h-8 w-[3.25rem] rounded-l-none px-2 text-xs shadow-none',
          className
        )}
      />
      <span className='text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs'>
        %
      </span>
    </div>
  )
}

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>

export const ColorPickerFormat = ({
  className,
  ...props
}: ColorPickerFormatProps) => {
  const { hue, saturation, lightness, alpha, mode, setHue, setSaturation, setLightness, setAlpha } = useColorPicker()
  const color = Color.hsl(hue, saturation, lightness, alpha / 100)

  if (mode === 'hex') {
    const hex = color.hex()

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      try {
        const parsedColor = Color(value)
        const [h, s, l] = parsedColor.hsl().array()
        setHue(h)
        setSaturation(s)
        setLightness(l)
      } catch {
        // 유효하지 않은 색상 값은 무시
      }
    }

    const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value)
      if (!isNaN(value) && value >= 0 && value <= 100) {
        setAlpha(value)
      }
    }

    return (
      <div
        className={cn(
          'relative flex w-full items-center -space-x-px rounded-md shadow-sm',
          className
        )}
        {...(props as any)}
      >
        <Input
          className='bg-secondary h-8 rounded-r-none px-2 text-xs shadow-none'
          type='text'
          value={hex}
          onChange={handleHexChange}
          placeholder='#000000'
        />
        <div className='relative'>
          <Input
            type='number'
            min={0}
            max={100}
            step={1}
            value={Math.round(alpha)}
            onChange={handleAlphaChange}
            className={cn(
              'bg-secondary h-8 w-[3.25rem] rounded-l-none px-2 text-xs shadow-none'
            )}
          />
          <span className='text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs pointer-events-none'>
            %
          </span>
        </div>
      </div>
    )
  }

  if (mode === 'rgb') {
    const rgb = color
      .rgb()
      .array()
      .map((value) => Math.round(value))

    const handleRgbChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10)
      if (isNaN(value) || value < 0 || value > 255) return

      const newRgb = [...rgb]
      newRgb[index] = value

      try {
        const parsedColor = Color.rgb(newRgb)
        const [h, s, l] = parsedColor.hsl().array()
        setHue(h)
        setSaturation(s)
        setLightness(l)
      } catch {
        // 유효하지 않은 색상 값은 무시
      }
    }

    const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value)
      if (!isNaN(value) && value >= 0 && value <= 100) {
        setAlpha(value)
      }
    }

    return (
      <div
        className={cn(
          'flex items-center -space-x-px rounded-md shadow-sm',
          className
        )}
        {...(props as any)}
      >
        {rgb.map((value, index) => (
          <Input
            className={cn(
              'bg-secondary h-8 rounded-r-none px-2 text-xs shadow-none',
              index && 'rounded-l-none',
              className
            )}
            key={index}
            type='number'
            min={0}
            max={255}
            step={1}
            value={value}
            onChange={(e) => handleRgbChange(index, e)}
          />
        ))}
        <div className='relative'>
          <Input
            type='number'
            min={0}
            max={100}
            step={1}
            value={Math.round(alpha)}
            onChange={handleAlphaChange}
            className={cn(
              'bg-secondary h-8 w-[3.25rem] rounded-l-none px-2 text-xs shadow-none'
            )}
          />
          <span className='text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs pointer-events-none'>
            %
          </span>
        </div>
      </div>
    )
  }

  if (mode === 'css') {
    const rgb = color
      .rgb()
      .array()
      .map((value) => Math.round(value))
    return (
      <div
        className={cn('w-full rounded-md shadow-sm', className)}
        {...(props as any)}
      >
        <Input
          className='bg-secondary h-8 w-full px-2 text-xs shadow-none'
          readOnly
          type='text'
          value={`rgba(${rgb.join(', ')}, ${alpha}%)`}
          {...(props as any)}
        />
      </div>
    )
  }

  if (mode === 'hsl') {
    const hsl = color
      .hsl()
      .array()
      .map((value) => Math.round(value))

    const handleHslChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value)
      if (isNaN(value)) return

      const newHsl = [...hsl]
      newHsl[index] = value

      // H: 0-360, S/L: 0-100
      if (index === 0 && (value < 0 || value > 360)) return
      if (index > 0 && (value < 0 || value > 100)) return

      if (index === 0) setHue(value)
      if (index === 1) setSaturation(value)
      if (index === 2) setLightness(value)
    }

    const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value)
      if (!isNaN(value) && value >= 0 && value <= 100) {
        setAlpha(value)
      }
    }

    return (
      <div
        className={cn(
          'flex items-center -space-x-px rounded-md shadow-sm',
          className
        )}
        {...(props as any)}
      >
        {hsl.map((value, index) => (
          <Input
            className={cn(
              'bg-secondary h-8 rounded-r-none px-2 text-xs shadow-none',
              index && 'rounded-l-none',
              className
            )}
            key={index}
            type='number'
            min={0}
            max={index === 0 ? 360 : 100}
            step={1}
            value={value}
            onChange={(e) => handleHslChange(index, e)}
          />
        ))}
        <div className='relative'>
          <Input
            type='number'
            min={0}
            max={100}
            step={1}
            value={Math.round(alpha)}
            onChange={handleAlphaChange}
            className={cn(
              'bg-secondary h-8 w-[3.25rem] rounded-l-none px-2 text-xs shadow-none'
            )}
          />
          <span className='text-muted-foreground absolute top-1/2 right-2 -translate-y-1/2 text-xs pointer-events-none'>
            %
          </span>
        </div>
      </div>
    )
  }

  return null
}
