import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Trash2, Edit2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import ChangeStatusModal from '../components/ChangeStatusModal';
import EditCustomerModal from '../components/EditCustomerModal';

export default function CustomerData() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [statusModalCustomer, setStatusModalCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const searchParams = new URLSearchParams(location.search);
  const statusFilter = searchParams.get('status');
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';

  const filteredCustomers = customers.filter(c => {
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesSearch = searchQuery ? (
      c.name.toLowerCase().includes(searchQuery) ||
      c.company.name.toLowerCase().includes(searchQuery) ||
      c.contact_number.toLowerCase().includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery))
    ) : true;
    return matchesStatus && matchesSearch;
  });

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/customers/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleDeleteCustomer = async (e, customerId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this customer? All their interaction history will be lost.')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/customers/${customerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCustomers();
      } catch (err) {
        console.error("Failed to delete customer", err);
        alert('Failed to delete customer.');
      }
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [token, navigate]);

  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  return (
    <div className="py-2">
      <div>
        <div className="mb-8 flex items-center">
          <Link to="/" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {statusFilter ? `${statusFilter} Customers` : 'Customer Data'}
          </h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors duration-200">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.map((customer) => (
                <React.Fragment key={customer.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => toggleRow(customer.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.company.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{customer.contact_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <StatusBadge 
                        status={customer.status} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatusModalCustomer(customer);
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCustomer(customer);
                          }}
                          className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title="Edit Customer"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteCustomer(e, customer.id)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete Customer"
                        >
                          <Trash2 size={18} />
                        </button>
                        <div className="text-gray-400">
                          {expandedRow === customer.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === customer.id && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                        <div className="text-sm text-gray-900 dark:text-white grid grid-cols-1 md:grid-cols-2 gap-6">
                          
                          <div>
                            <h4 className="font-semibold mb-3 text-lg border-b border-gray-200 dark:border-gray-700 pb-2">Customer Details</h4>
                            <div className="space-y-2">
                              <p><span className="font-medium text-gray-500 dark:text-gray-400">Name:</span> {customer.name}</p>
                              <p><span className="font-medium text-gray-500 dark:text-gray-400">Contact:</span> {customer.contact_number} {customer.email ? `| ${customer.email}` : ''}</p>
                              <p><span className="font-medium text-gray-500 dark:text-gray-400">Project Name:</span> {customer.project_name || 'N/A'}</p>
                              <p><span className="font-medium text-gray-500 dark:text-gray-400">Project Location:</span> {customer.project_location || 'N/A'}</p>
                              <p><span className="font-medium text-gray-500 dark:text-gray-400">State:</span> {customer.state || 'N/A'}</p>
                              <p><span className="font-medium text-gray-500 dark:text-gray-400">Type of Project:</span> {customer.type_of_project || 'N/A'}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-3 text-lg border-b border-gray-200 dark:border-gray-700 pb-2">Interaction History</h4>
                            {customer.calls && customer.calls.length > 0 ? (
                              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                  <thead className="bg-gray-100 dark:bg-gray-800">
                                    <tr>
                                      <th scope="col" className="py-2 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200 sm:pl-6">Date & Time</th>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Status</th>
                                      <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                    {customer.calls.map(call => (
                                      <tr key={call.id}>
                                        <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-400 sm:pl-6">{new Date(call.date_time).toLocaleString()}</td>
                                        <td className="whitespace-nowrap px-3 py-2 text-sm"><StatusBadge status={call.status_at_time} /></td>
                                        <td className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 break-words">{call.remarks}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <p className="text-gray-500 dark:text-gray-400 mt-2">No interaction history yet.</p>
                            )}
                          </div>
                          
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {searchQuery 
                ? `No customers found matching "${searchQuery}".` 
                : statusFilter 
                  ? `No customers found in ${statusFilter}.` 
                  : 'No customers found.'}
            </div>
          )}
        </div>
      </div>
      {statusModalCustomer && (
        <ChangeStatusModal 
          onClose={() => setStatusModalCustomer(null)} 
          token={token} 
          onStatusChange={fetchCustomers}
          initialCustomer={statusModalCustomer}
        />
      )}
      {editingCustomer && (
        <EditCustomerModal
          onClose={() => setEditingCustomer(null)}
          token={token}
          customer={editingCustomer}
          onUpdate={fetchCustomers}
        />
      )}
    </div>
  );
}
