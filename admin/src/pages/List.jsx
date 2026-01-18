import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Fetch List
  const fetchList = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${backendUrl}/product/list`, { headers: { token } })

      if (response.data.success) {
        setList(Array.isArray(response.data.products) ? response.data.products.reverse() : [])
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }

  // Delete Product
  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return

    try {
      setDeletingId(id)
      const response = await axios.post(`${backendUrl}/product/remove`, { id }, { headers: { token } })

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Failed to remove product')
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
          <p className="text-sm text-gray-500">Manage your catalog</p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={fetchList}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm"
          >
            Refresh
          </button>
          <Link
            to="/add"
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition shadow-sm font-medium"
          >
            + Add New Item
          </Link>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : list.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No products found. <Link to="/add" className="text-pink-600 underline">Add one now</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase font-medium text-xs border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Name & Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">In Stock</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    {/* Image */}
                    <td className="px-6 py-4">
                      <img
                        src={(item.image && item.image[0]) || ''}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md border border-gray-200"
                      />
                    </td>

                    {/* Details */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900 line-clamp-1 w-48" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.category} • {item.subCategory || item.type}
                      </p>
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {currency}{item.price}
                    </td>

                    {/* Stock Status */}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        item.inStock 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {item.inStock ? 'In Stock' : 'Out'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        
                        {/* EDIT BUTTON (Blue Pencil) */}
                        <Link 
                          to={`/edit/${item._id}`} 
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                          title="Edit Product"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.691 1.127l-3.233.96a.375.375 0 01-.466-.467l.96-3.233a4.5 4.5 0 011.127-1.691L16.862 4.487z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.5L16.862 4.487" />
                          </svg>
                        </Link>

                        {/* DELETE BUTTON (Red Trash) */}
                        <button
                          onClick={() => removeProduct(item._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition"
                          title="Delete Product"
                          disabled={deletingId === item._id}
                        >
                          {deletingId === item._id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default List