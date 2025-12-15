import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  HomeIcon,
  UserGroupIcon,
  NewspaperIcon,
  DatabaseIcon,
  CogIcon,
  LogoutIcon,
  ChevronLeftIcon
} from '@heroicons/react/outline';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: HomeIcon, exact: true },
    { path: '/admin/diseases', label: 'Diseases', icon: UserGroupIcon },
    { path: '/admin/import', label: 'Import Data', icon: DatabaseIcon },
    { path: '/admin/settings', label: 'Settings', icon: CogIcon },
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ChevronLeftIcon className="w-5 h-5 mr-1" />
                Back to Site
              </Link>
              <span className="ml-4 text-gray-400">|</span>
              <h1 className="ml-4 text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <LogoutIcon className="w-5 h-5 mr-2" />
              Logout
            </motion.button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-5 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                  isActive(item.path, item.exact)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.path, item.exact)
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 