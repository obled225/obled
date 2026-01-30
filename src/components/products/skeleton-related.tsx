export function SkeletonRelatedProducts() {
  return (
    <div className="py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
        <div className="h-8 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
