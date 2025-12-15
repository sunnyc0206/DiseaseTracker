const SkeletonLoader = ({ variant = 'text', className = '', count = 1 }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  const variantClasses = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    card: 'h-48 w-full rounded-lg',
    image: 'h-64 w-full rounded-lg',
    circle: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-md',
    stat: 'h-16 w-full rounded-lg',
    table: 'h-12 w-full',
    map: 'h-96 w-full rounded-lg'
  };

  const finalClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (count > 1) {
    return (
      <div className="space-y-3">
        {[...Array(count)].map((_, index) => (
          <div key={index} className={finalClasses}></div>
        ))}
      </div>
    );
  }

  return <div className={finalClasses}></div>;
};

// Skeleton loader for disease cards
export const DiseaseCardSkeleton = () => (
  <div className="bg-white rounded-xl border-2 border-gray-100 p-6 animate-pulse">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
      </div>
      <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
    </div>
    
    <div className="space-y-2 mb-6">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="bg-gray-100 rounded-lg p-3">
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
    
    <div className="h-2 bg-gray-200 rounded-full w-full"></div>
  </div>
);

// Skeleton loader for statistics cards
export const StatCardSkeleton = () => (
  <div className="card bg-gradient-to-r from-gray-50 to-gray-100 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="w-10 h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Skeleton loader for table rows
export const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="px-6 py-4">
      <div className="flex items-center">
        <div className="w-6 h-4 bg-gray-200 rounded mr-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </td>
  </tr>
);

// Skeleton loader for news cards
export const NewsCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="h-4 bg-gray-200 rounded w-24"></div>
      <div className="h-6 bg-gray-200 rounded-full w-16"></div>
    </div>
    
    <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
    
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
    
    <div className="flex items-center justify-between">
      <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export default SkeletonLoader; 