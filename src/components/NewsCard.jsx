import { CalendarIcon, ExternalLinkIcon } from '@heroicons/react/outline';
import { format } from 'date-fns';

const NewsCard = ({ news }) => {
  const handleClick = () => {
    if (news.url) {
      window.open(news.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex-1 pr-2">
          {news.title}
        </h3>
        {news.url && (
          <ExternalLinkIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        )}
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
        {news.summary}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <CalendarIcon className="w-4 h-4 mr-1" />
          <span>{format(new Date(news.publishedAt), 'MMM d, yyyy')}</span>
        </div>
        <span className="text-blue-600 dark:text-blue-400 font-medium">{news.source}</span>
      </div>
      
      {news.tags && news.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {news.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsCard; 