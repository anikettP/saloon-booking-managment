// backend/utils/notify.js
import { sendOrderEmail } from './mail.js'

/**
 * notifyOrderPaid(req, order)
 * - emits socket event "order-paid" with order summary
 * - sends email receipt if user email exists
 */
export const notifyOrderPaid = async (req, order) => {
  try {
    // 1) socket emit (if server has io)
    const io = req?.app?.get('io')
    const payload = {
      orderId: order._id,
      userId: order.userId,
      localRef: order.localRef,
      amount: order.amount,
      items: order.items,
      date: order.date
    }

    if (io) {
      // Emit to all; frontend will filter by userId
      io.emit('order-paid', payload)
    }

    // 2) email (if order.address.email or order.user email available)
    try {
      const email = order?.address?.email
      const name = order?.address?.firstName || order?.address?.name || ''
      if (email) {
        await sendOrderEmail({ to: email, name, order })
      }
    } catch (emailErr) {
      console.error('notifyOrderPaid: email send failed', emailErr)
    }

    return true
  } catch (err) {
    console.error('notifyOrderPaid error', err)
    return false
  }
}
