import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import apiClient from '@/api/client'
import { FormResponse } from '@/types'
import { useState, useMemo } from 'react'

export function FormListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: allForms, isLoading, error } = useQuery<FormResponse[]>({
    queryKey: ['forms'],
    queryFn: () => apiClient.getForms(),
  })

  // Filter to only show active forms
  const activeForms = allForms?.filter((form) => form.isActive) || []

  // Categorize forms based on their names or descriptions
  const categorizedForms = useMemo(() => {
    const categories: { [key: string]: FormResponse[] } = {
      'Banking & Finance': [],
      'Insurance & Takaful': [],
      'Licensing': [],
      'Compliance': [],
      'General': []
    }

    activeForms.forEach((form) => {
      const nameAndDesc = `${form.name} ${form.description || ''}`.toLowerCase()
      
      if (nameAndDesc.includes('bank') || nameAndDesc.includes('financ')) {
        categories['Banking & Finance'].push(form)
      } else if (nameAndDesc.includes('insurance') || nameAndDesc.includes('takaful')) {
        categories['Insurance & Takaful'].push(form)
      } else if (nameAndDesc.includes('licen') || nameAndDesc.includes('application')) {
        categories['Licensing'].push(form)
      } else if (nameAndDesc.includes('compliance') || nameAndDesc.includes('aml') || nameAndDesc.includes('report')) {
        categories['Compliance'].push(form)
      } else {
        categories['General'].push(form)
      }
    })

    return categories
  }, [activeForms])

  // Get filtered forms
  const filteredForms = useMemo(() => {
    let forms = selectedCategory === 'all' 
      ? activeForms 
      : categorizedForms[selectedCategory] || []

    if (searchQuery) {
      forms = forms.filter((form) =>
        form.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        form.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return forms
  }, [selectedCategory, searchQuery, activeForms, categorizedForms])

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: { [key: string]: number } = { all: activeForms.length }
    Object.entries(categorizedForms).forEach(([category, forms]) => {
      counts[category] = forms.length
    })
    return counts
  }, [categorizedForms, activeForms])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-sm font-medium text-gray-600">Loading forms...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-red-900">Error Loading Forms</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  const categoryIcons: { [key: string]: JSX.Element } = {
    'all': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
    'Banking & Finance': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    'Insurance & Takaful': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    'Licensing': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    'Compliance': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    'General': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  }

  return (
    <div className="space-y-6 -m-6 p-6 lg:p-8 min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section - Enhanced */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl overflow-hidden p-8 sm:p-10">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div>
            <h1 className="text-white text-4xl sm:text-5xl font-black mb-3 tracking-tight">Available Forms</h1>
            <p className="text-blue-100 text-base sm:text-lg font-medium">Select a form to begin your submission</p>
          </div>
          <div className="flex items-center gap-4 bg-white/20 backdrop-blur-xl rounded-2xl px-6 py-4 border-2 border-white/30 shadow-xl">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-3xl font-black text-white">{activeForms.length}</p>
              <p className="text-sm text-blue-100 font-bold">Total Forms</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search forms by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Category Filter - Compact on Mobile */}
        <div className="lg:w-auto bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold text-gray-700 lg:hidden"
          >
            <option value="all">All Categories ({categoryCounts.all})</option>
            {Object.keys(categorizedForms).map((category) => (
              categoryCounts[category] > 0 && (
                <option key={category} value={category}>
                  {category} ({categoryCounts[category]})
                </option>
              )
            ))}
          </select>

          {/* Desktop Category Pills */}
          <div className="hidden lg:flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {categoryIcons['all']}
              All ({categoryCounts.all})
            </button>
            {Object.keys(categorizedForms).map((category) => (
              categoryCounts[category] > 0 && (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoryIcons[category]}
                  {category} ({categoryCounts[category]})
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredForms.map((form) => (
            <Link
              key={form.id}
              to={`/forms/${form.formId}`}
              className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-blue-300 hover:-translate-y-1"
            >
              {/* Card Header with Icon */}
              <div className="relative h-32 bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
                  Active
                </span>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {form.name}
                </h3>
                {form.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {form.description}
                  </p>
                )}
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  {form.estimatedTime && (
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {form.estimatedTime}
                    </div>
                  )}
                  <span className="inline-flex items-center text-blue-600 text-sm font-bold group-hover:gap-2 transition-all">
                    Start Form
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No forms found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {searchQuery || selectedCategory !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'No forms available at this time'}
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('all')
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

