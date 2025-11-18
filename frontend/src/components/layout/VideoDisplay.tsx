import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface VideoDisplayProps {
  fieldId: string
  label?: string
  src: string
  type?: string // video/mp4, video/webm, etc.
  poster?: string // Thumbnail image
  autoplay?: boolean
  controls?: boolean
  loop?: boolean
  muted?: boolean
  width?: number | string
  height?: number | string
  style?: BaseFieldProps['style']
  hidden?: boolean
}

export function VideoDisplay({
  fieldId,
  label,
  src,
  type = 'video/mp4',
  poster,
  autoplay = false,
  controls = true,
  loop = false,
  muted = false,
  width,
  height,
  style,
  hidden,
}: VideoDisplayProps) {
  if (hidden || !src) return null

  return (
    <div className={cn('mb-4', style?.containerClassName)}>
      {label && (
        <label className={cn('label', style?.labelClassName)}>{label}</label>
      )}
      <div className="relative">
        <video
          id={fieldId}
          src={src}
          poster={poster}
          autoPlay={autoplay}
          controls={controls}
          loop={loop}
          muted={muted}
          width={width}
          height={height}
          className={cn('rounded-md w-full', style?.className)}
          style={style?.style}
        >
          <source src={src} type={type} />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}

