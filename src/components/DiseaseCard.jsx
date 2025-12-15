import { Link } from 'react-router-dom';
import { LocationMarkerIcon, UserGroupIcon, ExclamationCircleIcon, ChartBarIcon } from '@heroicons/react/outline';
import { formatNumber, formatNumberFull } from '../utils/formatNumber';
import { motion } from 'framer-motion';

const DiseaseCard = ({ disease }) => {
  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700',
          badge: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
          icon: 'text-red-600 dark:text-red-400',
          accent: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
          badge: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700',
          icon: 'text-orange-600 dark:text-orange-400',
          accent: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20'
        };
      case 'MODERATE':
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
          badge: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
          icon: 'text-yellow-600 dark:text-yellow-400',
          accent: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20'
        };
      case 'LOW':
        return {
          bg: 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700',
          badge: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700',
          icon: 'text-green-600 dark:text-green-400',
          accent: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600',
          icon: 'text-gray-600 dark:text-gray-400',
          accent: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
        };
    }
  };

  const colors = getSeverityColor(disease.severity);

  return (
    <Link to={`/diseases/${disease.id}`} className="block group">
      <motion.div 
        whileHover={{ y: -4 }}
        className={`relative overflow-hidden rounded-xl border-2 ${colors.bg} hover:shadow-xl transition-all duration-300 h-full`}
      >
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${colors.accent} opacity-50`}></div>
        
        {/* Content */}
        <div className="relative p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {disease.name}
              </h3>
              <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${colors.badge} border mt-2`}>
                {disease.severity} SEVERITY
              </span>
            </div>
            <ExclamationCircleIcon className={`w-6 sm:w-8 h-6 sm:h-8 ${colors.icon} opacity-75`} />
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 line-clamp-2 leading-relaxed">
            {disease.description}
          </p>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-50 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Total Cases</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white" title={formatNumberFull(disease.totalCases || 0)}>
                {formatNumber(disease.totalCases || 0)}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 bg-opacity-70 dark:bg-opacity-50 rounded-lg p-2 sm:p-3">
              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                <LocationMarkerIcon className="w-3 sm:w-4 h-3 sm:h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Countries</span>
              </div>
              <p className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">
                {disease.affectedCountries || 0}
              </p>
            </div>
          </div>

          {/* Active Cases Bar */}
          {disease.activeCases > 0 && (
            <div className="mt-3 sm:mt-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Active Cases</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400" title={formatNumberFull(disease.activeCases || 0)}>
                  {formatNumber(disease.activeCases || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-blue-500 dark:bg-blue-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((disease.activeCases / disease.totalCases) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
          
          {/* Last Updated */}
          {disease.lastUpdated && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 sm:mt-4 text-center">
              Updated {new Date(disease.lastUpdated).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      </motion.div>
    </Link>
  );
};

export default DiseaseCard; 