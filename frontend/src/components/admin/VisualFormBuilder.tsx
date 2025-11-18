import React, { useState, useCallback, useEffect } from 'react'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, DragOverEvent, useDraggable } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDroppable } from '@dnd-kit/core'
import { FormField, FormStep, FormSchemaResponse } from '@/types'
import { cn } from '@/lib/utils'
import { FieldPropertyEditor } from './FieldPropertyEditor'
import { FormRenderer } from '@/components/forms/FormRenderer'

interface VisualFormBuilderProps {
  initialSchema?: FormSchemaResponse
  onChange: (schema: FormSchemaResponse) => void
}

interface DraggableField {
  id: string
  type: string
  name: string
  icon: string
  category: string
}

// Available field types organized by category
const FIELD_TYPES: DraggableField[] = [
  // Text Inputs
  { id: 'input-text', type: 'input-text', name: 'Text Input', icon: '📝', category: 'Input' },
  { id: 'input-email', type: 'input-email', name: 'Email', icon: '✉️', category: 'Input' },
  { id: 'input-password', type: 'input-password', name: 'Password', icon: '🔒', category: 'Input' },
  { id: 'input-number', type: 'input-number', name: 'Number', icon: '🔢', category: 'Input' },
  { id: 'input-tel', type: 'input-tel', name: 'Phone', icon: '📞', category: 'Input' },
  { id: 'input-url', type: 'input-url', name: 'URL', icon: '🔗', category: 'Input' },
  { id: 'textarea', type: 'textarea', name: 'Textarea', icon: '📄', category: 'Input' },
  
  // Selection
  { id: 'select', type: 'select', name: 'Dropdown', icon: '📋', category: 'Selection' },
  { id: 'radio', type: 'radio', name: 'Radio Button', icon: '🔘', category: 'Selection' },
  { id: 'checkbox', type: 'checkbox', name: 'Checkbox', icon: '☑️', category: 'Selection' },
  { id: 'toggle', type: 'toggle', name: 'Toggle', icon: '🔀', category: 'Selection' },
  
  // Date & Time
  { id: 'date', type: 'date', name: 'Date Picker', icon: '📅', category: 'Date & Time' },
  { id: 'time', type: 'time', name: 'Time Picker', icon: '⏰', category: 'Date & Time' },
  { id: 'datetime', type: 'datetime', name: 'Date & Time', icon: '📆', category: 'Date & Time' },
  
  // File Uploads
  { id: 'file-upload', type: 'file-upload', name: 'File Upload', icon: '📎', category: 'Upload' },
  { id: 'upload-image', type: 'upload-image', name: 'Image Upload', icon: '🖼️', category: 'Upload' },
  { id: 'upload-video', type: 'upload-video', name: 'Video Upload', icon: '🎥', category: 'Upload' },
  { id: 'upload-document', type: 'upload-document', name: 'Document Upload', icon: '📑', category: 'Upload' },
  
  // Advanced
  { id: 'currency', type: 'currency', name: 'Currency', icon: '💰', category: 'Advanced' },
  { id: 'address', type: 'address', name: 'Address', icon: '📍', category: 'Advanced' },
  { id: 'signature', type: 'signature', name: 'Signature', icon: '✍️', category: 'Advanced' },
  { id: 'rating', type: 'rating', name: 'Rating', icon: '⭐', category: 'Advanced' },
  { id: 'slider', type: 'slider', name: 'Slider', icon: '🎚️', category: 'Advanced' },
  
  // Layout
  { id: 'divider', type: 'divider', name: 'Divider', icon: '➖', category: 'Layout' },
  { id: 'heading', type: 'heading', name: 'Heading', icon: '📌', category: 'Layout' },
  { id: 'text-block', type: 'text-block', name: 'Text Block', icon: '📝', category: 'Layout' },
  { id: 'help-text', type: 'help-text', name: 'Help Text', icon: 'ℹ️', category: 'Layout' },
  
  // Complex
  { id: 'repeater', type: 'repeater', name: 'Repeater', icon: '🔄', category: 'Complex' },
  { id: 'table', type: 'table', name: 'Table', icon: '📊', category: 'Complex' },
  { id: 'tabs', type: 'tabs', name: 'Tabs', icon: '📑', category: 'Complex' },
]

const CATEGORIES = ['Input', 'Selection', 'Date & Time', 'Upload', 'Advanced', 'Layout', 'Complex']

export function VisualFormBuilder({ initialSchema, onChange }: VisualFormBuilderProps) {
  const [schema, setSchema] = useState<FormSchemaResponse>(
    initialSchema || {
      formId: 'new-form',
      formName: 'New Form',
      version: '1.0.0',
      steps: [
        {
          stepId: 'step-1',
          stepName: 'Step 1',
          stepOrder: 0,
          fields: [],
        },
      ],
    }
  )
  const [selectedField, setSelectedField] = useState<{ stepIndex: number; fieldIndex: number } | null>(null)
  const [selectedStep, setSelectedStep] = useState<number>(0)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedFieldType, setDraggedFieldType] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts - allows clicks to work
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Generate unique field ID
  const generateFieldId = (fieldType: string, stepIndex: number): string => {
    const step = schema.steps[stepIndex]
    const existingFields = step.fields.filter((f) => f.fieldType === fieldType)
    return `${fieldType}-${stepIndex}-${existingFields.length + 1}`
  }

  // Generate unique field name
  const generateFieldName = (fieldType: string, stepIndex: number): string => {
    const step = schema.steps[stepIndex]
    const existingFields = step.fields.filter((f) => f.fieldType === fieldType)
    const baseName = fieldType.replace(/^input-/, '').replace(/-/g, '_')
    return existingFields.length > 0 ? `${baseName}_${existingFields.length + 1}` : baseName
  }

  // Create default field based on type
  const createDefaultField = (fieldType: string, stepIndex: number): FormField => {
    const fieldId = generateFieldId(fieldType, stepIndex)
    const fieldName = generateFieldName(fieldType, stepIndex)
    // Get field type info for default label
    const fieldTypeInfo = FIELD_TYPES.find((f) => f.type === fieldType)
    const defaultLabel = fieldTypeInfo?.name || fieldType

    const baseField: FormField = {
      fieldId,
      fieldType,
      fieldName,
      label: defaultLabel,
      required: false,
      disabled: false,
      readonly: false,
      hidden: false,
    }

    // Add type-specific defaults
    if (['select', 'radio', 'checkbox'].includes(fieldType)) {
      return {
        ...baseField,
        options: [
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ],
      } as FormField
    }

    if (fieldType === 'file-upload' || fieldType.startsWith('upload-')) {
      return {
        ...baseField,
        multiple: false,
        accept: fieldType === 'upload-image' ? ['image/*'] : fieldType === 'upload-video' ? ['video/*'] : [],
      } as FormField
    }

    return baseField
  }

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    const fieldType = event.active.data.current?.fieldType
    if (fieldType) {
      setDraggedFieldType(fieldType)
    } else {
      // Try to find field type from FIELD_TYPES
      const field = FIELD_TYPES.find((f) => f.id === event.active.id)
      if (field) {
        setDraggedFieldType(field.type)
      }
    }
  }

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      setDraggedFieldType(null)
      return
    }

    // Check if dragging from palette to form
    if (active.data.current?.fromPalette) {
      const fieldType = active.data.current.fieldType
      let stepIndex = selectedStep

      // Try to get step index from drop zone
      if (over.id.toString().startsWith('step-')) {
        stepIndex = parseInt(over.id.toString().replace('step-', ''))
      } else if (over.id.toString().startsWith('drop-zone-')) {
        stepIndex = parseInt(over.id.toString().replace('drop-zone-', ''))
      } else if (over.id.toString().startsWith('field-')) {
        // If dropped on a field, insert after it
        const fieldIndex = parseInt(over.id.toString().replace('field-', ''))
        const newField = createDefaultField(fieldType, selectedStep)
        const newSteps = [...schema.steps]
        newSteps[selectedStep] = {
          ...newSteps[selectedStep],
          fields: [
            ...newSteps[selectedStep].fields.slice(0, fieldIndex + 1),
            newField,
            ...newSteps[selectedStep].fields.slice(fieldIndex + 1),
          ],
        }
        const newSchema = { ...schema, steps: newSteps }
        setSchema(newSchema)
        onChange(newSchema)
        setSelectedField({ stepIndex: selectedStep, fieldIndex: fieldIndex + 1 })
        setActiveId(null)
        setDraggedFieldType(null)
        return
      }

      const newField = createDefaultField(fieldType, stepIndex)
      const newSteps = [...schema.steps]
      newSteps[stepIndex] = {
        ...newSteps[stepIndex],
        fields: [...newSteps[stepIndex].fields, newField],
      }

      const newSchema = { ...schema, steps: newSteps }
      setSchema(newSchema)
      onChange(newSchema)
      setSelectedField({ stepIndex, fieldIndex: newSteps[stepIndex].fields.length - 1 })
    } else if (active.id.toString().startsWith('field-') && over.id.toString().startsWith('field-')) {
      // Reordering fields within step
      const activeFieldIndex = parseInt(active.id.toString().replace('field-', ''))
      const overFieldIndex = parseInt(over.id.toString().replace('field-', ''))

      if (activeFieldIndex !== overFieldIndex) {
        const newSteps = [...schema.steps]
        const stepFields = [...newSteps[selectedStep].fields]
        newSteps[selectedStep] = {
          ...newSteps[selectedStep],
          fields: arrayMove(stepFields, activeFieldIndex, overFieldIndex),
        }

        const newSchema = { ...schema, steps: newSteps }
        setSchema(newSchema)
        onChange(newSchema)
        setSelectedField({ stepIndex: selectedStep, fieldIndex: overFieldIndex })
      }
    }

    setActiveId(null)
    setDraggedFieldType(null)
  }

  // Handle field property update
  const handleFieldUpdate = (updatedField: FormField) => {
    if (!selectedField) return

    const newSteps = [...schema.steps]
    newSteps[selectedField.stepIndex].fields[selectedField.fieldIndex] = updatedField

    const newSchema = { ...schema, steps: newSteps }
    setSchema(newSchema)
    onChange(newSchema)
  }

  // Handle step update
  const handleStepUpdate = (stepIndex: number, updates: Partial<FormStep>) => {
    const newSteps = [...schema.steps]
    newSteps[stepIndex] = { ...newSteps[stepIndex], ...updates }

    const newSchema = { ...schema, steps: newSteps }
    setSchema(newSchema)
    onChange(newSchema)
  }

  // Add new step
  const handleAddStep = () => {
    const newStep: FormStep = {
      stepId: `step-${schema.steps.length + 1}`,
      stepName: `Step ${schema.steps.length + 1}`,
      stepOrder: schema.steps.length,
      fields: [],
    }
    const newSchema = { ...schema, steps: [...schema.steps, newStep] }
    setSchema(newSchema)
    onChange(newSchema)
    setSelectedStep(schema.steps.length)
  }

  // Delete field
  const handleDeleteField = (stepIndex: number, fieldIndex: number) => {
    const newSteps = [...schema.steps]
    newSteps[stepIndex].fields.splice(fieldIndex, 1)
    const newSchema = { ...schema, steps: newSteps }
    setSchema(newSchema)
    onChange(newSchema)
    setSelectedField(null)
  }

  // Delete step
  const handleDeleteStep = (stepIndex: number) => {
    if (schema.steps.length <= 1) {
      alert('Cannot delete the last step')
      return
    }

    const newSteps = schema.steps.filter((_, i) => i !== stepIndex)
    const newSchema = { ...schema, steps: newSteps }
    setSchema(newSchema)
    onChange(newSchema)
    if (selectedStep >= newSteps.length) {
      setSelectedStep(newSteps.length - 1)
    }
  }

  const currentStep = schema.steps[selectedStep]
  const selectedFieldData = selectedField ? schema.steps[selectedField.stepIndex]?.fields[selectedField.fieldIndex] : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-[calc(100vh-200px)] gap-4">
        {/* Field Palette */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Field Types</h3>
            {CATEGORIES.map((category) => {
              const categoryFields = FIELD_TYPES.filter((f) => f.category === category)
              return (
                <div key={category} className="mb-6">
                  <h4 className="text-xs font-medium text-gray-600 mb-2 uppercase">{category}</h4>
                  <div className="space-y-1">
                    {categoryFields.map((field) => (
                      <DraggableFieldItem
                        key={field.id}
                        id={field.id}
                        field={field}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
        </div>

        {/* Form Builder Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Steps Tabs */}
          <div className="border-b border-gray-200 bg-white p-2 flex items-center gap-2 overflow-x-auto">
            {schema.steps.map((step, index) => (
              <button
                key={step.stepId}
                onClick={() => {
                  setSelectedStep(index)
                  setSelectedField(null)
                }}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap',
                  selectedStep === index
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {step.stepName}
              </button>
            ))}
            <button
              onClick={handleAddStep}
              className="px-4 py-2 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap"
            >
              + Add Step
            </button>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
            {/* Form Canvas */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Step Header Editor */}
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <input
                    type="text"
                    value={currentStep.stepName}
                    onChange={(e) => handleStepUpdate(selectedStep, { stepName: e.target.value })}
                    className="text-lg font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 w-full"
                    placeholder="Step Name"
                  />
                  <textarea
                    value={currentStep.stepDescription || ''}
                    onChange={(e) => handleStepUpdate(selectedStep, { stepDescription: e.target.value })}
                    className="mt-2 text-sm text-gray-600 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1 w-full resize-none"
                    placeholder="Step Description (optional)"
                    rows={2}
                  />
                  <div className="flex items-center justify-end gap-2 mt-2">
                    {schema.steps.length > 1 && (
                      <button
                        onClick={() => handleDeleteStep(selectedStep)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete Step
                      </button>
                    )}
                  </div>
                </div>

                {/* Drop Zone */}
                <DropZone stepIndex={selectedStep}>
                  {currentStep.fields.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-sm">Drag fields here to build your form</p>
                    </div>
                  ) : (
                    <SortableContext
                      items={currentStep.fields.map((_, i) => `field-${i}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      {currentStep.fields.map((field, fieldIndex) => (
                        <SortableFieldItem
                          key={field.fieldId}
                          id={`field-${fieldIndex}`}
                          field={field}
                          isSelected={selectedField?.stepIndex === selectedStep && selectedField?.fieldIndex === fieldIndex}
                          onClick={() => setSelectedField({ stepIndex: selectedStep, fieldIndex })}
                          onDelete={() => handleDeleteField(selectedStep, fieldIndex)}
                        />
                      ))}
                    </SortableContext>
                  )}
                </DropZone>
              </div>
            </div>

            {/* Preview & Property Editor */}
            <div className="space-y-4 overflow-y-auto">
              {/* Property Editor */}
              {selectedFieldData ? (
                <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-0 z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Field Properties</h3>
                    <button
                      onClick={() => setSelectedField(null)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      ✕ Close
                    </button>
                  </div>
                  <div className="max-h-[calc(100vh-400px)] overflow-y-auto">
                    <FieldPropertyEditor
                      field={selectedFieldData}
                      fieldTypes={FIELD_TYPES}
                      onUpdate={handleFieldUpdate}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Click on a field to edit its properties</p>
                </div>
              )}

              {/* Live Preview */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Live Preview</h3>
                <div className="bg-white rounded p-4 max-h-[400px] overflow-y-auto">
                  <FormRenderer
                    steps={[currentStep]}
                    formData={{}}
                    errors={{}}
                    onChange={() => {}}
                    onBlur={() => {}}
                    readonly={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeId && draggedFieldType ? (
          <div className="flex items-center gap-2 p-2 bg-white border-2 border-primary rounded shadow-lg">
            <span>{FIELD_TYPES.find((f) => f.type === draggedFieldType || f.id === activeId)?.icon}</span>
            <span>{FIELD_TYPES.find((f) => f.type === draggedFieldType || f.id === activeId)?.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// Draggable Field Item (from palette)
interface DraggableFieldItemProps {
  id: string
  field: DraggableField
}

function DraggableFieldItem({ id, field }: DraggableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      fieldType: field.type,
      fromPalette: true,
    },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
      }
    : { opacity: isDragging ? 0.5 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        'flex items-center gap-2 p-2 bg-white border border-gray-200 rounded cursor-move hover:border-primary hover:bg-primary/5 text-sm transition-colors',
        isDragging && 'opacity-50'
      )}
    >
      <span>{field.icon}</span>
      <span className="text-gray-700">{field.name}</span>
    </div>
  )
}

// Drop Zone Component
interface DropZoneProps {
  stepIndex: number
  children: React.ReactNode
}

function DropZone({ stepIndex, children }: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-zone-${stepIndex}`,
    data: {
      stepIndex,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-[200px] space-y-3 p-4 rounded-lg transition-colors',
        isOver && 'bg-primary/10 border-2 border-primary border-dashed'
      )}
    >
      {children}
    </div>
  )
}

// Sortable Field Item Component
interface SortableFieldItemProps {
  id: string
  field: FormField
  isSelected: boolean
  onClick: () => void
  onDelete: () => void
}

function SortableFieldItem({ id, field, isSelected, onClick, onDelete }: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const [isDraggingState, setIsDraggingState] = React.useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

    // fieldTypeInfo - icon lookup below
    const fieldTypeInfo = FIELD_TYPES.find((f) => f.type === field.fieldType)

  // Handle click - only trigger onClick if not dragging
  const handleClick = (e: React.MouseEvent) => {
    if (!isDraggingState) {
      onClick()
    }
  }

  // Track drag state
  React.useEffect(() => {
    if (isDragging) {
      setIsDraggingState(true)
    } else {
      // Reset drag state after a short delay
      const timer = setTimeout(() => setIsDraggingState(false), 100)
      return () => clearTimeout(timer)
    }
  }, [isDragging])

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
      className={cn(
        'p-3 border-2 rounded-lg cursor-move bg-white hover:border-primary transition-colors',
        isSelected ? 'border-primary bg-primary/5' : 'border-gray-200',
        isDragging && 'opacity-50'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer" onClick={handleClick}>
          <span className="text-lg flex-shrink-0">{fieldTypeInfo?.icon || '📝'}</span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">{field.label || field.fieldName}</div>
            <div className="text-xs text-gray-500 truncate">
              {field.fieldType} {field.required && <span className="text-red-500">*</span>}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-red-600 hover:text-red-700 text-xs px-2 py-1"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

