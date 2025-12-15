import { useState, useEffect } from 'react';
import { diseaseAPI } from '../api/DiseaseApi';
import DiseaseCard from '../components/DiseaseCard';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber, formatNumberFull } from '../utils/formatNumber';
import { DiseasesSkeleton } from '../components/PageSkeletons';
import {
  SearchIcon,
  FilterIcon,
  RefreshIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ViewGridIcon,
  ViewListIcon
} from '@heroicons/react/outline';

const Diseases = () => {
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [backendError, setBackendError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = Infinity; // Keep retrying indefinitely
  const retryDelay = 3000; // 3 seconds 
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [diseasesPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
  }, [diseases, searchTerm, selectedSeverity, sortBy]);

  useEffect(() => {
    // Update total pages when filtered diseases changes
    setTotalPages(Math.ceil(filteredDiseases.length / diseasesPerPage));
    setCurrentPage(1); // Reset to first page when filters change
  }, [filteredDiseases, diseasesPerPage]);

  const fetchDiseases = async () => {
    try {
      setLoading(true);
      setBackendError(false);
      const response = await diseaseAPI.getAllDiseases();
      setDiseases(response || []);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error fetching diseases:', error);
      setBackendError(true);
      
      // Auto-retry if backend is not ready yet
      if (retryCount < maxRetries) {
        console.log(`Backend not ready, retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchDiseases();
        }, retryDelay);
      } else {
        // After max retries, stop loading to show empty state
        setLoading(false);
      }
    } finally {
      if (!backendError || retryCount >= maxRetries) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const filterDiseases = () => {
    let filtered = [...diseases];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(disease =>
        disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disease.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(disease => disease.severity === selectedSeverity);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'severity':
          const severityOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2, LOW: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        case 'cases':
          return (b.activeCases || 0) - (a.activeCases || 0);
        default:
          return 0;
      }
    });

    setFilteredDiseases(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDiseases();
  };

  // Pagination helpers
  const indexOfLastDisease = currentPage * diseasesPerPage;
  const indexOfFirstDisease = indexOfLastDisease - diseasesPerPage;
  const currentDiseases = filteredDiseases.slice(indexOfFirstDisease, indexOfLastDisease);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: 'bg-red-100 text-red-800',
      HIGH: 'bg-orange-100 text-orange-800',
      MODERATE: 'bg-yellow-100 text-yellow-800',
      LOW: 'bg-green-100 text-green-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !backendError) {
    return <DiseasesSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Disease Database</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Comprehensive information about tracked diseases
            </p>
          </div>
          
          <div className="flex gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="Grid View"
              >
                <ViewGridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-800 shadow-sm text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
                title="List View"
              >
                <ViewListIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search diseases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Sort by Name</option>
            <option value="severity">Sort by Severity</option>
            <option value="cases">Sort by Active Cases</option>
          </select>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <p className="text-gray-600">
          Showing {indexOfFirstDisease + 1}-{Math.min(indexOfLastDisease, filteredDiseases.length)} of {filteredDiseases.length} diseases
        </p>
      </motion.div>

      {/* Diseases Display */}
      <AnimatePresence mode="wait">
        {loading && backendError && retryCount < maxRetries ? (
          // Show skeleton while retrying
          <DiseasesSkeleton />
        ) : currentDiseases.length > 0 ? (
          viewMode === 'grid' ? (
            // Grid View
            <motion.div
              key={`grid-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {currentDiseases.map((disease, index) => (
                <motion.div
                  key={disease.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <DiseaseCard disease={disease} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            // List View
            <motion.div
              key={`list-${currentPage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {currentDiseases.map((disease, index) => (
                <motion.div
                  key={disease.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="card hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{disease.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(disease.severity)}`}>
                          {disease.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {disease.description}
                      </p>
                      <div className="flex gap-6 text-sm">
                        <div>
                          <span className="text-gray-500">Active Cases:</span>
                          <span className="ml-2 font-semibold text-blue-600" title={formatNumberFull(disease.activeCases || 0)}>
                            {formatNumber(disease.activeCases || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Deaths:</span>
                          <span className="ml-2 font-semibold text-red-600" title={formatNumberFull(disease.deaths || 0)}>
                            {formatNumber(disease.deaths || 0)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Recovered:</span>
                          <span className="ml-2 font-semibold text-green-600" title={formatNumberFull(disease.recoveredCases || 0)}>
                            {formatNumber(disease.recoveredCases || 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <motion.a
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      href={`/diseases/${disease.id}`}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </motion.a>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-12"
          >
            <p className="text-gray-500">No diseases found matching your criteria.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center items-center gap-2 mt-8"
        >
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          
          {currentPage > 3 && (
            <>
              <button
                onClick={() => paginate(1)}
                className="px-3 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
              >
                1
              </button>
              <span className="px-2 text-gray-500">...</span>
            </>
          )}
          
          <div className="flex gap-1">
            {renderPaginationButtons().map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  currentPage === number
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {number}
              </button>
            ))}
          </div>
          
          {currentPage < totalPages - 2 && (
            <>
              <span className="px-2 text-gray-500">...</span>
              <button
                onClick={() => paginate(totalPages)}
                className="px-3 py-1 rounded-lg bg-white border border-gray-300 hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default Diseases; 