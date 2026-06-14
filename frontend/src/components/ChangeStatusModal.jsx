import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const statuses = [
  'Not Assigned',
  'Hotlist',
  'Confirmed List',
  'Not Responding List',
  'Callback List',
  'Rejected List'
];

export default function ChangeStatusModal({ onClose, token, onStatusChange, initialCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomer ? initialCustomer.id.toString() : '');
  const [newStatus, setNewStatus] = useState(initialCustomer ? initialCustomer.status : statuses[0]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState(initialCustomer ? `${initialCustomer.name} (${initialCustomer.company?.name || ''})` : '');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/customers/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(res.data);
      } catch (err) {
        setMessage('Failed to load customers');
      }
    };
    fetchCustomers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      setMessage('Please select a valid customer from the list.');
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/customers/${selectedCustomerId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Status updated successfully!');
      if (onStatusChange) onStatusChange();
      setTimeout(onClose, 1500);
    } catch (err) {
      setMessage('Error updating status');
      setIsLoading(false);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerId(customer.id.toString());
    setSearchTerm(`${customer.name} (${customer.company.name})`);
    setIsDropdownOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative z-50 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-visible shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4 rounded-t-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Change Customer Status</h3>
              <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            {message && (
              <div className={`mb-4 text-sm text-center ${message.includes('success') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                      setSelectedCustomerId('');
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    placeholder="Search for a customer..."
                    disabled={!!initialCustomer}
                    className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${initialCustomer ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                  {isDropdownOpen && !initialCustomer && (
                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
                      <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                        {filteredCustomers.length === 0 ? (
                          <li className="px-3 py-2 text-gray-500">No customers found.</li>
                        ) : (
                          filteredCustomers.map(c => (
                            <li 
                              key={c.id} 
                              className="px-3 py-2 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer"
                              onMouseDown={() => handleSelectCustomer(c)}
                            >
                              <span className="font-medium">{c.name}</span> <span className="text-xs text-gray-500">({c.company.name})</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
