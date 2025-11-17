import { useParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { DynamicForm } from '@/components/forms/DynamicForm'
import apiClient from '@/api/client'
import { SubmissionData } from '@/types'

export function FormPage() {
  const { formId } = useParams<{ formId: string }>()
  const navigate = useNavigate()

  const submitMutation = useMutation({
    mutationFn: (data: SubmissionData) => {
      if (!formId) throw new Error('Form ID is required')
      return apiClient.submitForm(formId, { data })
    },
    onSuccess: (response) => {
      navigate(`/submissions/${response.submissionId}`, {
        state: { success: true, message: response.message },
      })
    },
  })

  const saveDraftMutation = useMutation({
    mutationFn: (data: SubmissionData) => {
      if (!formId) throw new Error('Form ID is required')
      return apiClient.saveDraft(formId, { data })
    },
    onSuccess: () => {
      alert('Draft saved successfully')
    },
  })

  const handleSubmit = async (data: SubmissionData) => {
    await submitMutation.mutateAsync(data)
  }

  const handleSaveDraft = async (data: SubmissionData) => {
    await saveDraftMutation.mutateAsync(data)
  }

  if (!formId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-sm text-red-800">Form ID is required</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <DynamicForm
          formId={formId}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
        />
      </div>
    </div>
  )
}

