// frontend/src/components/PaymentSuccessModal.jsx
import React from 'react'

const PaymentSuccessModal = ({ open, onClose, title = 'Payment Successful', message = 'Your payment was successful. Order placed.' }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-green-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-green-600 text-white">Done</button>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccessModal
