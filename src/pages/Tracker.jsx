import { useState, useEffect } from 'react';
import { diseaseAPI } from '../api/DiseaseApi';
import { statsAPI } from '../api/StatsApi';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GlobeIcon,
  LocationMarkerIcon,
  UserGroupIcon,
  TrendingUpIcon,
  SearchIcon,
  FilterIcon,
  RefreshIcon,
  ChartBarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/outline';
import { Line, Bar } from 'react-chartjs-2';
import WorldMap from '../components/WorldMap';
import { TrackerSkeleton } from '../components/PageSkeletons';

const Tracker = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countries, setCountries] = useState([]);
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedDisease, setSelectedDisease] = useState('all');
  const [diseases, setDiseases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('cases');
  const [globalStats, setGlobalStats] = useState(null);

  useEffect(() => {
    fetchTrackerData();
  }, []);

  useEffect(() => {
    filterCountries();
  }, [countries, searchTerm, selectedDisease, sortBy]);

  const fetchTrackerData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data
      const [countriesRes, diseasesRes, globalRes] = await Promise.all([
        statsAPI.getCountryStatistics().catch(() => ({ data: [] })),
        diseaseAPI.getAllDiseases().catch(() => ({ data: [] })),
        statsAPI.getGlobalStatistics().catch(() => ({ data: {} }))
      ]);

      // If no country data, create sample data
      let countryData = countriesRes.data || [];
      if (countryData.length === 0) {
        countryData = [
          {
            id: 1,
            country: 'United States',
            countryCode: 'US',
            population: 331000000,
            activeCases: 125000,
            totalCases: 5000000,
            deaths: 150000,
            recovered: 4725000,
            newCases: 5000,
            trend: 2.5,
            diseases: [
              { name: 'COVID-19', cases: 100000 },
              { name: 'Influenza', cases: 25000 }
            ]
          },
          {
            id: 2,
            country: 'India',
            countryCode: 'IN',
            population: 1380000000,
            activeCases: 200000,
            totalCases: 8000000,
            deaths: 120000,
            recovered: 7680000,
            newCases: 8000,
            trend: -1.2,
            diseases: [
              { name: 'COVID-19', cases: 150000 },
              { name: 'Dengue', cases: 30000 },
              { name: 'Malaria', cases: 20000 }
            ]
          },
          {
            id: 3,
            country: 'Brazil',
            countryCode: 'BR',
            population: 212000000,
            activeCases: 80000,
            totalCases: 3000000,
            deaths: 100000,
            recovered: 2820000,
            newCases: 3000,
            trend: 0.5,
            diseases: [
              { name: 'COVID-19', cases: 50000 },
              { name: 'Dengue', cases: 20000 },
              { name: 'Yellow Fever', cases: 10000 }
            ]
          }
        ];
      }

      setCountries(countryData);
      setDiseases(diseasesRes.data || []);
      setGlobalStats(globalRes.data || {
        totalActiveCases: countryData.reduce((sum, c) => sum + c.activeCases, 0),
        totalCountries: countryData.length,
        totalDeaths: countryData.reduce((sum, c) => sum + c.deaths, 0),
        totalRecovered: countryData.reduce((sum, c) => sum + c.recovered, 0)
      });
      
    } catch (error) {
      console.error('Error fetching tracker data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCountries = () => {
    let filtered = [...countries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(country =>
        country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.countryCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Disease filter
    if (selectedDisease !== 'all') {
      filtered = filtered.filter(country =>
        country.diseases && country.diseases.some(d => d.name === selectedDisease)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'cases':
          return b.activeCases - a.activeCases;
        case 'deaths':
          return b.deaths - a.deaths;
        case 'recovered':
          return b.recovered - a.recovered;
        case 'name':
          return a.country.localeCompare(b.country);
        default:
          return 0;
      }
    });

    setFilteredCountries(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrackerData();
  };

  if (loading) {
    return <TrackerSkeleton />;
  }

  // Chart data for selected country
  const countryChartData = selectedCountry ? {
    labels: ['Active', 'Recovered', 'Deaths'],
    datasets: [{
      label: 'Cases Distribution',
      data: [
        selectedCountry.activeCases,
        selectedCountry.recovered,
        selectedCountry.deaths
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ]
    }]
  } : null;

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Country Disease Tracker</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track disease statistics by country and region
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

      {/* Global Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card bg-blue-50 border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Active Cases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(globalStats?.totalActiveCases || 0).toLocaleString()}
              </p>
            </div>
            <UserGroupIcon className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card bg-green-50 border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Countries Affected</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {globalStats?.totalCountries || countries.length}
              </p>
            </div>
            <GlobeIcon className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card bg-yellow-50 border-yellow-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Total Recovered</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(globalStats?.totalRecovered || 0).toLocaleString()}
              </p>
            </div>
            <TrendingUpIcon className="w-8 h-8 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card bg-red-50 border-red-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Deaths</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(globalStats?.totalDeaths || 0).toLocaleString()}
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="card"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Disease Filter */}
          <div className="relative">
            <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedDisease}
              onChange={(e) => setSelectedDisease(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
            >
              <option value="all">All Diseases</option>
              {diseases.map(disease => (
                <option key={disease.id} value={disease.name}>
                  {disease.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="cases">Most Active Cases</option>
            <option value="deaths">Most Deaths</option>
            <option value="recovered">Most Recovered</option>
            <option value="name">Country Name</option>
          </select>
        </div>
      </motion.div>

      {/* World Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="card"
      >
        <h2 className="text-xl font-semibold mb-4">Disease Distribution Map</h2>
        <WorldMap 
          data={countries.map(c => ({
            country: c.country,
            value: c.activeCases,
            info: {
              totalCases: c.totalCases,
              activeCases: c.activeCases,
              deaths: c.deaths,
              recovered: c.recovered
            }
          }))}
          onCountryClick={(country) => {
            const countryData = countries.find(c => c.country === country.country);
            setSelectedCountry(countryData);
          }}
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Country List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold mb-4">Countries ({filteredCountries.length})</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredCountries.map((country, index) => (
                <motion.div
                  key={country.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCountry(country)}
                  className={`card cursor-pointer transition-all ${
                    selectedCountry?.id === country.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <LocationMarkerIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold">{country.country}</h3>
                        <p className="text-sm text-gray-500">
                          Population: {(country.population || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">
                        {country.activeCases.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">active cases</p>
                      <span className={`text-xs ${country.trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {country.trend > 0 ? '↑' : '↓'} {Math.abs(country.trend)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Selected Country Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {selectedCountry ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">{selectedCountry.country} Details</h2>
              
              <div className="card">
                <h3 className="font-semibold mb-3">Statistics Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Total Cases</p>
                    <p className="text-xl font-bold">{selectedCountry.totalCases.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Active Cases</p>
                    <p className="text-xl font-bold text-blue-600">{selectedCountry.activeCases.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recovered</p>
                    <p className="text-xl font-bold text-green-600">{selectedCountry.recovered.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Deaths</p>
                    <p className="text-xl font-bold text-red-600">{selectedCountry.deaths.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {countryChartData && (
                <div className="card">
                  <h3 className="font-semibold mb-3">Distribution Chart</h3>
                  <Bar data={countryChartData} options={{ responsive: true }} />
                </div>
              )}

              {selectedCountry.diseases && selectedCountry.diseases.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold mb-3">Disease Breakdown</h3>
                  <div className="space-y-2">
                    {selectedCountry.diseases.map((disease, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm font-medium">{disease.name}</span>
                        <span className="text-sm text-gray-600">{disease.cases.toLocaleString()} cases</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12">
              <LocationMarkerIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a country to view detailed statistics</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Tracker; 