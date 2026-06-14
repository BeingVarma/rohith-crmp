import React, { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

export default function AddDataModal({ onClose, token }) {
  const [activeTab, setActiveTab] = useState('import');
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ company_name: '', company_email: '', company_contact_number: '', name: '', contact_number: '', email: '', status: 'Not Assigned' });
  const [message, setMessage] = useState('');

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    const data = new FormData();
    data.append('file', file);
    try {
      const res = await axios.post('https://shancom-crmp-1.onrender.com/api/customers/import', data, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setMessage(res.data.message);
      setTimeout(onClose, 2000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        setMessage(`Error: ${err.response.data.detail}`);
      } else {
        setMessage('Error importing data');
      }
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('https://shancom-crmp-1.onrender.com/api/customers/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Customer added successfully');
      setTimeout(onClose, 2000);
    } catch (err) {
      setMessage('Error adding customer');
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
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Add Data</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'import' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('import')}
              >
                Import from Excel
              </button>
              <button
                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'manual' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                onClick={() => setActiveTab('manual')}
              >
                Enter Manually
              </button>
            </div>

            {message && <div className="mb-4 text-sm text-center text-primary-600 dark:text-primary-400">{message}</div>}

            {activeTab === 'import' ? (
              <form onSubmit={handleImportSubmit}>
                <div className="mt-2">
                  <input type="file" accept=".xlsx, .csv" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-gray-700 dark:file:text-white" />
                </div>
                <div className="mt-5 sm:mt-6">
                  <button type="submit" className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:text-sm">
                    Upload
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleManualSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                    <input type="text" required value={formData.company_name} onChange={(e) => setFormData({...formData, company_name: e.target.value})} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Email (Optional)</label>
                      <input type="email" value={formData.company_email} onChange={(e) => setFormData({...formData, company_email: e.target.value})} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Contact (Optional)</label>
                      <input type="text" value={formData.company_contact_number} onChange={(e) => setFormData({...formData, company_contact_number: e.target.value})} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                    <input type="text" required value={formData.contact_number} onChange={(e) => setFormData({...formData, contact_number: e.target.value})} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button type="submit" className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:text-sm">
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
