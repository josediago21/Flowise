import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, GraduationCap } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-primary-600" />
            <h1 className="ml-2 text-xl font-bold text-gray-900">CRM Profesores</h1>
          </div>
          
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            
            <Link
              to="/horarios"
              className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/horarios') 
                  ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Horarios
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;