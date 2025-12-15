import { useState, useEffect } from 'react';
import { adminApi } from '../../api/AdminApi';
import { motion } from 'framer-motion';
import { AdminDiseasesSkeleton } from '../../components/PageSkeletons';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  SearchIcon,
  RefreshIcon,
  EyeIcon,
  EyeOffIcon
} from '@heroicons/react/outline';

const AdminDiseases = () => {
  const [diseases, setDiseases] = useState([]);
  const [filteredDiseases, setFilteredDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDisease, setEditingDisease] = useState(null);
  const [backendError, setBackendError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = Infinity; // Keep retrying indefinitely
  const retryDelay = 3000; // 3 seconds
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'MODERATE',
    symptoms: '',
    prevention: '',
    treatment: '',
    activeCases: 0,
    totalCases: 0,
    deaths: 0,
    recoveredCases: 0,
    affectedCountries: 0,
    featured: false
  });

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    filterDiseases();
  }, [diseases, searchTerm]);

  const fetchDiseases = async () => {
    setLoading(true);
    setBackendError(false);
    try {
      const response = await adminApi.getAllDiseases();
      if (response.success) {
        setDiseases(response.data || []);
        setRetryCount(0); // Reset retry count on success
      } else {
        throw new Error(response.error || 'Failed to fetch diseases');
      }
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
        setDiseases([]);
        setLoading(false);
      }
    } finally {
      if (!backendError || retryCount >= maxRetries) {
        setLoading(false);
      }
    }
  };

  const filterDiseases = () => {
    if (!searchTerm) {
      setFilteredDiseases(diseases);
      return;
    }

    const filtered = diseases.filter(disease =>
      disease.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disease.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDiseases(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDisease) {
        // Update existing disease
        await adminApi.updateDisease(editingDisease.id, formData);
        fetchDiseases();
        setShowForm(false);
        setEditingDisease(null);
        resetForm();
      } else {
        // Create new disease
        await adminApi.createDisease(formData);
        fetchDiseases();
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving disease:', error);
      alert('Failed to save disease. Please try again.');
    }
  };

  const handleEdit = (disease) => {
    setEditingDisease(disease);
    setFormData({
      name: disease.name,
      description: disease.description,
      severity: disease.severity,
      symptoms: disease.symptoms || '',
      prevention: disease.prevention || '',
      treatment: disease.treatment || '',
      activeCases: disease.activeCases || 0,
      totalCases: disease.totalCases || 0,
      deaths: disease.deaths || 0,
      recoveredCases: disease.recoveredCases || 0,
      affectedCountries: disease.affectedCountries || 0,
      featured: disease.featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this disease?')) {
      try {
        await adminApi.deleteDisease(id);
        fetchDiseases();
      } catch (error) {
        console.error('Error deleting disease:', error);
        alert('Failed to delete disease. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      severity: 'MODERATE',
      symptoms: '',
      prevention: '',
      treatment: '',
      activeCases: 0,
      totalCases: 0,
      deaths: 0,
      recoveredCases: 0,
      affectedCountries: 0,
      featured: false
    });
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

  if (loading) {
    return <AdminDiseasesSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Diseases</h1>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingDisease(null);
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Disease
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDiseases}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshIcon className="w-5 h-5" />
            Refresh
          </motion.button>
        </div>
      </div>

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

      {/* Form Modal */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-semibold mb-4">
              {editingDisease ? 'Edit Disease' : 'Add New Disease'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Fever, Cough, Headache..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prevention Methods (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={formData.prevention}
                  onChange={(e) => setFormData({ ...formData, prevention: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Wear masks, Wash hands..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Options (comma-separated)
                </label>
                <textarea
                  rows={2}
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Rest, Medication..."
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Active Cases
                  </label>
                  <input
                    type="number"
                    value={formData.activeCases}
                    onChange={(e) => setFormData({ ...formData, activeCases: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Cases
                  </label>
                  <input
                    type="number"
                    value={formData.totalCases}
                    onChange={(e) => setFormData({ ...formData, totalCases: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deaths
                  </label>
                  <input
                    type="number"
                    value={formData.deaths}
                    onChange={(e) => setFormData({ ...formData, deaths: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recovered
                  </label>
                  <input
                    type="number"
                    value={formData.recoveredCases}
                    onChange={(e) => setFormData({ ...formData, recoveredCases: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Affected Countries
                  </label>
                  <input
                    type="number"
                    value={formData.affectedCountries}
                    onChange={(e) => setFormData({ ...formData, affectedCountries: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Number of affected countries"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                  Featured Disease
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingDisease(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingDisease ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Diseases Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disease
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Active Cases
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Cases
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Countries
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDiseases.map((disease) => (
              <tr key={disease.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{disease.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{disease.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(disease.severity)}`}>
                    {disease.severity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(disease.activeCases || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {(disease.totalCases || 0).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {disease.affectedCountries || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleEdit(disease)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    title="Edit"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  {disease.id > 1000 && ( // Only allow deletion of custom diseases
                    <button
                      onClick={() => handleDelete(disease.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDiseases; 