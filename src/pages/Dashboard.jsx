import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { diseaseAPI } from '../api/DiseaseApi';
import { statsAPI } from '../api/StatsApi';

import NewsApi from '../api/NewsApi';
import { formatNumber, formatNumberFull } from '../utils/formatNumber';
import { DashboardSkeleton } from '../components/PageSkeletons';
import Logo from '../components/Logo';
import { 
  ChartBarIcon, 
  TrendingUpIcon, 
  UserGroupIcon,
  GlobeIcon,
  ExclamationCircleIcon,
  FilterIcon,
  RefreshIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  NewspaperIcon,
  ShieldCheckIcon
} from '@heroicons/react/outline';
import StatCard from '../components/StatCard';
import NewsCard from '../components/NewsCard';
import WorldMap from '../components/WorldMap';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [diseases, setDiseases] = useState([]);
  const [newDiseases, setNewDiseases] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryStats, setCountryStats] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [error, setError] = useState(null);
  const [backendError, setBackendError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = Infinity; // Keep retrying indefinitely
  const retryDelay = 3000; // 3 seconds
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [diseasesPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setBackendError(false);
      
      // Fetch all data in parallel
      const [diseasesRes, statsRes] = await Promise.all([
        diseaseAPI.getAllDiseases().catch(err => {
          console.error('Disease fetch error:', err);
          throw err; // Re-throw to trigger retry
        }),
        statsAPI.getCountryStatistics().catch(err => {
          console.error('Stats fetch error:', err);
          return []; // Stats can fail silently
        })
      ]);

      // Handle different response formats
      const allDiseases = Array.isArray(diseasesRes) ? diseasesRes : [];
      setDiseases(allDiseases);
      
      // Filter new diseases (created in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newDis = allDiseases.filter(disease => {
        const createdDate = new Date(disease.lastUpdated || disease.createdAt || disease.updatedAt);
        return createdDate > thirtyDaysAgo;
      });
      setNewDiseases(newDis);
      
      // Set total pages for pagination
      setTotalPages(Math.ceil(allDiseases.length / diseasesPerPage));
      
      const countries = statsRes.data || [];
      const mapDataFormatted = countries.map(country => ({
        country: country.country,
        countryCode: country.countryCode,
        totalCases: country.totalCases || 0,
        activeCases: country.activeCases || 0,
        deaths: country.deaths || 0,
        recovered: country.recovered || 0,
        diseases: country.diseases || [],
        flag: country.flag,
        continent: country.continent
      }));
      setMapData(mapDataFormatted);

      if (allDiseases.length === 0 && countries.length === 0) {
        setError('Unable to fetch data. Please check your internet connection or try again later.');
      }
      
      setRetryCount(0); // Reset retry count on success

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      setBackendError(true);
      
      // Auto-retry if backend is not ready yet
      if (retryCount < maxRetries) {
        console.log(`Backend not ready, retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchDashboardData();
        }, retryDelay);
      } else {
        setError('Failed to load dashboard data. Please try again.');
        setLoading(false);
      }
    } finally {
      if (!backendError || retryCount >= maxRetries) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    const countryData = mapData.find(c => c.country === country.country || c.countryCode === country.countryCode);
    setCountryStats(countryData);
  };

  // Pagination helpers
  const indexOfLastDisease = currentPage * diseasesPerPage;
  const indexOfFirstDisease = indexOfLastDisease - diseasesPerPage;
  const currentDiseases = diseases.slice(indexOfFirstDisease, indexOfLastDisease);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <DashboardSkeleton />;
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
           
                          <p className="mt-2 text-gray-600 dark:text-gray-400">
                Real-time monitoring of disease worldwide
              </p>
          </div>
          
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
      </motion.div>

      {newDiseases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <ExclamationCircleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-yellow-800">New Disease Alerts</h3>
              <p className="text-sm text-yellow-700 mt-1">
                {newDiseases.length} new disease{newDiseases.length > 1 ? 's' : ''} reported in the last 30 days
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {newDiseases.slice(0, 3).map((disease) => (
                  <Link
                    key={disease.id}
                    to={`/diseases/${disease.id}`}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
                  >
                    {disease.name}
                  </Link>
                ))}
                {newDiseases.length > 3 && (
                  <Link
                    to="/diseases"
                    className="text-xs text-yellow-700 px-2 py-1 hover:underline"
                  >
                    +{newDiseases.length - 3} more
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
        >
          <ExclamationCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-800">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Note: Some data sources may be temporarily unavailable due to tracking limitations and incorrect data.
            </p>
          </div>
        </motion.div>
      )}

      {/* Key Statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border-blue-200 dark:border-blue-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-200">Total Diseases Tracked</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {diseases.length}
              </p>
            </div>
            <ChartBarIcon className="w-8 sm:w-10 h-8 sm:h-10 text-blue-600 dark:text-blue-300" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 border-green-200 dark:border-green-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 dark:text-green-200">Countries Monitored</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {mapData.length > 0 ? mapData.length : Math.max(...diseases.map(d => d.affectedCountries || d.countries || 0))}
              </p>
            </div>
            <GlobeIcon className="w-8 sm:w-10 h-8 sm:h-10 text-green-600 dark:text-green-300" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 border-purple-200 dark:border-purple-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 dark:text-purple-200">New Diseases (30 days)</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {newDiseases.length}
              </p>
              {newDiseases.length > 0 && (
                <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
                  {newDiseases[0]?.name || 'Latest update'}
                </p>
              )}
            </div>
            <PlusCircleIcon className="w-8 sm:w-10 h-8 sm:h-10 text-purple-600 dark:text-purple-300" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 border-orange-200 dark:border-orange-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-200">Global Total Cases</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatNumber(diseases.reduce((sum, d) => sum + (d.totalCases || d.cases || 0), 0))}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">
                Across all diseases
              </p>
            </div>
            <TrendingUpIcon className="w-8 sm:w-10 h-8 sm:h-10 text-orange-600 dark:text-orange-300" />
          </div>
        </motion.div>
      </motion.div>

      {/* Interactive World Map - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Global Disease Distribution</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Click on any country to view detailed statistics</p>
          </div>
          <div className="flex gap-2">
            <Link 
              to="/tracker" 
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors text-sm"
            >
              Advanced Tracker
            </Link>
          </div>
        </div>
        
        <div className="relative bg-white rounded-lg p-4 shadow-inner">
          <WorldMap 
            data={mapData}
            onCountryClick={handleCountryClick}
            selectedCountry={selectedCountry}
            showTooltip={true}
          />
          
          {/* Country Details Popup - Enhanced */}
          <AnimatePresence>
            {selectedCountry && countryStats && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute top-4 right-4 bg-white p-6 rounded-lg shadow-2xl max-w-sm z-10 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {countryStats.flag && (
                      <img src={countryStats.flag} alt={countryStats.country} className="w-6 h-4 rounded" />
                    )}
                    <h3 className="text-lg font-semibold">{countryStats.country}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCountry(null);
                      setCountryStats(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Total Cases</span>
                    <span className="font-semibold" title={formatNumberFull(countryStats.totalCases || 0)}>
                      {formatNumber(countryStats.totalCases || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Active Cases</span>
                    <span className="font-semibold text-blue-600" title={formatNumberFull(countryStats.activeCases || 0)}>
                      {formatNumber(countryStats.activeCases || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Recovered</span>
                    <span className="font-semibold text-green-600" title={formatNumberFull(countryStats.recovered || 0)}>
                      {formatNumber(countryStats.recovered || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm text-gray-600">Deaths</span>
                    <span className="font-semibold text-red-600" title={formatNumberFull(countryStats.deaths || 0)}>
                      {formatNumber(countryStats.deaths || 0)}
                    </span>
                  </div>
                  
                  {countryStats.diseases && countryStats.diseases.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Active Diseases:</p>
                      <div className="space-y-1">
                        {countryStats.diseases.map((disease, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{disease.name}</span>
                            <span className="font-medium" title={formatNumberFull(disease.cases || 0)}>
                              {formatNumber(disease.cases || 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-gray-600">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span className="text-gray-600">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 rounded"></div>
            <span className="text-gray-600">No Data</span>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <Link 
          to="/diseases"
          className="card hover:shadow-lg transition-all hover:scale-[1.02] group dark:bg-gray-800 dark:hover:bg-gray-750"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Browse Diseases
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                View all {diseases.length} tracked diseases
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
        </Link>

        <Link 
          to="/news"
          className="card hover:shadow-lg transition-all hover:scale-[1.02] group dark:bg-gray-800 dark:hover:bg-gray-750"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Health News
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Latest updates and alerts
              </p>
            </div>
            <NewspaperIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
        </Link>

        <Link 
          to="/statistics"
          className="card hover:shadow-lg transition-all hover:scale-[1.02] group dark:bg-gray-800 dark:hover:bg-gray-750 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Global Statistics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Detailed analytics and trends
              </p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

export default Dashboard; 