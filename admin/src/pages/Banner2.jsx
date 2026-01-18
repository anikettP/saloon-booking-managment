import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl } from '../App'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'

const Banner2 = ({ token }) => {

  const [imageDesktop, setImageDesktop] = useState(false)
  const [imageMobile, setImageMobile] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(null)
  const [loading, setLoading] = useState(false)

  // --- HELPER TO FIX URL ISSUES ---
  const getApiUrl = (endpoint) => {
    // Remove trailing slash from backendUrl if present
    const cleanBase = backendUrl.replace(/\/+$/, '');
    
    // Check if backendUrl already ends with /api
    if (cleanBase.endsWith('/api')) {
       // If endpoint also starts with api/, remove it to avoid duplication
       return `${cleanBase}/${endpoint.replace(/^api\//, '')}`;
    }
    // Otherwise, just join them normally
    return `${cleanBase}/${endpoint}`;
  }

  const fetchBanner = async () => {
    try {
      // Use helper here
      const response = await axios.get(getApiUrl('api/banner2/get'))
      if (response.data.success && response.data.banner) {
        setCurrentBanner(response.data.banner)
      }
    } catch (error) {
      console.log(error)
      // Silent error for fetch to avoid popups on load
    }
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()

      if (imageDesktop) formData.append("imageDesktop", imageDesktop)
      if (imageMobile) formData.append("imageMobile", imageMobile)

      if (!imageDesktop || !imageMobile) {
        toast.error("Please select both images")
        setLoading(false)
        return
      }

      // Use helper here
      const response = await axios.post(
        getApiUrl("api/banner2/add"),
        formData,
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        setImageDesktop(false)
        setImageMobile(false)
        fetchBanner()
      } else {
        toast.error(response.data.message)
      }

    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchBanner()
  }, [])

  return (
    <div className='w-full max-w-4xl'>
       <h1 className='text-2xl font-bold mb-6 text-gray-700'>Update Home Banner 2</h1>
       
       {currentBanner && (
         <div className='mb-8 p-4 bg-gray-50 rounded border border-gray-200'>
            <p className='text-sm font-bold text-gray-500 mb-2'>Current Active Banner:</p>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <p className='text-xs mb-1'>Desktop View:</p>
                    <img src={currentBanner.imageDesktop} className='w-full h-auto rounded border' alt="Desktop" />
                </div>
                <div>
                    <p className='text-xs mb-1'>Mobile View:</p>
                    <img src={currentBanner.imageMobile} className='w-full h-auto rounded border' alt="Mobile" />
                </div>
            </div>
         </div>
       )}

       <form onSubmit={onSubmitHandler} className='bg-white p-6 rounded shadow-md'>
          <p className='mb-4 font-medium'>Upload New Banner Images</p>
          
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-6'>
             <div className='flex flex-col items-center gap-2'>
                <p className='text-sm text-gray-600'>Desktop Image (Landscape)</p>
                <label htmlFor="desk-img" className='cursor-pointer w-full'>
                    <div className='border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition'>
                        <img className='max-h-full max-w-full object-contain' src={imageDesktop ? URL.createObjectURL(imageDesktop) : assets.upload_area} alt="" />
                    </div>
                    <input onChange={(e) => setImageDesktop(e.target.files[0])} type="file" id="desk-img" hidden />
                </label>
             </div>

             <div className='flex flex-col items-center gap-2'>
                <p className='text-sm text-gray-600'>Mobile Image (Portrait)</p>
                <label htmlFor="mob-img" className='cursor-pointer w-full'>
                    <div className='border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition'>
                        <img className='max-h-full max-w-full object-contain' src={imageMobile ? URL.createObjectURL(imageMobile) : assets.upload_area} alt="" />
                    </div>
                    <input onChange={(e) => setImageMobile(e.target.files[0])} type="file" id="mob-img" hidden />
                </label>
             </div>
          </div>

          <button type='submit' disabled={loading} className='w-full bg-black text-white py-3 px-4 rounded font-medium hover:bg-gray-800 transition'>
             {loading ? "Updating..." : "Update Banner 2"}
          </button>
       </form>
    </div>
  )
}

export default Banner2