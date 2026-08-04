import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Home } from 'lucide-react'
import http from '../api/http'
import socket from '../socket'

const statusStyles = {
  'Order Received': 'bg-orange-100 text-neutral-600',
  'Preparing': 'bg-amber-100 text-amber-700',
  'Out For Delivery': 'bg-blue-100 text-blue-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700'
}

const CANCELLABLE_STATUSES = ['Order Received', 'Preparing']

const OrderHistory = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelling, setCancelling] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await http.get('/api/v1/order-history')
        setOrders(res.data.orders)
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load order history')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    if (orders.length === 0) return

    socket.connect()
    orders.forEach(order => socket.emit('join_order', order.id))

    socket.on('status_update', ({ order_id, status }) => {
      setOrders(prev => prev.map(o => o.id === order_id ? { ...o, status } : o))
    })

    return () => {
      socket.off('status_update')
      socket.disconnect()
    }
  }, [orders.length])

  const handleCancelClick = (orderId) => {
    setCancelTarget(orderId)
  }

  const handleCloseModal = () => {
    if (cancelling) return
    setCancelTarget(null)
  }

  const handleConfirmCancel = async () => {
    setCancelling(true)
    try {
      await http.patch('/api/v1/cancel-order', { order_id: cancelTarget })
      toast.success('Order cancelled')
      setCancelTarget(null)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[90vh] items-center justify-center">
        <p className="text-2xl font-bold text-[#F0472A]">LOADING...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#F0472A]">Order History</h1>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 rounded-xl bg-[#F0472A] px-4 py-2.5 text-sm font-semibold text-white hover:brightness-105 active:brightness-95"
        >
          <Home size={16} />
          Return Home
        </button>
      </div>

      {orders.length === 0 ? (
        <p className="py-16 text-center text-neutral-400">You haven't placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl bg-white p-5 shadow-sm shadow-black/5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-neutral-900">Order ID: #BQ{order.id}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status] || statusStyles['Order Received']}`}>
                  {order.status}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-1">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-sm text-neutral-600">
                    {item.quantity} x {item.name}
                  </p>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                {CANCELLABLE_STATUSES.includes(order.status) ? (
                  <button
                    type="button"
                    onClick={() => handleCancelClick(order.id)}
                    className="text-xs font-semibold text-red-500 hover:underline"
                  >
                    Cancel Order
                  </button>
                ) : <span />}
                <span className="font-semibold text-neutral-900">Total: ₹{order.total_amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-bold text-neutral-900">Cancel Order</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Are you sure you want to cancel this order?
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={cancelling}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:brightness-105 active:brightness-95 disabled:opacity-70"
              >
                {cancelling && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                {cancelling ? 'Cancelling...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderHistory