// src/pages/Verify.jsx
import React from 'react'
import { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
  const [searchParams] = useSearchParams()

  // stripe sets success and also session_id & tempOrderId per server implementation
  const sessionId = searchParams.get('session_id')
  const tempOrderId = searchParams.get('tempOrderId')
  const success = searchParams.get('success')

  const verifyPayment = async () => {
    try {
      if (!token) {
        // if token not present, nothing to do
        return null
      }

      // if we have sessionId and tempOrderId use verifyStripe flow
      if (sessionId && tempOrderId) {
        const payload = { session_id: sessionId, tempOrderId }
       const response = await axios.post(`${backendUrl}/order/verifyStripe`, payload, { headers: { token } })


        if (response.data.success) {
          setCartItems({})
          navigate('/orders')
        } else {
          toast.error(response.data.message || 'Payment verification failed')
          navigate('/cart')
        }
        return
      }

      // fallback: older flow which used orderId (if present)
      const orderId = searchParams.get('orderId')
      if (orderId) {
       const response = await axios.post(`${backendUrl}/order/verifyStripe`, { orderId }, { headers: { token } })

        if (response.data.success) {
          setCartItems({})
          navigate('/orders')
        } else {
          toast.error(response.data.message || 'Payment verification failed')
          navigate('/cart')
        }
        return
      }

      // nothing to verify — redirect home
      navigate('/')
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data?.message || error.message || 'Verification error')
      navigate('/cart')
    }
  }

  useEffect(() => {
    // verify once on mount (Stripe will redirect here)
    verifyPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  // simple placeholder while verification happens
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">Verifying payment...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we confirm your payment. You will be redirected shortly.</p>
      </div>
    </div>
  )
}

export default Verify
