import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  NewspaperIcon,
  DatabaseIcon,
  CogIcon,
  TrendingUpIcon,
  GlobeIcon,
  ExclamationCircleIcon
} from '@heroicons/react/outline';
import { diseaseAPI } from '../../api/DiseaseApi';
import { statsAPI } from '../../api/StatsApi';
import NewsApi from '../../api/NewsApi';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalDiseases: 0,
    newCases: 0,
    totalNews: 0,
    totalCases: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [diseasesRes, newsRes, globalRes] = await Promise.all([
        diseaseAPI.getAllDiseases().catch(() => ({ data: [] })),
        NewsApi.getLatestNews(10).catch(() => []),
        statsAPI.getGlobalStatistics().catch(() => ({ data: {} }))
      ]);

      setStats({
        totalDiseases: diseasesRes.data?.length || 0,
        newCases: globalRes.data?.totalActiveCases || 0,
        totalNews: newsRes?.length || 0,
        totalCases: globalRes.data?.totalCases || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Diseases',
      value: stats.totalDiseases,
      icon: UserGroupIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'News Articles',
      value: stats.totalNews,
      icon: NewspaperIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Global Active Cases',
      value: stats.newCases.toLocaleString(),
      icon: TrendingUpIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Total Cases',
      value: stats.totalCases.toLocaleString(),
      icon: GlobeIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  const adminLinks = [
    {
      title: 'Manage Diseases',
      description: 'Add, edit, or remove disease information',
      icon: UserGroupIcon,
      link: '/admin/diseases',
      color: 'bg-blue-500'
    },
    {
      title: 'Import Data',
      description: 'Fetch latest data from external sources',
      icon: DatabaseIcon,
      link: '/admin/import',
      color: 'bg-green-500'
    },
    {
      title: 'Settings',
      description: 'Configure API keys and data sources',
      icon: CogIcon,
      link: '/admin/settings',
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage disease data and monitor system status
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminLinks.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                to={link.link}
                className="block card hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg ${link.color}`}>
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{link.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{link.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Data Sources Status */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Data Sources</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <span className="text-sm font-medium">WHO Disease Outbreak News</span>
            </div>
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
              <span className="text-sm font-medium">disease.sh API</span>
            </div>
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-sm font-medium">News API</span>
            </div>
            <span className="text-sm text-gray-500">API Key Required</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 