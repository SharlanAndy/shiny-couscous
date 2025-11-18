// React import not needed with JSX transform
import { FormField, FormStep } from '@/types'
import { InputField } from '@/components/base/InputField'
import { SelectField } from '@/components/base/SelectField'
import { TextAreaField } from '@/components/base/TextAreaField'
import { CheckboxField } from '@/components/base/CheckboxField'
import { RadioField } from '@/components/base/RadioField'
import { DatePickerField } from '@/components/base/DatePickerField'
import { FileUploadField } from '@/components/base/FileUploadField'
import { ToggleField } from '@/components/base/ToggleField'
import { RangeSliderField } from '@/components/base/RangeSliderField'
import { RatingField } from '@/components/base/RatingField'
import { PhoneField } from '@/components/base/PhoneField'
import { CurrencyField } from '@/components/base/CurrencyField'
import { AddressField } from '@/components/base/AddressField'
import { ColorPickerField } from '@/components/base/ColorPickerField'
import { SignatureField } from '@/components/base/SignatureField'
import { TagsField } from '@/components/base/TagsField'
import { RichTextField } from '@/components/base/RichTextField'
import { MarkdownField } from '@/components/base/MarkdownField'
import { ArrayField } from '@/components/base/ArrayField'
import { TableField } from '@/components/base/TableField'
import { JSONField } from '@/components/base/JSONField'
import { CodeField } from '@/components/base/CodeField'
import { AutocompleteField } from '@/components/base/AutocompleteField'
import { TabsField } from '@/components/layout/TabsField'
import { AccordionField } from '@/components/layout/AccordionField'
import { NestedFormField } from '@/components/layout/NestedFormField'
import {
  Divider,
  Spacer,
  Heading,
  TextBlock,
  ImageDisplay,
  ConditionalBlock,
} from '@/components/layout/DisplayComponents'
import { SegmentedControlField } from '@/components/base/SegmentedControlField'
import { CascadingSelectField } from '@/components/base/CascadingSelectField'
import { GroupedSelectField } from '@/components/base/GroupedSelectField'
import { DateRangeField } from '@/components/base/DateRangeField'
import { TimeRangeField } from '@/components/base/TimeRangeField'
import { PercentageField } from '@/components/base/PercentageField'
import { FormulaField } from '@/components/base/FormulaField'
import { PaymentField } from '@/components/base/PaymentField'
import { MapPickerField } from '@/components/base/MapPickerField'
import { RepeaterField } from '@/components/base/RepeaterField'
import { ObjectField } from '@/components/base/ObjectField'
import { QuarterPickerField } from '@/components/base/QuarterPickerField'
import { AsyncSelectField } from '@/components/base/AsyncSelectField'
import { DataGridField } from '@/components/base/DataGridField'
import { VideoDisplay } from '@/components/layout/VideoDisplay'
import { HTMLBlock } from '@/components/layout/HTMLBlock'
import { ProgressIndicator } from '@/components/layout/ProgressIndicator'
import { MessageDisplay } from '@/components/layout/MessageDisplay'
import { ListField } from '@/components/base/ListField'
import { YearPickerField } from '@/components/base/YearPickerField'
import { SearchableSelectField } from '@/components/base/SearchableSelectField'
import { PasswordStrengthField } from '@/components/base/PasswordStrengthField'
import { HiddenField } from '@/components/base/HiddenField'
import { ReadonlyField } from '@/components/base/ReadonlyField'
import { ChunkedUploadField } from '@/components/base/ChunkedUploadField'
import { CameraCaptureField } from '@/components/base/CameraCaptureField'
import { LicenseTypeSelector } from '@/components/labuan-fsa/LicenseTypeSelector'
import { FeeCalculator } from '@/components/labuan-fsa/FeeCalculator'
import { DocumentChecklist } from '@/components/labuan-fsa/DocumentChecklist'
import { ComplianceCheckbox } from '@/components/labuan-fsa/ComplianceCheckbox'
import { StatusTracker } from '@/components/labuan-fsa/StatusTracker'
import { ButtonGroupField } from '@/components/base/ButtonGroupField'
import { SelectWithOtherField } from '@/components/base/SelectWithOtherField'
import { RadioWithOtherField } from '@/components/base/RadioWithOtherField'
import { CheckboxWithOtherField } from '@/components/base/CheckboxWithOtherField'
import { WeekPickerField } from '@/components/base/WeekPickerField'
import { ColorPaletteField } from '@/components/base/ColorPaletteField'
import { PaymentSummaryField } from '@/components/base/PaymentSummaryField'
import { CertificateUploadField } from '@/components/base/CertificateUploadField'
import { TagSelectField } from '@/components/base/TagSelectField'
import { CloudUploadField } from '@/components/base/CloudUploadField'
import { FormAttachmentField } from '@/components/base/FormAttachmentField'
import { HelpTextField } from '@/components/base/HelpTextField'
import { TooltipField } from '@/components/base/TooltipField'
import { shouldDisplayField } from '@/lib/utils'

interface FormRendererProps {
  steps: FormStep[]
  formData: Record<string, any>
  errors: Record<string, string>
  onChange: (stepId: string, fieldName: string, value: any) => void
  onBlur?: (stepId: string, fieldName: string) => void
  readonly?: boolean // If true, all fields will be rendered as readonly/disabled
}

/**
 * FormRenderer - Dynamically renders form fields based on API schema
 */
export function FormRenderer({
  steps,
  formData,
  errors,
  onChange,
  onBlur,
  readonly = false,
}: FormRendererProps) {
  const handleFieldChange = (stepId: string, fieldName: string, value: any) => {
    onChange(stepId, fieldName, value)
  }

  const handleFieldBlur = (stepId: string, fieldName: string) => {
    if (onBlur) {
      onBlur(stepId, fieldName)
    }
  }

  const renderField = (field: FormField, stepId: string) => {
    // Check conditional display
    if (field.conditionalDisplay && !shouldDisplayField(field.conditionalDisplay, formData)) {
      return null
    }

    // Get field value from form data
    const fieldValue = formData[stepId]?.[field.fieldName]
    const fieldError = errors[`${stepId}.${field.fieldName}`]

    // Common props
    const commonProps = {
      fieldId: field.fieldId,
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      label: field.label,
      value: fieldValue,
      defaultValue: field.defaultValue,
      onChange: (value: any) => handleFieldChange(stepId, field.fieldName, value),
      onBlur: () => handleFieldBlur(stepId, field.fieldName),
      required: field.required,
      disabled: readonly || field.disabled, // If readonly mode, disable all fields
      readonly: readonly || field.readonly, // If readonly mode, make all fields readonly
      hidden: field.hidden,
      placeholder: field.placeholder,
      helpText: field.helpText,
      tooltip: field.tooltip,
      validation: field.validation,
      error: fieldError || (field.validation?.errorMessage && fieldError),
      style: field.style,
    }

    // Render based on field type
    switch (field.fieldType) {
      // Standard input types
      case 'text-input':
      case 'input-text':
      case 'input-number':
      case 'input-password':
      case 'input-tel':
      case 'input-url':
      case 'input-search':
      case 'input-color':
        return <InputField {...commonProps} inputType={field.inputType || 'text'} />
      
      // Email input (special case)
      case 'email':
      case 'input-email':
        return <InputField {...commonProps} inputType="email" />

      case 'textarea':
        return <TextAreaField {...commonProps} />

      case 'select':
      case 'select-single':
      case 'select-multi':
        return (
          <SelectField
            {...commonProps}
            options={field.options || []}
            multiple={field.fieldType === 'select-multi'}
            allowOther={field.fieldType === 'select-other'}
            searchable={field.searchable}
          />
        )

      case 'checkbox':
      case 'checkbox-group':
        return (
          <CheckboxField
            {...commonProps}
            options={field.options || []}
            allowOther={field.allowOther}
            otherOptionLabel={field.otherOptionLabel}
            otherInputPlaceholder={field.otherInputPlaceholder}
          />
        )

      case 'radio':
      case 'radio-group':
        return (
          <RadioField
            {...commonProps}
            options={field.options || []}
            allowOther={field.allowOther}
            otherOptionLabel={field.otherOptionLabel}
            otherInputPlaceholder={field.otherInputPlaceholder}
          />
        )

      case 'date':
      case 'time':
      case 'datetime-local':
      case 'month':
        return (
          <DatePickerField
            {...commonProps}
            min={field.min}
            max={field.max}
          />
        )

      case 'file-upload':
      case 'upload':
      case 'upload-document':
      case 'upload-image':
      case 'upload-file':
        return (
          <FileUploadField
            {...commonProps}
            multiple={field.multiple}
            accept={field.accept}
            maxSize={field.maxSize}
            maxFiles={field.maxFiles}
            dragDrop={field.dragDrop}
            preview={field.preview}
            progress={field.progress}
          />
        )

      case 'toggle':
      case 'switch':
        return <ToggleField {...commonProps} />

      case 'range-slider':
      case 'slider':
        return (
          <RangeSliderField
            {...commonProps}
            min={field.min}
            max={field.max}
            step={field.step}
            unit={field.unit}
            showValue={field.showValue}
          />
        )

      case 'rating':
      case 'star-rating':
        return (
          <RatingField
            {...commonProps}
            max={field.max}
            size={field.size}
          />
        )

      case 'phone':
        return (
          <PhoneField
            {...commonProps}
            countryCode={field.countryCode}
            international={field.international}
          />
        )

      case 'currency':
      case 'input-currency':
        return (
          <CurrencyField
            {...commonProps}
            currency={field.currency}
            locale={field.locale}
            showSymbol={field.showSymbol}
          />
        )

      case 'address':
      case 'address-complete':
        return (
          <AddressField
            {...commonProps}
            fields={field.fields}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'color-picker':
        return (
          <ColorPickerField
            {...commonProps}
            palette={field.palette}
            showInput={field.showInput}
          />
        )

      case 'signature':
      case 'signature-pad':
        return (
          <SignatureField
            {...commonProps}
            width={field.width}
            height={field.height}
            backgroundColor={field.backgroundColor}
            penColor={field.penColor}
            showClear={field.showClear}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'tags':
      case 'tags-input':
        return (
          <TagsField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            placeholder={field.placeholder}
            maxTags={field.maxTags}
            suggestions={field.suggestions}
          />
        )

      case 'rich-text':
      case 'wysiwyg':
        return (
          <RichTextField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            toolbar={field.toolbar}
            height={field.height}
          />
        )

      case 'markdown':
      case 'markdown-editor':
        return (
          <MarkdownField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            preview={field.preview}
            height={field.height}
          />
        )

      case 'array':
      case 'array-field':
        return (
          <ArrayField
            {...commonProps}
            itemSchema={field.itemSchema}
            value={fieldValue}
            defaultValue={field.defaultValue}
            minItems={field.minItems}
            maxItems={field.maxItems}
            addButtonLabel={field.addButtonLabel}
            removeButtonLabel={field.removeButtonLabel}
          />
        )

      case 'table':
      case 'data-table':
        return (
          <TableField
            {...commonProps}
            columns={field.columns}
            value={fieldValue}
            defaultValue={field.defaultValue}
            minRows={field.minRows}
            maxRows={field.maxRows}
            allowAddRows={field.allowAddRows}
            allowRemoveRows={field.allowRemoveRows}
          />
        )

      case 'json':
      case 'json-editor':
        return (
          <JSONField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            height={field.height}
            formatOnBlur={field.formatOnBlur}
          />
        )

      case 'code':
      case 'code-editor':
        return (
          <CodeField
            {...commonProps}
            language={field.language}
            value={fieldValue}
            defaultValue={field.defaultValue}
            height={field.height}
            theme={field.theme}
          />
        )

      case 'autocomplete':
      case 'input-autocomplete':
        return (
          <AutocompleteField
            {...commonProps}
            options={field.options || []}
            asyncOptions={field.asyncOptions}
            minChars={field.minChars}
            debounce={field.debounce}
            multiple={field.multiple}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'tabs':
      case 'tabs-field':
        return (
          <TabsField
            {...commonProps}
            tabs={field.tabs || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            onChange={(tabId, fieldName, value) => {
              // Handle nested tab field change
              if (onChange) {
                const stepId = `tab-${tabId}`
                onChange(stepId, fieldName, value)
              }
            }}
            onTabChange={field.onTabChange}
          />
        )

      case 'accordion':
      case 'accordion-field':
        return (
          <AccordionField
            {...commonProps}
            sections={field.sections || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            multiple={field.multiple}
            onChange={(sectionId, fieldName, value) => {
              // Handle nested accordion field change
              if (onChange) {
                const stepId = `accordion-${sectionId}`
                onChange(stepId, fieldName, value)
              }
            }}
          />
        )

      case 'nested-form':
      case 'form-nested':
        return (
          <NestedFormField
            {...commonProps}
            steps={field.steps || field.schema || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            onChange={(stepId, fieldName, value) => {
              // Handle nested form field change
              if (onChange) {
                onChange(stepId, fieldName, value)
              }
            }}
          />
        )

      case 'segmented-control':
        return (
          <SegmentedControlField
            {...commonProps}
            options={field.options || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'select-cascade':
      case 'cascading-select':
        return (
          <CascadingSelectField
            {...commonProps}
            cascadeConfig={field.cascadeConfig || {}}
            parentField={field.parentField}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'select-grouped':
      case 'grouped-select':
        return (
          <GroupedSelectField
            {...commonProps}
            optionGroups={field.optionGroups || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'date-range':
      case 'date-range-picker':
        return (
          <DateRangeField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            min={field.min}
            max={field.max}
          />
        )

      case 'time-range':
      case 'time-range-picker':
        return (
          <TimeRangeField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            min={field.min}
            max={field.max}
          />
        )

      case 'percentage':
      case 'input-percentage':
        return (
          <PercentageField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            min={field.min}
            max={field.max}
            step={field.step}
            showSymbol={field.showSymbol}
          />
        )

      case 'formula':
      case 'calculated-field':
        return (
          <FormulaField
            {...commonProps}
            formula={field.formula}
            dependencies={field.dependencies}
            value={fieldValue}
            defaultValue={field.defaultValue}
            readOnly={field.readOnly}
            precision={field.precision}
          />
        )

      case 'divider':
        return (
          <Divider
            fieldId={field.fieldId}
            label={field.label}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'spacer':
        return (
          <Spacer
            fieldId={field.fieldId}
            height={field.height}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'heading':
        return (
          <Heading
            fieldId={field.fieldId}
            label={field.label}
            level={field.level}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'text-block':
        return (
          <TextBlock
            fieldId={field.fieldId}
            label={field.label}
            content={field.content || ''}
            html={field.html}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'image-display':
        return (
          <ImageDisplay
            fieldId={field.fieldId}
            label={field.label}
            src={field.src || ''}
            alt={field.alt}
            width={field.width}
            height={field.height}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'conditional-block':
        return (
          <ConditionalBlock
            fieldId={field.fieldId}
            condition={shouldDisplayField(field.conditionalDisplay, formData)}
            style={field.style}
            hidden={field.hidden}
          >
            {/* Render nested fields */}
            {field.fields?.map((nestedField) => (
              <div key={nestedField.fieldId}>
                {renderField(nestedField, stepId)}
              </div>
            ))}
          </ConditionalBlock>
        )

      case 'payment-stripe':
      case 'payment-paypal':
      case 'payment-card':
      case 'payment-button':
        return (
          <PaymentField
            {...commonProps}
            provider={field.provider}
            amount={field.amount}
            currency={field.currency}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'map-picker':
      case 'location-picker':
        return (
          <MapPickerField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            defaultCenter={field.defaultCenter}
            zoom={field.zoom}
            height={field.height}
          />
        )

      case 'repeater':
      case 'repeater-field':
        return (
          <RepeaterField
            {...commonProps}
            itemSchema={field.itemSchema || field.fields || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            minItems={field.minItems}
            maxItems={field.maxItems}
            addButtonLabel={field.addButtonLabel}
            removeButtonLabel={field.removeButtonLabel}
            cloneEnabled={field.cloneEnabled}
          />
        )

      case 'object':
      case 'object-field':
      case 'field-group':
        return (
          <ObjectField
            {...commonProps}
            fields={field.fields || field.schema || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            collapsible={field.collapsible}
            defaultCollapsed={field.defaultCollapsed}
          />
        )

      case 'quarter':
      case 'quarter-picker':
        return (
          <QuarterPickerField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            minYear={field.minYear}
            maxYear={field.maxYear}
          />
        )

      case 'select-async':
      case 'async-select':
        return (
          <AsyncSelectField
            {...commonProps}
            loadOptions={field.loadOptions}
            defaultOptions={field.defaultOptions}
            cacheOptions={field.cacheOptions}
            debounce={field.debounce}
            minInputLength={field.minInputLength}
            multiple={field.multiple}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'data-grid':
      case 'data-table-advanced':
        return (
          <DataGridField
            {...commonProps}
            columns={field.columns || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            pagination={field.pagination}
            pageSize={field.pageSize}
            sortable={field.sortable}
            filterable={field.filterable}
            allowAddRows={field.allowAddRows}
            allowRemoveRows={field.allowRemoveRows}
            allowEdit={field.allowEdit}
          />
        )

      case 'video-display':
        return (
          <VideoDisplay
            fieldId={field.fieldId}
            label={field.label}
            src={field.src || ''}
            type={field.type}
            poster={field.poster}
            autoplay={field.autoplay}
            controls={field.controls}
            loop={field.loop}
            muted={field.muted}
            width={field.width}
            height={field.height}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'html-block':
        return (
          <HTMLBlock
            fieldId={field.fieldId}
            label={field.label}
            content={field.content || ''}
            sanitize={field.sanitize}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'progress-indicator':
        return (
          <ProgressIndicator
            fieldId={field.fieldId}
            label={field.label}
            steps={field.steps || []}
            currentStep={field.currentStep}
            orientation={field.orientation}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'error-display':
        return (
          <MessageDisplay
            fieldId={field.fieldId}
            type="error"
            message={field.message || ''}
            title={field.title}
            dismissible={field.dismissible}
            onDismiss={field.onDismiss}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'warning-display':
        return (
          <MessageDisplay
            fieldId={field.fieldId}
            type="warning"
            message={field.message || ''}
            title={field.title}
            dismissible={field.dismissible}
            onDismiss={field.onDismiss}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'success-display':
        return (
          <MessageDisplay
            fieldId={field.fieldId}
            type="success"
            message={field.message || ''}
            title={field.title}
            dismissible={field.dismissible}
            onDismiss={field.onDismiss}
            style={field.style}
            hidden={field.hidden}
          />
        )

      case 'list':
      case 'list-field':
        return (
          <ListField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            minItems={field.minItems}
            maxItems={field.maxItems}
            allowDuplicates={field.allowDuplicates}
            itemType={field.itemType}
          />
        )

      case 'year-picker':
        return (
          <YearPickerField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            minYear={field.minYear}
            maxYear={field.maxYear}
            format={field.format}
          />
        )

      case 'select-searchable':
      case 'searchable-select':
        return (
          <SearchableSelectField
            {...commonProps}
            options={field.options || []}
            multiple={field.multiple}
            searchPlaceholder={field.searchPlaceholder}
            minChars={field.minChars}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'password-strength':
      case 'password-with-strength':
        return (
          <PasswordStrengthField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            showStrengthIndicator={field.showStrengthIndicator}
            minLength={field.minLength}
            requireUppercase={field.requireUppercase}
            requireLowercase={field.requireLowercase}
            requireNumbers={field.requireNumbers}
            requireSpecialChars={field.requireSpecialChars}
          />
        )

      case 'hidden':
      case 'input-hidden':
        return (
          <HiddenField
            fieldId={field.fieldId}
            fieldName={field.fieldName}
            fieldType={field.fieldType}
            value={fieldValue}
            defaultValue={field.defaultValue}
            onChange={onChange ? (val) => onChange(stepId, field.fieldName, val) : undefined}
            required={field.required}
            hidden={field.hidden}
          />
        )

      case 'readonly':
      case 'readonly-field':
        return (
          <ReadonlyField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            format={field.format}
            displayComponent={field.displayComponent}
          />
        )

      case 'upload-chunked':
      case 'chunked-upload':
        return (
          <ChunkedUploadField
            {...commonProps}
            chunkSize={field.chunkSize}
            maxFileSize={field.maxFileSize}
            allowedExtensions={field.allowedExtensions}
            multiple={field.multiple}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'upload-camera':
      case 'camera-capture':
        return (
          <CameraCaptureField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            maxFileSize={field.maxFileSize}
            imageQuality={field.imageQuality}
          />
        )

      case 'license-type-selector':
      case 'labuan-license-type':
        return (
          <LicenseTypeSelector
            {...commonProps}
            licenseTypes={field.options || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'fee-calculator':
      case 'labuan-fee-calculator':
        return (
          <FeeCalculator
            {...commonProps}
            licenseType={field.licenseType}
            feeStructure={field.feeStructure}
            currency={field.currency}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'document-checklist':
      case 'labuan-document-checklist':
        return (
          <DocumentChecklist
            {...commonProps}
            documents={field.documents}
            allowUpload={field.allowUpload}
            onUpload={field.onUpload}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'compliance-checkbox':
      case 'labuan-compliance-checkbox':
        return (
          <ComplianceCheckbox
            {...commonProps}
            complianceText={field.complianceText}
            linkToPolicy={field.linkToPolicy}
            value={fieldValue}
            defaultValue={field.defaultValue}
          />
        )

      case 'status-tracker':
      case 'labuan-status-tracker':
        return (
          <StatusTracker
            {...commonProps}
            currentStatus={field.currentStatus}
            statusHistory={field.statusHistory}
            applicationId={field.applicationId}
            submittedDate={field.submittedDate}
          />
        )

      case 'button-group-field':
        return (
          <ButtonGroupField
            {...commonProps}
            options={field.options || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            multiple={field.multiple}
            orientation={field.orientation}
          />
        )

      case 'select-with-other':
        return (
          <SelectWithOtherField
            {...commonProps}
            options={field.options || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            otherValue={field.otherValue}
          />
        )

      case 'radio-other':
      case 'radio-with-other':
        return (
          <RadioWithOtherField
            {...commonProps}
            options={field.options || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            otherValue={field.otherValue}
            orientation={field.orientation}
          />
        )

      case 'checkbox-other':
      case 'checkbox-with-other':
        return (
          <CheckboxWithOtherField
            {...commonProps}
            options={field.options || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            otherValue={field.otherValue}
            orientation={field.orientation}
          />
        )

      case 'week-picker':
        return (
          <WeekPickerField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            min={field.min}
            max={field.max}
          />
        )

      case 'color-palette-field':
        return (
          <ColorPaletteField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            colors={field.colors}
            allowCustom={field.allowCustom}
          />
        )

      case 'payment-summary':
      case 'payment-summary-field':
        return (
          <PaymentSummaryField
            {...commonProps}
            items={field.items}
            subtotal={field.subtotal}
            tax={field.tax}
            discount={field.discount}
            total={field.total}
            currency={field.currency}
            value={fieldValue}
          />
        )

      case 'upload-certificate':
      case 'certificate-upload':
        return (
          <CertificateUploadField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            maxFileSize={field.maxFileSize}
            allowedFormats={field.allowedFormats}
            multiple={field.multiple}
          />
        )

      case 'tag-select':
      case 'tag-select-field':
        return (
          <TagSelectField
            {...commonProps}
            options={field.options || []}
            value={fieldValue}
            defaultValue={field.defaultValue}
            multiple={field.multiple}
            allowAddNew={field.allowAddNew}
            maxTags={field.maxTags}
          />
        )

      case 'upload-cloud':
      case 'cloud-upload':
        return (
          <CloudUploadField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            maxFileSize={field.maxFileSize}
            allowedExtensions={field.allowedExtensions}
            multiple={field.multiple}
            storageProvider={field.storageProvider}
            bucketName={field.bucketName}
          />
        )

      case 'upload-attachment':
      case 'form-attachment':
        return (
          <FormAttachmentField
            {...commonProps}
            value={fieldValue}
            defaultValue={field.defaultValue}
            maxFileSize={field.maxFileSize}
            allowedExtensions={field.allowedExtensions}
            multiple={field.multiple}
            attachmentTypes={field.attachmentTypes}
          />
        )

      case 'help-text':
      case 'help-text-field':
        return (
          <HelpTextField
            {...commonProps}
            content={field.content || field.helpText || ''}
            format={field.format}
            icon={field.icon}
            position={field.position}
          />
        )

      case 'tooltip':
      case 'tooltip-field':
        return (
          <TooltipField
            {...commonProps}
            content={field.content || field.tooltip || ''}
            trigger={field.trigger}
            placement={field.placement}
            targetId={field.targetId}
          />
        )

      // All field types implemented! (89+ field types - 100%+ of 85+)
      default:
        console.warn(`Unsupported field type: ${field.fieldType}`)
        return (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Field type "{field.fieldType}" is not yet implemented
            </p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {steps.map((step) => (
        <div key={step.stepId} className="form-step">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{step.stepName}</h2>
            {step.stepDescription && (
              <p className="mt-1 text-xs sm:text-sm text-gray-500">{step.stepDescription}</p>
            )}
          </div>
          <div className="space-y-3 sm:space-y-4">
            {step.fields.map((field) => (
              <div key={field.fieldId}>{renderField(field, step.stepId)}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

