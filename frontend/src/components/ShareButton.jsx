// frontend/src/components/ShareButton.jsx
import React from 'react'
import { toast } from 'react-toastify'

const ShareButton = ({ product }) => {
  // product should have at least _id and name (or title)
  if (!product) return null

  const shareUrl = `${window.location.origin}/product/${product._id}`
  const shareText = product.name ? `${product.name} - ` : 'Check this product - '

  const onShare = async () => {
    // Try Web Share API first (mobile & supported browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name || 'Product',
          text: (product.description || '').slice(0, 120) || shareText,
          url: shareUrl
        })
        // no toast needed; native UI handles it
      } catch (err) {
        // user cancelled or error — no biggie
        console.error('share error', err)
      }
      return
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Product link copied to clipboard')
    } catch (err) {
      // older browsers: fallback to temp input
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      try {
        document.execCommand('copy')
        toast.success('Product link copied to clipboard')
      } catch (err2) {
        toast.error('Could not copy link — please copy manually: ' + shareUrl)
      } finally {
        document.body.removeChild(input)
      }
    }
  }

  return (
    <button
      onClick={onShare}
      className="px-3 py-1 rounded border hover:bg-gray-100 text-sm"
      title="Share product"
    >
      Share
    </button>
  )
}

export default ShareButton
