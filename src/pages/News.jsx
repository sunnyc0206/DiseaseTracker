import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NewspaperIcon, SearchIcon, CalendarIcon, ExternalLinkIcon, RefreshIcon } from '@heroicons/react/outline';
import NewsApi from '../api/NewsApi';

// Skeleton loader component
const NewsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex items-center mb-2">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded mr-1"></div>
        <div className="w-32 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-3"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4 w-3/4"></div>
      <div className="flex items-center justify-between">
        <div className="w-24 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        <div className="w-20 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    </div>
  </div>
);

const News = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9); // Reduced for faster loading
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, [currentPage]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const result = await NewsApi.getNews(currentPage, pageSize);
      setNews(result.data);
      setPagination(result.pagination);
      
      // Preload adjacent pages for instant navigation
      NewsApi.preloadAdjacentPages(currentPage, pageSize);
      
      // Smooth transition
      setTimeout(() => setLoading(false), 300);
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
      setPagination({
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      setCurrentPage(1);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchNews();
      return;
    }

    setLoading(true);
    setCurrentPage(1);
    try {
      const result = await NewsApi.searchNews(searchTerm, 1, pageSize);
      setNews(result.data);
      setPagination(result.pagination);
      setTimeout(() => setLoading(false), 300);
    } catch (error) {
      console.error('Error searching news:', error);
      setNews([]);
      setPagination({
        totalPages: 1,
        totalItems: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    NewsApi.clearCache(); // Clear cache to get fresh data
    await fetchNews();
    setIsRefreshing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Disease Outbreak News</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">Latest updates from WHO Disease Outbreak News</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search news articles..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </motion.button>
          </div>
        </form>

        {/* News Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(pageSize)].map((_, index) => (
              <NewsCardSkeleton key={index} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <div className="text-center py-12">
            <NewspaperIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No news articles found</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {news.map((article, index) => (
                <motion.article
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {formatDate(article.publishedAt)}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {article.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                        {article.source}
                      </span>
                      
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Read more
                        <ExternalLinkIcon className="w-4 h-4 ml-1" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && news.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pagination.hasPrevPage
                        ? 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map((_, idx) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = idx + 1;
                      } else if (currentPage <= 3) {
                        pageNum = idx + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + idx;
                      } else {
                        pageNum = currentPage - 2 + idx;
                      }

                      if (pageNum < 1 || pageNum > pagination.totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      pagination.hasNextPage
                        ? 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default News; 