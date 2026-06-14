import React, { useState, useContext, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Search, Plus, Upload, LogOut, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import AddDataModal from './AddDataModal';
import AddCallModal from './AddCallModal';
import ChangeStatusModal from './ChangeStatusModal';
import StatusBadge from './StatusBadge';

export const RefreshContext = React.createContext();

export default function Layout() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [projectTitle, setProjectTitle] = useState('CRM Project');
  
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    if (!token) return;
    const fetchCustomers = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/customers/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers", err);
      }
    };
    fetchCustomers();
  }, [token, refreshKey]);

  useEffect(() => {
    if (!token) return;
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.project_title) {
          setProjectTitle(res.data.project_title);
          document.title = res.data.project_title;
        }
      } catch (err) {}
    };
    
    fetchProfile();
    
    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/customers?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const searchResults = searchTerm.trim() === '' ? [] : customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.company && c.company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.contact_number.includes(searchTerm)
  ).slice(0, 5);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col transition-colors duration-200">
        <div className="h-16 flex items-center px-6 bg-gray-950 font-bold text-xl border-b border-gray-800 shrink-0">
          <Link to="/" className="truncate" title={projectTitle}>{projectTitle}</Link>
        </div>
        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <nav className="space-y-1 px-3">
            <Link to="/" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              Dashboard
            </Link>
            <Link to="/companies" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              Company Data
            </Link>
            <Link to="/customers" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              Customer Data
            </Link>
            
            <div className="pt-6 pb-2">
              <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status Lists</p>
            </div>
            <Link to="/customers?status=Not%20Assigned" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <span className="w-2 h-2 rounded-full bg-purple-500 mr-3"></span>Not Assigned
            </Link>
            <Link to="/customers?status=Hotlist" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-3"></span>Hotlist
            </Link>
            <Link to="/customers?status=Confirmed%20List" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-3"></span>Confirmed List
            </Link>
            <Link to="/customers?status=Not%20Responding%20List" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <span className="w-2 h-2 rounded-full bg-yellow-500 mr-3"></span>Not Responding
            </Link>
            <Link to="/customers?status=Callback%20List" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>Callback List
            </Link>
            <Link to="/customers?status=Rejected%20List" className="text-gray-300 hover:bg-gray-800 hover:text-white group flex items-center px-3 py-2 text-sm font-medium rounded-md">
              <span className="w-2 h-2 rounded-full bg-gray-500 mr-3"></span>Rejected List
            </Link>

            <div className="pt-6 pb-2 border-t border-gray-800 mt-6">
              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="w-full text-left text-primary-400 hover:bg-gray-800 hover:text-primary-300 group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors"
              >
                Modify Status
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors duration-200 shrink-0">
          <div className="flex-1 flex items-center">
            <form onSubmit={handleSearch} className="max-w-lg w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors"
                placeholder="Search customers, companies..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {isSearchFocused && searchTerm.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md overflow-hidden z-50 border border-gray-200 dark:border-gray-700">
                  <ul className="max-h-60 overflow-y-auto">
                    {searchResults.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No matching records</li>
                    ) : (
                      searchResults.map(c => (
                        <li key={c.id}>
                          <Link 
                            to={`/customers?search=${encodeURIComponent(c.name)}`}
                            className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0"
                          >
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                              <span className="mr-2">{c.company.name} •</span> <StatusBadge status={c.status} />
                            </div>
                          </Link>
                        </li>
                      ))
                    )}
                    {searchResults.length > 0 && (
                      <li>
                        <button 
                          type="submit"
                          className="w-full text-center px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
                        >
                          View all results
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </form>
          </div>
          
          <div className="flex items-center space-x-4 ml-6">
            <button
              onClick={() => setIsCallModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none transition-colors"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Add Call
            </button>
            <button
              onClick={() => setIsDataModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Upload className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Add Data
            </button>
            <ThemeToggle />
            <Link to="/profile" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Profile">
              <User className="h-5 w-5" />
            </Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Logout">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <RefreshContext.Provider value={refreshKey}>
              <Outlet />
            </RefreshContext.Provider>
          </div>
        </main>
      </div>

      {isDataModalOpen && <AddDataModal onClose={() => { setIsDataModalOpen(false); triggerRefresh(); }} token={token} />}
      {isCallModalOpen && <AddCallModal onClose={() => { setIsCallModalOpen(false); triggerRefresh(); }} token={token} />}
      {isStatusModalOpen && <ChangeStatusModal onClose={() => setIsStatusModalOpen(false)} onStatusChange={triggerRefresh} token={token} />}
    </div>
  );
}
