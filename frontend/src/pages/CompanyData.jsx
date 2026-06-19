import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Edit2, Mail, Phone, Trash2 } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import EditCompanyModal from '../components/EditCompanyModal';
import AddCompanyModal from '../components/AddCompanyModal';
import DeleteCompanyModal from '../components/DeleteCompanyModal';

export default function CompanyData() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [editModalCompany, setEditModalCompany] = useState(null);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/companies/data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCompanies(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const toggleRow = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [token, navigate]);

  return (
    <div className="py-2">
      <div>
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Company Data</h1>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Add Company
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg transition-colors duration-200">
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Customers Linked</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {companies.map((company) => (
                <React.Fragment key={company.id}>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => toggleRow(company.id)}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>{company.name}</span>
                        {(company.email || company.contact_number) && (
                          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500 dark:text-gray-400 font-normal">
                            {company.email && (
                              <span className="flex items-center"><Mail size={12} className="mr-1" /> {company.email}</span>
                            )}
                            {company.contact_number && (
                              <span className="flex items-center"><Phone size={12} className="mr-1" /> {company.contact_number}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{company.customer_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex justify-end items-center space-x-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditModalCompany(company); }}
                          className="text-primary-500 hover:text-primary-700 transition-colors"
                          title="Edit Company"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCompanyToDelete(company); }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Company"
                        >
                          <Trash2 size={18} />
                        </button>
                        {expandedRow === company.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === company.id && (
                    <tr>
                      <td colSpan="3" className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                        <div className="text-sm text-gray-900 dark:text-white">
                          <h4 className="font-semibold mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Linked Customers</h4>
                          {company.customers && company.customers.length > 0 ? (
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg mt-2">
                              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                  <tr>
                                    <th scope="col" className="py-2 pl-4 pr-3 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Customer Name</th>
                                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Contact</th>
                                    <th scope="col" className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-200">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                  {company.customers.map(cust => (
                                    <tr key={cust.id}>
                                      <td className="whitespace-nowrap py-2 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white">{cust.name}</td>
                                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500 dark:text-gray-400">{cust.contact_number}</td>
                                      <td className="whitespace-nowrap px-3 py-2 text-sm">
                                        <StatusBadge status={cust.status} />
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-400">No customers linked to this company yet.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
          {companies.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No companies found.</div>
          )}
        </div>
      </div>
      
      {editModalCompany && (
        <EditCompanyModal
          company={editModalCompany}
          token={token}
          onClose={() => setEditModalCompany(null)}
          onUpdate={fetchCompanies}
        />
      )}
      <DeleteCompanyModal
        isOpen={!!companyToDelete}
        onClose={() => setCompanyToDelete(null)}
        company={companyToDelete}
        onCompanyDeleted={() => {
          setCompanyToDelete(null);
          fetchCompanies();
        }}
      />
      {isAddModalOpen && (
        <AddCompanyModal
          token={token}
          onClose={() => setIsAddModalOpen(false)}
          onUpdate={fetchCompanies}
        />
      )}
    </div>
  );
}
