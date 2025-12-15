import { useState } from 'react';
import { diseaseAPI } from '../../api/DiseaseApi';
import { statsAPI } from '../../api/StatsApi';
import NewsApi from '../../api/NewsApi';
import { motion } from 'framer-motion';
import { 
  RefreshIcon, 
  DatabaseIcon,
  NewspaperIcon,
  GlobeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/outline';

const AdminImport = () => {
  const [loading, setLoading] = useState({});
  const [messages, setMessages] = useState([]);

  const addMessage = (type, text) => {
    const id = Date.now();
    setMessages(prev => [...prev, { id, type, text, timestamp: new Date().toLocaleTimeString() }]);
    
    // Auto-remove success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        setMessages(prev => prev.filter(msg => msg.id !== id));
      }, 5000);
    }
  };

  const fetchAllData = async () => {
    setLoading(prev => ({ ...prev, all: true }));
    addMessage('info', 'Starting comprehensive data fetch...');

    try {
      // Fetch diseases
      addMessage('info', 'Fetching disease data from WHO and other sources...');
      const diseases = await diseaseAPI.getAllDiseases();
      addMessage('success', `Fetched ${diseases.data?.length || 0} diseases`);

      // Fetch global statistics
      addMessage('info', 'Fetching global statistics...');
      const stats = await statsAPI.getGlobalStatistics();
      addMessage('success', 'Global statistics updated');

      // Fetch news
      addMessage('info', 'Fetching latest health news...');
      const news = await NewsApi.getLatestNews(20);
      addMessage('success', `Fetched ${news?.length || 0} news articles`);

      // Fetch country data
      addMessage('info', 'Fetching country statistics...');
      const countries = await statsAPI.getCountryStatistics();
      addMessage('success', `Fetched data for ${countries.data?.length || 0} countries`);

      addMessage('success', 'All data fetched successfully!');
    } catch (error) {
      console.error('Error fetching data:', error);
      addMessage('error', `Error: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  const fetchDiseaseData = async () => {
    setLoading(prev => ({ ...prev, diseases: true }));
    addMessage('info', 'Fetching disease data...');

    try {
      const result = await diseaseAPI.getAllDiseases();
      addMessage('success', `Successfully fetched ${result.data?.length || 0} diseases`);
      
      // Log disease names for visibility
      if (result.data && result.data.length > 0) {
        const diseaseNames = result.data.slice(0, 5).map(d => d.name).join(', ');
        addMessage('info', `Including: ${diseaseNames}${result.data.length > 5 ? '...' : ''}`);
      }
    } catch (error) {
      addMessage('error', `Failed to fetch diseases: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, diseases: false }));
    }
  };

  const fetchNewsData = async () => {
    setLoading(prev => ({ ...prev, news: true }));
    addMessage('info', 'Fetching news articles...');

    try {
      const result = await NewsApi.getLatestNews(20);
      addMessage('success', `Successfully fetched ${result?.length || 0} news articles`);
      
      // Show news sources
      if (result && result.length > 0) {
        const sources = [...new Set(result.map(n => n.source))].slice(0, 5).join(', ');
        addMessage('info', `Sources: ${sources}`);
      }
    } catch (error) {
      addMessage('error', `Failed to fetch news: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, news: false }));
    }
  };

  const fetchCountryData = async () => {
    setLoading(prev => ({ ...prev, countries: true }));
    addMessage('info', 'Fetching country statistics...');

    try {
      const result = await statsAPI.getCountryStatistics();
      addMessage('success', `Successfully fetched data for ${result.data?.length || 0} countries`);
      
      // Show top affected countries
      if (result.data && result.data.length > 0) {
        const topCountries = result.data
          .sort((a, b) => b.activeCases - a.activeCases)
          .slice(0, 3)
          .map(c => `${c.country} (${c.activeCases.toLocaleString()})`)
          .join(', ');
        addMessage('info', `Top affected: ${topCountries}`);
      }
    } catch (error) {
      addMessage('error', `Failed to fetch country data: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, countries: false }));
    }
  };

  const dataSources = [
    {
      name: 'All Data Sources',
      description: 'Fetch data from all available sources',
      icon: DatabaseIcon,
      action: fetchAllData,
      loadingKey: 'all',
      color: 'bg-blue-500'
    },
    {
      name: 'Disease Data',
      description: 'WHO outbreak news and disease information',
      icon: ExclamationCircleIcon,
      action: fetchDiseaseData,
      loadingKey: 'diseases',
      color: 'bg-red-500'
    },
    {
      name: 'News Articles',
      description: 'Latest health news from multiple sources',
      icon: NewspaperIcon,
      action: fetchNewsData,
      loadingKey: 'news',
      color: 'bg-green-500'
    },
    {
      name: 'Country Statistics',
      description: 'Real-time statistics by country',
      icon: GlobeIcon,
      action: fetchCountryData,
      loadingKey: 'countries',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="mt-2 text-gray-600">
          Fetch the latest disease data from real-time sources including WHO, disease.sh, and news outlets.
        </p>
      </div>

      {/* Data Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dataSources.map((source) => (
          <motion.div
            key={source.name}
            whileHover={{ scale: 1.02 }}
            className="card"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${source.color} bg-opacity-10`}>
                <source.icon className={`w-6 h-6 ${source.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{source.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={source.action}
                  disabled={loading[source.loadingKey]}
                  className={`mt-3 px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                    loading[source.loadingKey]
                      ? 'bg-gray-400 cursor-not-allowed'
                      : `${source.color} hover:opacity-90`
                  }`}
                >
                  {loading[source.loadingKey] ? (
                    <>
                      <RefreshIcon className="w-4 h-4 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    <>
                      <RefreshIcon className="w-4 h-4" />
                      Fetch Data
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900">Import Log</h3>
          <div className="max-h-96 overflow-y-auto space-y-2 p-4 bg-gray-50 rounded-lg">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 text-sm ${
                  message.type === 'error' ? 'text-red-600' :
                  message.type === 'success' ? 'text-green-600' :
                  'text-gray-600'
                }`}
              >
                {message.type === 'success' && <CheckCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                {message.type === 'error' && <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                <span className="flex-1">{message.text}</span>
                <span className="text-xs text-gray-400">{message.timestamp}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Information */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">About Real-time Data</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>This import feature fetches live data from:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>disease.sh API:</strong> COVID-19 statistics updated every 10 minutes</li>
            <li><strong>WHO RSS Feed:</strong> Latest disease outbreak news</li>
            <li><strong>GDELT Project:</strong> Global health news monitoring</li>
            <li><strong>News API:</strong> Comprehensive news coverage (if API key configured)</li>
          </ul>
          <p className="mt-2">
            Data is fetched in real-time using CORS proxy for sources that don't support direct access.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminImport; 