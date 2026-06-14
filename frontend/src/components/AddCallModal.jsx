import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function AddCallModal({ onClose, token }) {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    customer_id: '',
    status_at_time: 'Not Responding List',
    remarks: '',
    call_count: 1
  });
  const [message, setMessage] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.contact_number.includes(customerSearch)
  );

  const selectedCustomer = customers.find(c => c.id === formData.customer_id);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/customers/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers", err);
      }
    };
    fetchCustomers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/calls/`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Call logged successfully');
      setTimeout(onClose, 2000);
    } catch (err) {
      setMessage('Error logging call');
    }
  };

  return (
    <div className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="relative z-50 inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Add Call</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            {message && <div className="mb-4 text-sm text-center text-primary-600 dark:text-primary-400">{message}</div>}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                  <div className="mt-1 relative">
                    <input
                      type="text"
                      required={!formData.customer_id}
                      className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Search and select customer..."
                      value={isDropdownOpen ? customerSearch : (selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.contact_number})` : '')}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setIsDropdownOpen(true);
                        setFormData({ ...formData, customer_id: '' });
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    />
                    {isDropdownOpen && (
                      <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-48 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-700">
                        {filteredCustomers.length === 0 ? (
                          <li className="text-gray-500 dark:text-gray-400 cursor-default select-none relative py-2 pl-3 pr-9">No customers found.</li>
                        ) : (
                          filteredCustomers.map(c => (
                            <li 
                              key={c.id} 
                              className="text-gray-900 dark:text-white cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-700"
                              onClick={() => {
                                setFormData({...formData, customer_id: c.id});
                                setCustomerSearch('');
                                setIsDropdownOpen(false);
                              }}
                            >
                              {c.name} ({c.contact_number})
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select required value={formData.status_at_time} onChange={(e) => setFormData({...formData, status_at_time: e.target.value})} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="Not Responding List">Not Responding</option>
                    <option value="Rejected List">Reject</option>
                    <option value="Callback List">Callback</option>
                    <option value="Hotlist">Hotlist</option>
                    <option value="Confirmed List">Confirmed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                  <textarea required value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} rows={3} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Call Count</label>
                  <input type="number" required min="1" value={formData.call_count} onChange={(e) => setFormData({...formData, call_count: parseInt(e.target.value)})} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="mt-5 sm:mt-6">
                <button type="submit" className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:text-sm">
                  Log Call
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
