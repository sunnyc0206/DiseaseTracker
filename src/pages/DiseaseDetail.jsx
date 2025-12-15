import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { diseaseAPI } from '../api/DiseaseApi';
import { formatNumber, formatNumberFull } from '../utils/formatNumber';
import { motion, AnimatePresence } from 'framer-motion';
import { DiseaseDetailSkeleton } from '../components/PageSkeletons';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  BeakerIcon,
  ExclamationIcon,
  LocationMarkerIcon,
  CalendarIcon,
  ChartBarIcon,
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/outline';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const DiseaseDetail = () => {
  const { id } = useParams();
  const [disease, setDisease] = useState(null);
  const [cases, setCases] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [backendError, setBackendError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = Infinity;
  const retryDelay = 3000000; 
  
  // Country table states
  const [countrySearch, setCountrySearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [countriesPerPage] = useState(10);

  useEffect(() => {
    fetchDiseaseData();
  }, [id]);

  const fetchDiseaseData = async () => {
    try {
      setLoading(true);
      setBackendError(false);
      const [diseaseRes, casesRes, statsRes] = await Promise.all([
        diseaseAPI.getDiseaseById(id),
        diseaseAPI.getDiseaseCases(id).catch(() => ({ data: [] })),
        diseaseAPI.getDiseaseStatistics(id).catch(() => ({ data: {} }))
      ]);

      setDisease(diseaseRes.data);
      setCases(casesRes.data || []);
      setStatistics(statsRes.data || {});
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Error fetching disease data:', error);
      setBackendError(true);
      
      // Auto-retry if backend is not ready yet
      if (retryCount < maxRetries) {
        console.log(`Backend not ready, retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchDiseaseData();
        }, retryDelay);
      } else {
        setLoading(false);
      }
    } finally {
      if (!backendError || retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <DiseaseDetailSkeleton />;
  }

  if (!disease) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Disease not found</h2>
        <Link to="/diseases" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
          ← Back to diseases
        </Link>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      CRITICAL: 'text-red-600 bg-red-100 dark:bg-red-900/50 dark:text-red-300',
      HIGH: 'text-orange-600 bg-orange-100 dark:bg-orange-900/50 dark:text-orange-300',
      MODERATE: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-300',
      LOW: 'text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300'
    };
    return colors[severity] || 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ChartBarIcon },
    { id: 'symptoms', label: 'Symptoms', icon: ExclamationIcon },
    { id: 'prevention', label: 'Prevention', icon: ShieldCheckIcon },
    { id: 'treatment', label: 'Treatment', icon: BeakerIcon },
  ];

  // Chart data
  const casesTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Active Cases',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const distributionData = {
    labels: ['Active', 'Recovered', 'Deaths'],
    datasets: [
      {
        data: [
          disease.activeCases || 0,
          disease.recoveredCases || 0,
          disease.deaths || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <Link
          to="/diseases"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to diseases
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{disease.name}</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">{disease.description}</p>
          </div>
          <span className={`px-4 py-2 text-sm font-medium rounded-full ${getSeverityColor(disease.severity)}`}>
            {disease.severity} Severity
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1" title={formatNumberFull(disease.totalCases || 0)}>
                {formatNumber(disease.totalCases || 0)}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Cases</p>
              <p className="text-2xl font-bold text-blue-600 mt-1" title={formatNumberFull(disease.activeCases || 0)}>
                {formatNumber(disease.activeCases || 0)}
              </p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recovered</p>
              <p className="text-2xl font-bold text-green-600 mt-1" title={formatNumberFull(disease.recoveredCases || 0)}>
                {formatNumber(disease.recoveredCases || 0)}
              </p>
            </div>
            <ShieldCheckIcon className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deaths</p>
              <p className="text-2xl font-bold text-red-600 mt-1" title={formatNumberFull(disease.deaths || 0)}>
                {formatNumber(disease.deaths || 0)}
              </p>
            </div>
            <ExclamationIcon className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <tab.icon className="w-5 h-5 mx-auto mb-1" />
                {tab.label}
              </motion.button>
            ))}
          </nav>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6"
          >
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart section - Chart title text color needs dark:text-white */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Cases Trend</h3>
                    <div className="relative h-64">
                      {/* ChartJS handles its own colors, but the chart's container is fine */}
                      <Line 
                        data={casesTrendData} 
                        options={{ 
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 15,
                                font: {
                                  size: 12
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Distribution</h3>
                    <div className="relative h-64 w-full max-w-sm mx-auto">
                      <Doughnut 
                        data={distributionData} 
                        options={{ 
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                padding: 15,
                                font: {
                                  size: 12
                                }
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
                
                {/* Info Boxes - Text color updates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center gap-3">
                    <LocationMarkerIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Affected Regions</p>
                      <p className="font-medium text-gray-900 dark:text-white">{disease.affectedRegions || 'Global'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(disease.lastUpdated || disease.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {statistics && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Key Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Mortality Rate</p>
                        <p className="font-medium text-red-600">{statistics.mortalityRate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Recovery Rate</p>
                        <p className="font-medium text-green-600">{statistics.recoveryRate || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'symptoms' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Common Symptoms</h3>
                {disease.symptoms ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {disease.symptoms.split(',').map((symptom, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <ExclamationIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{symptom.trim()}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No symptoms information available.</p>
                )}
              </div>
            )}

            {activeTab === 'prevention' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Prevention Methods</h3>
                {disease.prevention ? (
                  <div className="space-y-3">
                    {disease.prevention.split(',').map((method, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                      >
                        <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{method.trim()}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No prevention information available.</p>
                )}
              </div>
            )}

            {activeTab === 'treatment' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Treatment Options</h3>
                {disease.treatment ? (
                  <div className="space-y-3">
                    {disease.treatment.split(',').map((treatment, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
                      >
                        <BeakerIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{treatment.trim()}</span>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No treatment information available.</p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Cases by Country with Search and Pagination */}
      {cases.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow" // Added classes here
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cases by Country</h3>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search countries..."
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Active Cases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Deaths
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Recovered
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {(() => {
                  // Filter countries based on search
                  const filteredCases = cases.filter(caseData =>
                    caseData.country.toLowerCase().includes(countrySearch.toLowerCase())
                  );
                  
                  // Calculate pagination
                  const indexOfLastCountry = currentPage * countriesPerPage;
                  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
                  const currentCountries = filteredCases.slice(indexOfFirstCountry, indexOfLastCountry);
                  const totalPages = Math.ceil(filteredCases.length / countriesPerPage);
                  
                  return (
                    <>
                      {currentCountries.map((caseData, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.02 }}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              {caseData.countryInfo && caseData.countryInfo.flag && (
                                <img 
                                  src={caseData.countryInfo.flag} 
                                  alt={`${caseData.country} flag`}
                                  className="w-6 h-4 mr-2 rounded"
                                />
                              )}
                              {caseData.country}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300" title={formatNumberFull(caseData.totalCases || 0)}>
                            {formatNumber(caseData.totalCases || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600" title={formatNumberFull(caseData.activeCases || 0)}>
                            {formatNumber(caseData.activeCases || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600" title={formatNumberFull(caseData.deaths || 0)}>
                            {formatNumber(caseData.deaths || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600" title={formatNumberFull(caseData.recovered || caseData.recoveredCases || 0)}>
                            {formatNumber(caseData.recovered || caseData.recoveredCases || 0)}
                          </td>
                        </motion.tr>
                      ))}
                    </>
                  );
                })()}
              </tbody>
            </table>
          </div>

          {/* Pagination and Info */}
          {(() => {
            const filteredCases = cases.filter(caseData =>
              caseData.country.toLowerCase().includes(countrySearch.toLowerCase())
            );
            const totalPages = Math.ceil(filteredCases.length / countriesPerPage);
            const indexOfLastCountry = currentPage * countriesPerPage;
            const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
            
            return (
              <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {indexOfFirstCountry + 1}-{Math.min(indexOfLastCountry, filteredCases.length)} of {filteredCases.length} countries
                  {countrySearch && ` (filtered from ${cases.length} total)`}
                </p>
                
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                    
                    <div className="flex gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }
                        
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
};

export default DiseaseDetail;