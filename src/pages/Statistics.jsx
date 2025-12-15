import React, { useState, useEffect } from 'react';
import { statsAPI } from '../api/StatsApi';
import { formatNumber, formatNumberFull } from '../utils/formatNumber';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  ChartBarIcon,
  FilterIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/outline';

const Statistics = () => {
  const [countryData, setCountryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [sortBy, setSortBy] = useState('totalCases');
  const [expandedCountry, setExpandedCountry] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [countriesPerPage] = useState(20);

  useEffect(() => {
    fetchCountryData();
  }, []);

  const fetchCountryData = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getCountryWiseDiseaseData();
      setCountryData(response.data || []);
    } catch (error) {
      console.error('Error fetching country data:', error);
      setCountryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort data
  const getFilteredData = () => {
    let filtered = [...countryData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(country =>
        country.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Continent filter
    if (selectedContinent !== 'all') {
      filtered = filtered.filter(country => country.continent === selectedContinent);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'country':
          return a.country.localeCompare(b.country);
        case 'totalCases':
          return b.totalCases - a.totalCases;
        case 'totalDeaths':
          return b.totalDeaths - a.totalDeaths;
        case 'diseaseCount':
          return b.diseaseCount - a.diseaseCount;
        case 'casesPerMillion':
          return b.casesPerMillion - a.casesPerMillion;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredData = getFilteredData();
  
  // Pagination
  const indexOfLastCountry = currentPage * countriesPerPage;
  const indexOfFirstCountry = indexOfLastCountry - countriesPerPage;
  const currentCountries = filteredData.slice(indexOfFirstCountry, indexOfLastCountry);
  const totalPages = Math.ceil(filteredData.length / countriesPerPage);

  // Get unique continents
  const continents = ['all', ...new Set(countryData.map(c => c.continent).filter(Boolean))];

  const getDiseaseColor = (diseaseName) => {
    const colors = {
      'COVID-19': 'bg-blue-100 text-blue-800',
      'Malaria': 'bg-red-100 text-red-800',
      'Tuberculosis': 'bg-purple-100 text-purple-800',
      'HIV/AIDS': 'bg-orange-100 text-orange-800',
      'Dengue': 'bg-yellow-100 text-yellow-800',
      'Influenza': 'bg-green-100 text-green-800'
    };
    return colors[diseaseName] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Filters Skeleton */}
        <div className="card animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="card animate-pulse">
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Country-wise Disease Statistics</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive disease data and statistics for all countries
        </p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <div className="card bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Countries</p>
              <p className="text-2xl font-bold text-gray-900">{countryData.length}</p>
            </div>
            <GlobeIcon className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-700 font-medium">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(countryData.reduce((sum, c) => sum + c.totalCases, 0))}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Total Deaths</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(countryData.reduce((sum, c) => sum + c.totalDeaths, 0))}
              </p>
            </div>
            <ExclamationCircleIcon className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="card bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Diseases Tracked</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Continent Filter */}
          <select
            value={selectedContinent}
            onChange={(e) => {
              setSelectedContinent(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {continents.map(continent => (
              <option key={continent} value={continent}>
                {continent === 'all' ? 'All Continents' : continent}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="totalCases">Sort by Total Cases</option>
            <option value="totalDeaths">Sort by Deaths</option>
            <option value="diseaseCount">Sort by Disease Count</option>
            <option value="casesPerMillion">Sort by Cases per Million</option>
            <option value="country">Sort by Country Name</option>
          </select>

          {/* Results Count */}
          <div className="flex items-center text-sm text-gray-600">
            <FilterIcon className="w-5 h-5 mr-2" />
            {filteredData.length} countries found
          </div>
        </div>
      </motion.div>

      {/* Country Data Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deaths
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diseases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cases/Million
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCountries.map((country, index) => (
                <React.Fragment key={country.countryCode || index}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {country.flag && (
                          <img 
                            src={country.flag} 
                            alt={`${country.country} flag`}
                            className="w-6 h-4 mr-2 rounded"
                          />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white">{country.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" title={formatNumberFull(country.totalCases)}>
                      {formatNumber(country.totalCases)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600" title={formatNumberFull(country.totalActive)}>
                      {formatNumber(country.totalActive)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600" title={formatNumberFull(country.totalDeaths)}>
                      {formatNumber(country.totalDeaths)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {country.diseaseCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatNumber(country.casesPerMillion)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => setExpandedCountry(
                          expandedCountry === country.country ? null : country.country
                        )}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {expandedCountry === country.country ? (
                          <ChevronUpIcon className="w-5 h-5" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </motion.tr>
                  
                  {/* Expanded Disease Details */}
                  {expandedCountry === country.country && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Disease Breakdown</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {country.diseases.map((disease, idx) => (
                              <div key={idx} className="bg-white p-3 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDiseaseColor(disease.name)}`}>
                                    {disease.name}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <p className="text-gray-500">Cases</p>
                                    <p className="font-semibold" title={formatNumberFull(disease.cases)}>
                                      {formatNumber(disease.cases)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Active</p>
                                    <p className="font-semibold text-blue-600" title={formatNumberFull(disease.active)}>
                                      {formatNumber(disease.active)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Deaths</p>
                                    <p className="font-semibold text-red-600" title={formatNumberFull(disease.deaths)}>
                                      {formatNumber(disease.deaths)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Recovered</p>
                                    <p className="font-semibold text-green-600" title={formatNumberFull(disease.recovered)}>
                                      {formatNumber(disease.recovered)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              Showing {indexOfFirstCountry + 1}-{Math.min(indexOfLastCountry, filteredData.length)} of {filteredData.length} countries
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
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
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 hover:bg-gray-50'
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
                className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Statistics; 