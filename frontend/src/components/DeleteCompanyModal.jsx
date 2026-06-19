import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import api from '../services/api';

const DeleteCompanyModal = ({ isOpen, onClose, company, onCompanyDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !company) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    
    try {
      await api.delete(`/companies/${company.id}`);
      onCompanyDeleted();
      onClose();
    } catch (err) {
      console.error('Error deleting company:', err);
      setError(err.response?.data?.detail || 'Failed to delete company. Please try again.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 transition-opacity">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 text-red-600 dark:text-red-500">
            <AlertTriangle size={24} />
            <h3 className="text-xl font-semibold">Warning: Permanent Deletion</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p>You are about to permanently delete this company: <span className="font-semibold text-gray-900 dark:text-white">{company.name}</span>.</p>
            
            <p>All customer records, call records, and any other data associated with this company will also be permanently deleted.</p>
            
            <p className="font-semibold">This action cannot be undone.</p>
            
            <p>Are you sure you want to continue?</p>
          </div>
        </div>
        
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700 space-x-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Company'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCompanyModal;
