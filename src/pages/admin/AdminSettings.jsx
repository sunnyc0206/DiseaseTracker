import { useState, useEffect } from 'react';
import { adminApi } from '../../api/AdminApi';
import { motion } from 'framer-motion';
import { 
  KeyIcon, 
  SaveIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/outline';

const AdminSettings = () => {
  const [newsApiKey, setNewsApiKey] = useState('');
  const [apiKeyId, setApiKeyId] = useState(null);
  const [saved, setSaved] = useState(false);
  const [apiStatus, setApiStatus] = useState({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load existing API key from backend
    loadApiKey();
    // Check API status
    checkAPIStatus();
  }, []);
  
  const loadApiKey = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getApiKeyByName('NewsAPI');
      if (response.success && response.data) {
        setNewsApiKey(response.data.keyValue || '');
        setApiKeyId(response.data.id);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkAPIStatus = async () => {
    const status = {
      covid19: { name: 'COVID-19 API (disease.sh)', status: 'checking' },
      who: { name: 'WHO RSS Feed', status: 'checking' },
      gdelt: { name: 'GDELT News', status: 'checking' },
      newsapi: { name: 'News API', status: 'checking' }
    };
    
    setApiStatus(status);
    
    // Check COVID-19 API
    try {
      const response = await fetch('https://disease.sh/v3/covid-19/all');
      status.covid19.status = response.ok ? 'active' : 'error';
    } catch {
      status.covid19.status = 'error';
    }
    
    // Check WHO RSS (through CORS proxy)
    try {
      const response = await fetch('https://corsproxy.io/?https://www.who.int/rss-feeds/disease-outbreak-news.xml');
      status.who.status = response.ok ? 'active' : 'error';
    } catch {
      status.who.status = 'error';
    }
    
    // Check GDELT
    try {
      const response = await fetch('https://corsproxy.io/?https://api.gdeltproject.org/api/v2/doc/doc?mode=artlist&maxrecords=1&format=json');
      status.gdelt.status = response.ok ? 'active' : 'error';
    } catch {
      status.gdelt.status = 'error';
    }
    
    // Check News API
    const apiKeyResponse = await adminApi.getPublicApiKey('NewsAPI');
    if (apiKeyResponse.success && apiKeyResponse.data && apiKeyResponse.data.keyValue) {
      try {
        const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKeyResponse.data.keyValue}`);
        status.newsapi.status = response.ok ? 'active' : 'invalid-key';
      } catch {
        status.newsapi.status = 'error';
      }
    } else {
      status.newsapi.status = 'no-key';
    }
    
    setApiStatus(status);
  };
  
  const handleSaveApiKey = async () => {
    try {
      let response;
      if (apiKeyId) {
        // Update existing key
        response = await adminApi.updateApiKey(apiKeyId, {
          keyValue: newsApiKey,
          description: 'API key for fetching news from NewsAPI.org',
          active: true
        });
      } else {
        // Create new key
        response = await adminApi.createApiKey({
          name: 'NewsAPI',
          keyValue: newsApiKey,
          description: 'API key for fetching news from NewsAPI.org',
          active: true
        });
        if (response.success && response.data) {
          setApiKeyId(response.data.id);
        }
      }
      
      if (response.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        checkAPIStatus();
      } else {
        alert('Failed to save API key: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Failed to save API key');
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'error':
      case 'invalid-key':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'no-key':
        return <KeyIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Connected';
      case 'error':
        return 'Connection Error';
      case 'invalid-key':
        return 'Invalid API Key';
      case 'no-key':
        return 'API Key Required';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      
      {/* API Status */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">API Status</h2>
        <div className="space-y-3">
          {Object.entries(apiStatus).map(([key, api]) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(api.status)}
                <span className="font-medium">{api.name}</span>
              </div>
              <span className={`text-sm ${
                api.status === 'active' ? 'text-green-600' : 
                api.status === 'error' || api.status === 'invalid-key' ? 'text-red-600' : 
                'text-gray-500'
              }`}>
                {getStatusText(api.status)}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> This app uses real-time data from various health organizations. 
            Some APIs may be temporarily unavailable due to rate limits or maintenance.
          </p>
        </div>
      </div>
      
      {/* News API Configuration */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">News API Configuration</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          To get comprehensive health news coverage, add your News API key. 
          Get a free key at{' '}
          <a 
            href="https://newsapi.org/register" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
          >
            newsapi.org
            <ExternalLinkIcon className="w-3 h-3" />
          </a>
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              News API Key
            </label>
            <input
              type="text"
              value={newsApiKey}
              onChange={(e) => setNewsApiKey(e.target.value)}
              placeholder={loading ? "Loading..." : "Enter your News API key"}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              disabled={loading}
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSaveApiKey}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <SaveIcon className="w-5 h-5" />
            Save API Key
          </motion.button>
          
          {saved && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-green-600 flex items-center gap-2"
            >
              <CheckCircleIcon className="w-4 h-4" />
              API key saved successfully!
            </motion.p>
          )}
        </div>
      </div>
      
      {/* Data Sources */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Data Sources</h2>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-medium">COVID-19 Data</h3>
            <p className="text-sm text-gray-600">Real-time COVID-19 statistics from disease.sh API</p>
            <a href="https://disease.sh" target="_blank" rel="noopener noreferrer" 
               className="text-xs text-blue-600 hover:text-blue-700">
              disease.sh →
            </a>
          </div>
          
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-medium">WHO Disease Outbreak News</h3>
            <p className="text-sm text-gray-600">Latest disease outbreak reports from WHO RSS feed</p>
            <a href="https://www.who.int/emergencies/disease-outbreak-news" 
               target="_blank" rel="noopener noreferrer" 
               className="text-xs text-blue-600 hover:text-blue-700">
              who.int →
            </a>
          </div>
          
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-medium">GDELT Project</h3>
            <p className="text-sm text-gray-600">Global news monitoring for health-related articles</p>
            <a href="https://www.gdeltproject.org" target="_blank" rel="noopener noreferrer" 
               className="text-xs text-blue-600 hover:text-blue-700">
              gdeltproject.org →
            </a>
          </div>
          
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="font-medium">News API</h3>
            <p className="text-sm text-gray-600">Comprehensive news coverage (requires API key)</p>
            <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" 
               className="text-xs text-blue-600 hover:text-blue-700">
              newsapi.org →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 