import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Dashboard = ({ token }) => {

  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ totalUsers: 0 })
  const [loading, setLoading] = useState(true)

  // Helper to fix URL issues (prevents double /api/api)
  const getApiUrl = (endpoint) => {
    const cleanBase = backendUrl.replace(/\/+$/, '');
    if (cleanBase.endsWith('/api')) {
       return `${cleanBase}/${endpoint.replace(/^api\//, '')}`;
    }
    return `${cleanBase}/${endpoint}`;
  }

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(getApiUrl('api/dashboard/stats'), { headers: { token } })
      if (response.data.success) {
        setUsers(response.data.users)
        setStats({ totalUsers: response.data.totalUsers })
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [token])

  if (loading) {
      return (
        <div className='flex items-center justify-center min-h-[400px] text-gray-500'>
            <div className='animate-pulse'>Loading Dashboard...</div>
        </div>
      )
  }

  return (
    <div className='w-full p-4'>
        <h1 className='text-2xl font-bold mb-6 text-gray-800'>Admin Dashboard</h1>

        {/* Top Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8'>
            <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4 hover:shadow-md transition-shadow'>
                <div className='p-3 bg-blue-50 rounded-full text-blue-600'>
                    {/* Using order_icon as a generic user icon fallback if specific user icon isn't in assets */}
                    <img src={assets.order_icon} className='w-6 h-6' alt="Users" />
                </div>
                <div>
                    <p className='text-gray-500 text-sm font-medium'>Total Users</p>
                    <p className='text-2xl font-bold text-gray-800'>{stats.totalUsers}</p>
                </div>
            </div>
            {/* Placeholder for future stats */}
            {/* <div className='bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4'> ... </div> */}
        </div>

        {/* User List Table */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
            <div className='p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center'>
                <h2 className='font-bold text-gray-700'>Registered Users</h2>
                <span className='text-xs text-gray-500 bg-white border px-2 py-1 rounded'>Latest Registrations</span>
            </div>
            
            <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                    <thead>
                        <tr className='bg-gray-100 text-gray-600 text-xs uppercase tracking-wider'>
                            <th className='p-4 border-b font-semibold'>User ID</th>
                            <th className='p-4 border-b font-semibold'>Name</th>
                            <th className='p-4 border-b font-semibold'>Email</th>
                            <th className='p-4 border-b font-semibold'>Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className='text-sm text-gray-700 divide-y divide-gray-100'>
                        {users.map((user) => (
                            <tr key={user._id} className='hover:bg-gray-50 transition-colors'>
                                <td className='p-4 font-mono text-xs text-gray-500'>
                                    {user._id.slice(-6).toUpperCase()} {/* Showing short ID for cleaner look */}
                                </td>
                                <td className='p-4 font-medium text-gray-900'>
                                    {user.name}
                                </td>
                                <td className='p-4 text-blue-600'>
                                    {user.email}
                                </td>
                                <td className='p-4 text-gray-500'>
                                    {new Date(user.createdAt).toLocaleDateString("en-IN", {
                                        day: '2-digit', 
                                        month: 'short', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {users.length === 0 && (
                <div className='p-10 text-center text-gray-400 bg-gray-50'>
                    No users found in the database.
                </div>
            )}
        </div>
    </div>
  )
}

export default Dashboard