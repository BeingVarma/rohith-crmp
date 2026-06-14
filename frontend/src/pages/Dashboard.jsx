import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { RefreshContext } from '../components/Layout';
import { Users, Building2, PhoneForwarded, PhoneMissed, PhoneCall, CheckCircle2, XCircle, FileQuestion } from 'lucide-react';

export default function Dashboard() {
  const { token, logout } = useContext(AuthContext);
  const refreshKey = useContext(RefreshContext);
  const [metrics, setMetrics] = useState({});
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, customersRes] = await Promise.all([
          axios.get('https://shancom-crmp-1.onrender.com/api/metrics/', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('https://shancom-crmp-1.onrender.com/api/customers/', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setMetrics(metricsRes.data);
        setCustomers(customersRes.data);
      } catch (err) {
        if (err.response?.status === 401) logout();
      }
    };
    fetchData();
  }, [token, refreshKey, logout]);

  const getRecent = (status) => {
    return customers.filter(c => c.status === status).slice(-3).reverse();
  };

  const StatusCard = ({ title, status, count, icon: Icon, colorClass, link }) => {
    const recent = getRecent(status);
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow flex flex-col h-full border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className={`p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center ${colorClass}`}>
          <div className="flex items-center space-x-3">
            <Icon size={24} className="opacity-80" />
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <span className="text-2xl font-extrabold">{count || 0}</span>
        </div>
        <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-900/50">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Recent Additions</h4>
          {recent.length > 0 ? (
            <ul className="space-y-3">
              {recent.map(c => (
                <li key={c.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{c.company.name}</p>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 truncate">{c.contact_number}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No recent customers.</p>
          )}
        </div>
        <Link 
          to={link}
          className="block w-full text-center px-4 py-3 bg-gray-100 dark:bg-gray-800 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          View all {count || 0} {title}
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Link to="/companies" className="bg-gradient-to-br from-primary-500 to-primary-700 overflow-hidden shadow rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-1">
          <div className="px-4 py-6 sm:p-8 flex items-center justify-between">
            <div>
              <dt className="text-sm font-medium text-primary-100 uppercase tracking-wider">Total Companies</dt>
              <dd className="mt-2 text-4xl font-extrabold text-white">{metrics['Company Data'] || 0}</dd>
            </div>
            <Building2 size={48} className="text-white opacity-20" />
          </div>
        </Link>
        <Link to="/customers" className="bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden shadow rounded-lg hover:shadow-lg transition-all transform hover:-translate-y-1">
          <div className="px-4 py-6 sm:p-8 flex items-center justify-between">
            <div>
              <dt className="text-sm font-medium text-gray-300 uppercase tracking-wider">Total Customers</dt>
              <dd className="mt-2 text-4xl font-extrabold text-white">{metrics['Customer Data'] || 0}</dd>
            </div>
            <Users size={48} className="text-white opacity-20" />
          </div>
        </Link>
      </div>

      {/* Detailed Status Grid */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white pt-4">Pipeline Overview</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard 
          title="Not Assigned" status="Not Assigned" count={metrics['Not Assigned']} 
          icon={FileQuestion} colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400" link="/customers?status=Not%20Assigned" 
        />
        <StatusCard 
          title="Hotlist" status="Hotlist" count={metrics['Hotlist']} 
          icon={PhoneCall} colorClass="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400" link="/customers?status=Hotlist" 
        />
        <StatusCard 
          title="Confirmed" status="Confirmed List" count={metrics['Confirmed List']} 
          icon={CheckCircle2} colorClass="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" link="/customers?status=Confirmed%20List" 
        />
        <StatusCard 
          title="Not Responding" status="Not Responding List" count={metrics['Not Responding List']} 
          icon={PhoneMissed} colorClass="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400" link="/customers?status=Not%20Responding%20List" 
        />
        <StatusCard 
          title="Callback" status="Callback List" count={metrics['Callback List']} 
          icon={PhoneForwarded} colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" link="/customers?status=Callback%20List" 
        />
        <StatusCard 
          title="Rejected" status="Rejected List" count={metrics['Rejected List']} 
          icon={XCircle} colorClass="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300" link="/customers?status=Rejected%20List" 
        />
      </div>
    </div>
  );
}
