import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { User, Lock, Save } from 'lucide-react';

export default function Profile() {
  const { token, logout } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setName(res.data.name || '');
        setUsername(res.data.username || '');
        setProjectTitle(res.data.project_title || 'CRM Project');
      } catch (err) {
        setMessage('Failed to load profile details.');
        setIsError(true);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    
    try {
      const payload = {
        name,
        username,
        project_title: projectTitle,
      };
      if (password) {
        payload.password = password;
      }
      
      await axios.put(`${import.meta.env.VITE_API_URL}/auth/me`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Profile updated successfully!');
      setIsError(false);
      setPassword(''); // clear password field after update
      
      // Dispatch a custom event to notify Layout to update
      window.dispatchEvent(new Event('profileUpdated'));
      
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Failed to update profile.');
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Profile</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Update your personal information and login credentials.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 sm:p-8 transition-colors duration-200">
        {message && (
          <div className={`mb-6 p-4 rounded-md text-sm ${isError ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="pl-10 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This is the username you use to log into the application.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password (Optional)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="pl-10 block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Title</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="e.g. CRM Project"
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">This title will be displayed in the sidebar and browser tab.</p>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors"
            >
              <Save className="-ml-1 mr-2 h-5 w-5" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
