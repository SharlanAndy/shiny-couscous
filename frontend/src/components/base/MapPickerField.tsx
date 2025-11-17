import React, { useState, useEffect, useRef } from 'react'
import { BaseFieldProps } from '@/types'
import { cn } from '@/lib/utils'

export interface MapPickerFieldProps extends BaseFieldProps {
  fieldType: 'map-picker' | 'location-picker'
  value?: { lat: number; lng: number; address?: string }
  defaultValue?: { lat: number; lng: number; address?: string }
  defaultCenter?: { lat: number; lng: number }
  zoom?: number
  height?: number
}

export function MapPickerField({
  fieldId,
  fieldName,
  fieldType,
  label,
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  required,
  disabled,
  readonly,
  hidden,
  helpText,
  tooltip,
  validation,
  error,
  style,
  defaultCenter = { lat: 4.8895, lng: 115.2386 }, // Labuan, Malaysia
  zoom = 13,
  height = 400,
  className,
}: MapPickerFieldProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [address, setAddress] = useState<string>('')

  // Get field value
  const mapValue = value ?? defaultValue ?? defaultCenter

  // Reverse geocoding (simplified - in production use Google Maps Geocoding API)
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      // In production, use Google Maps Geocoding API
      // For now, return coordinates
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
      console.error('Geocoding error:', error)
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  // Initialize map (simplified - in production use Google Maps or Mapbox)
  useEffect(() => {
    if (!mapContainerRef.current || map) return

    // In production, initialize Google Maps or Mapbox here
    // For now, show a placeholder with click handler
    const handleMapClick = async (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || readonly) return

      const rect = mapContainerRef.current?.getBoundingClientRect()
      if (!rect) return

      // Calculate coordinates from click position (simplified)
      // In production, use map API to get actual coordinates
      const lat = defaultCenter.lat + ((e.clientY - rect.top) / rect.height - 0.5) * 0.01
      const lng = defaultCenter.lng + ((e.clientX - rect.left) / rect.width - 0.5) * 0.01

      const newValue = { lat, lng }
      const newAddress = await getAddressFromCoordinates(lat, lng)

      onChange({ ...newValue, address: newAddress })
      setAddress(newAddress)
    }

    // Set up click handler
    mapContainerRef.current.addEventListener('click', handleMapClick as any)

    return () => {
      // Cleanup
      if (mapContainerRef.current) {
        mapContainerRef.current.removeEventListener('click', handleMapClick as any)
      }
    }
  }, [map, disabled, readonly, defaultCenter, onChange])

  // Update address when value changes
  useEffect(() => {
    if (mapValue.lat && mapValue.lng) {
      getAddressFromCoordinates(mapValue.lat, mapValue.lng).then(setAddress)
    }
  }, [mapValue.lat, mapValue.lng])

  // Merge styles
  const containerClassName = cn('mb-4', style?.containerClassName)
  const mapClassName = cn(
    'w-full border border-gray-300 rounded-md bg-gray-100 relative cursor-pointer',
    disabled && 'opacity-50 cursor-not-allowed',
    readonly && 'cursor-default',
    style?.className,
    className
  )

  if (hidden) {
    return null
  }

  return (
    <div className={containerClassName}>
      <label
        htmlFor={fieldId}
        className={cn('label', required && 'label-required', style?.labelClassName)}
      >
        {label}
        {tooltip && (
          <span className="ml-1 text-gray-400" title={tooltip}>
            ℹ️
          </span>
        )}
      </label>

      {/* Map placeholder (in production, use Google Maps or Mapbox) */}
      <div
        ref={mapContainerRef}
        id={fieldId}
        className={mapClassName}
        style={{ height: `${height}px`, ...style?.style }}
        onClick={(e) => {
          if (disabled || readonly) return
          // Handle click (simplified)
          if (onFocus) onFocus()
        }}
        onBlur={onBlur}
        onFocus={onFocus}
        role="application"
        aria-label="Map picker"
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      >
        {/* Map placeholder */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🗺️</div>
            <div className="text-sm">
              {disabled || readonly ? 'Map (read-only)' : 'Click on map to select location'}
            </div>
            {mapValue.lat && mapValue.lng && (
              <div className="text-xs mt-2">
                {mapValue.lat.toFixed(6)}, {mapValue.lng.toFixed(6)}
              </div>
            )}
          </div>
        </div>

        {/* Marker (if position selected) */}
        {mapValue.lat && mapValue.lng && (
          <div
            className="absolute w-6 h-6 bg-primary rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: '50%',
              top: '50%',
            }}
            aria-label="Selected location"
          />
        )}
      </div>

      {/* Address display */}
      {(address || mapValue.address) && (
        <div className="mt-2 p-2 bg-gray-50 rounded-md text-sm text-gray-700">
          <span className="font-medium">Address: </span>
          <span>{address || mapValue.address}</span>
        </div>
      )}

      {/* Coordinates input (editable) */}
      {!readonly && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${fieldId}-lat`} className="label text-sm">
              Latitude
            </label>
            <input
              id={`${fieldId}-lat`}
              name={`${fieldName}[lat]`}
              type="number"
              step="any"
              value={mapValue.lat || ''}
              onChange={(e) => {
                const lat = parseFloat(e.target.value)
                onChange({ ...mapValue, lat })
              }}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={disabled}
              className="input"
              placeholder="4.8895"
            />
          </div>
          <div>
            <label htmlFor={`${fieldId}-lng`} className="label text-sm">
              Longitude
            </label>
            <input
              id={`${fieldId}-lng`}
              name={`${fieldName}[lng]`}
              type="number"
              step="any"
              value={mapValue.lng || ''}
              onChange={(e) => {
                const lng = parseFloat(e.target.value)
                onChange({ ...mapValue, lng })
              }}
              onBlur={onBlur}
              onFocus={onFocus}
              disabled={disabled}
              className="input"
              placeholder="115.2386"
            />
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={fieldId}
        name={fieldName}
        value={JSON.stringify(mapValue)}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : helpText ? `${fieldId}-help` : undefined}
      />

      {error && (
        <p id={`${fieldId}-error`} className="error-message mt-1" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${fieldId}-help`} className="help-text">
          {helpText}
        </p>
      )}
    </div>
  )
}

