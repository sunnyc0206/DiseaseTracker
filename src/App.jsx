import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Diseases from './pages/Diseases';
import DiseaseDetail from './pages/DiseaseDetail';
import Statistics from './pages/Statistics';
import News from './pages/News';
import About from './pages/About';
import Tracker from './pages/Tracker';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDiseases from './pages/admin/AdminDiseases';
import AdminNews from './pages/admin/AdminNews';
import AdminImport from './pages/admin/AdminImport';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="diseases" element={<Diseases />} />
        <Route path="diseases/:id" element={<DiseaseDetail />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="news" element={<News />} />
        <Route path="about" element={<About />} />
        <Route path="tracker" element={<Tracker />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="diseases" element={<AdminDiseases />} />
        <Route path="news" element={<AdminNews />} />
        <Route path="import" element={<AdminImport />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}

export default App;
