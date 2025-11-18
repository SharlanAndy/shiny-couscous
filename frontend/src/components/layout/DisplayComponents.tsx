import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

/**
 * Divider component - Visual divider/separator
 */
export interface DividerProps {
  fieldId?: string
  label?: string
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function Divider({ fieldId, label, style, hidden }: DividerProps) {
  if (hidden) return null

  return (
    <div className={cn('my-6', style?.containerClassName)}>
      {label && (
        <div className="flex items-center">
          <span className="px-4 text-sm font-medium text-gray-500 bg-white">{label}</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>
      )}
      {!label && <div className="border-t border-gray-300" />}
    </div>
  )
}

/**
 * Spacer component - Empty space for layout
 */
export interface SpacerProps {
  fieldId?: string
  height?: number
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function Spacer({ fieldId, height = 16, style, hidden }: SpacerProps) {
  if (hidden) return null

  return (
    <div
      className={cn('w-full', style?.containerClassName)}
      style={{ height: `${height}px`, ...style?.style }}
      aria-hidden="true"
    />
  )
}

/**
 * Heading component - Form section heading
 */
export interface HeadingProps {
  fieldId: string
  label: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function Heading({ fieldId, label, level = 2, style, hidden }: HeadingProps) {
  if (hidden) return null

  const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements

  const levelClasses = {
    1: 'text-4xl font-bold text-gray-900',
    2: 'text-3xl font-bold text-gray-900',
    3: 'text-2xl font-semibold text-gray-900',
    4: 'text-xl font-semibold text-gray-800',
    5: 'text-lg font-semibold text-gray-800',
    6: 'text-base font-semibold text-gray-800',
  }

  return (
    <HeadingTag
      id={fieldId}
      className={cn('mb-4', levelClasses[level], style?.className)}
      style={style?.style}
    >
      {label}
    </HeadingTag>
  )
}

/**
 * TextBlock component - Static text display
 */
export interface TextBlockProps {
  fieldId: string
  label?: string
  content: string
  html?: boolean
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function TextBlock({ fieldId, label, content, html = false, style, hidden }: TextBlockProps) {
  if (hidden) return null

  return (
    <div className={cn('mb-4', style?.containerClassName)}>
      {label && (
        <label className={cn('label', style?.labelClassName)}>{label}</label>
      )}
      <div
        className={cn('text-sm text-gray-700', style?.className)}
        style={style?.style}
        dangerouslySetInnerHTML={html ? { __html: content } : undefined}
      >
        {!html && content}
      </div>
    </div>
  )
}

/**
 * ImageDisplay component - Image display
 */
export interface ImageDisplayProps {
  fieldId: string
  label?: string
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function ImageDisplay({
  fieldId,
  label,
  src,
  alt = '',
  width,
  height,
  style,
  hidden,
}: ImageDisplayProps) {
  if (hidden) return null

  return (
    <div className={cn('mb-4', style?.containerClassName)}>
      {label && (
        <label className={cn('label', style?.labelClassName)}>{label}</label>
      )}
      <img
        id={fieldId}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn('rounded-md', style?.className)}
        style={style?.style}
      />
    </div>
  )
}

/**
 * ConditionalBlock component - Conditional display block
 */
export interface ConditionalBlockProps {
  fieldId: string
  condition: boolean
  children: React.ReactNode
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function ConditionalBlock({
  fieldId,
  condition,
  children,
  style,
  hidden,
}: ConditionalBlockProps) {
  if (hidden || !condition) return null

  return (
    <div id={fieldId} className={cn('mb-4', style?.containerClassName)} style={style?.style}>
      {children}
    </div>
  )
}

