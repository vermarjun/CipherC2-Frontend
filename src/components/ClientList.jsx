import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import api from '../api';

function ClientList() {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current user data:', user);
    console.log('Is admin?', user?.is_admin);
  }, [user]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await api.get('/users');
        console.log('Fetched clients:', response.data); // Debug log
        setClients(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setError(error.response?.data?.detail || error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []); // Remove token dependency since api instance handles it

  if (isLoading) {
    return <div className="text-neutral-400 p-4 text-center">Loading clients...</div>;
  }

  if (error) {
    return (
      <div className="text-red-400 p-4 text-center">
        <p>Error loading clients: {error}</p>
        <p className="text-sm text-neutral-400 mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-lg font-semibold text-white mb-4">Client List</h2>
      {user?.is_admin && (
        <div className="text-sm text-green-400 mb-2">
          Admin access: Enabled
        </div>
      )}
      {!user?.is_admin && (
        <div className="text-sm text-red-400 mb-2">
          Admin access: Disabled (Current user role: {user?.role || 'unknown'})
        </div>
      )}
      {clients.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-neutral-800 text-sm text-neutral-300">
            <thead className="bg-neutral-800 text-neutral-200">
              <tr>
                <th className="px-4 py-2 border border-neutral-800">Name</th>
                <th className="px-4 py-2 border border-neutral-800">Account Created</th>
                <th className="px-4 py-2 border border-neutral-800">Last Active</th>
                <th className="px-4 py-2 border border-neutral-800">Role</th>
                <th className="px-4 py-2 border border-neutral-800">Email</th>
                {user?.is_admin && (
                  <th className="px-4 py-2 border border-neutral-800">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client._id} className="hover:bg-neutral-800">
                  <td className="px-4 py-2 border border-neutral-800">
                    <Link 
                      to={user?.is_admin ? `/dashboard/client/${client._id}` : '#'}
                      className={`hover:text-blue-400 ${!user?.is_admin ? 'cursor-not-allowed' : ''}`}
                      onClick={(e) => {
                        if (!user?.is_admin) {
                          e.preventDefault();
                        }
                      }}
                    >
                      {client.username}
                    </Link>
                  </td>
                  <td className="px-4 py-2 border border-neutral-800">
                    {client.metadata?.account_created_at ? 
                      format(new Date(client.metadata.account_created_at), 'MMM d, yyyy HH:mm') : 
                      'N/A'}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800">
                    {client.metadata?.last_active?.length > 0 ? 
                      format(new Date(client.metadata.last_active[client.metadata.last_active.length - 1]), 'MMM d, yyyy HH:mm') : 
                      'Never'}
                  </td>
                  <td className="px-4 py-2 border border-neutral-800">
                    <span className={`px-2 py-1 rounded-full text-xs ${client.is_admin ? 'bg-purple-900 text-purple-200' : 'bg-neutral-700 text-neutral-300'}`}>
                      {client.is_admin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-4 py-2 border border-neutral-800">{client.email}</td>
                  {user?.is_admin && (
                    <td className="px-4 py-2 border border-neutral-800">
                      <Link
                        to={`/dashboard/client/${client._id}`}
                        className="flex items-center gap-1 px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-md transition-colors duration-200"
                        title="View client details"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-neutral-300 p-4 text-center">
          <p>No clients found.</p>
          <p className="text-sm text-neutral-400 mt-2">There are no users registered in the system.</p>
        </div>
      )}
    </div>
  );
}

export default ClientList; 