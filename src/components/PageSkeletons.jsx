import SkeletonLoader, { DiseaseCardSkeleton, StatCardSkeleton, TableRowSkeleton } from './SkeletonLoader';
import { motion } from 'framer-motion';

// Dashboard page skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>

    {/* Statistics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* World Map */}
    <div className="card bg-gradient-to-br from-gray-50 to-gray-100 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="bg-gray-200 rounded-lg h-96"></div>
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Diseases page skeleton
export const DiseasesSkeleton = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="animate-pulse">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>

    {/* Filters */}
    <div className="card animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Results count */}
    <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>

    {/* Disease Cards Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <DiseaseCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Disease Detail page skeleton
export const DiseaseDetailSkeleton = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-full w-32"></div>
      </div>
    </div>

    {/* Statistics Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>

    {/* Tabs Content */}
    <div className="bg-white rounded-lg shadow-sm">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-1 py-4 px-6 animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded mx-auto mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
            </div>
          ))}
        </nav>
      </div>
      <div className="p-6 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>

    {/* Country Table */}
    <div className="card animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[...Array(5)].map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[...Array(10)].map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// Tracker page skeleton
export const TrackerSkeleton = () => (
  <div className="space-y-8">
    {/* Header */}
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded w-64 mb-2"></div>
      <div className="h-6 bg-gray-200 rounded w-96"></div>
    </div>

    {/* Filters */}
    <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Map and Stats */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <div className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

export const AdminDiseasesSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SkeletonLoader className="h-8 w-48" />
        <div className="flex gap-3">
          <SkeletonLoader className="h-10 w-32" />
          <SkeletonLoader className="h-10 w-32" />
        </div>
      </div>
      
      {/* Search bar skeleton */}
      <SkeletonLoader className="h-10 w-full max-w-md" />
      
      {/* Disease list skeleton */}
      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3"><SkeletonLoader className="h-4 w-20" /></th>
              <th className="text-left py-3"><SkeletonLoader className="h-4 w-16" /></th>
              <th className="text-left py-3"><SkeletonLoader className="h-4 w-20" /></th>
              <th className="text-left py-3"><SkeletonLoader className="h-4 w-24" /></th>
              <th className="text-left py-3"><SkeletonLoader className="h-4 w-20" /></th>
              <th className="text-left py-3"><SkeletonLoader className="h-4 w-16" /></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="border-b">
                <td className="py-4"><SkeletonLoader className="h-5 w-32" /></td>
                <td className="py-4"><SkeletonLoader className="h-6 w-20 rounded-full" /></td>
                <td className="py-4"><SkeletonLoader className="h-5 w-24" /></td>
                <td className="py-4"><SkeletonLoader className="h-5 w-16" /></td>
                <td className="py-4"><SkeletonLoader className="h-5 w-20" /></td>
                <td className="py-4">
                  <div className="flex gap-2">
                    <SkeletonLoader className="h-8 w-8 rounded" />
                    <SkeletonLoader className="h-8 w-8 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}; 