import { cn } from '@/lib/utils'

interface StatisticCard {
  title: string
  value: number | string
  change?: {
    value: number
    isPositive: boolean
  }
  icon: string
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

interface StatisticsCardsProps {
  statistics: {
    totalSubmissions: number
    pendingSubmissions: number
    approvedSubmissions: number
    rejectedSubmissions: number
    totalForms: number
  }
}

const colorClasses = {
  blue: 'bg-blue-500 text-blue-100',
  green: 'bg-green-500 text-green-100',
  yellow: 'bg-yellow-500 text-yellow-100',
  red: 'bg-red-500 text-red-100',
  purple: 'bg-purple-500 text-purple-100',
}

export function StatisticsCards({ statistics }: StatisticsCardsProps) {
  const cards: StatisticCard[] = [
    {
      title: 'Total Submissions',
      value: statistics.totalSubmissions || 0,
      icon: '📊',
      color: 'blue',
    },
    {
      title: 'Pending Review',
      value: statistics.pendingSubmissions || 0,
      icon: '⏳',
      color: 'yellow',
    },
    {
      title: 'Approved',
      value: statistics.approvedSubmissions || 0,
      icon: '✅',
      color: 'green',
    },
    {
      title: 'Rejected',
      value: statistics.rejectedSubmissions || 0,
      icon: '❌',
      color: 'red',
    },
    {
      title: 'Total Forms',
      value: statistics.totalForms || 0,
      icon: '📋',
      color: 'purple',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.title}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
        >
          <div className="flex items-center">
            <div className={cn('rounded-md p-3', colorClasses[card.color])}>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="truncate text-sm font-medium text-gray-500">{card.title}</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">{card.value}</div>
                  {card.change && (
                    <div
                      className={cn(
                        'ml-2 flex items-baseline text-sm font-semibold',
                        card.change.isPositive ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {card.change.isPositive ? '↑' : '↓'} {Math.abs(card.change.value)}%
                    </div>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

