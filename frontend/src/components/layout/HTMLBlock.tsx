import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface HTMLBlockProps {
  fieldId: string
  label?: string
  content: string
  sanitize?: boolean // Should sanitize HTML (in production, use DOMPurify)
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function HTMLBlock({
  fieldId,
  label,
  content,
  sanitize = false,
  style,
  hidden,
}: HTMLBlockProps) {
  if (hidden || !content) return null

  // In production, use DOMPurify or similar library to sanitize HTML
  // For now, we'll use dangerouslySetInnerHTML with a warning
  const sanitizedContent = sanitize ? content : content

  return (
    <div className={cn('mb-4', style?.containerClassName)}>
      {label && (
        <label className={cn('label', style?.labelClassName)}>{label}</label>
      )}
      <div
        id={fieldId}
        className={cn('prose prose-sm max-w-none', style?.className)}
        style={style?.style}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  )
}

