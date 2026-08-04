import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { ClipboardList, LogOut } from 'lucide-react'
import http from '../api/http'
import socket from '../socket'
import AdminOrderModal from './AdminOrderModal'

const ADMIN_KEY = 'admin123'

const statusStyles = {
  'Order Received': 'bg-neutral-100 text-neutral-600',
  'Preparing': 'bg-amber-100 text-amber-700',
  'Out For Delivery': 'bg-blue-100 text-blue-700',
  'Delivered': 'bg-green-100 text-green-700',
  'Cancelled': 'bg-red-100 text-red-700'
}

const AdminDash = ({ onLogout }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await http.get('/api/v1/orders', {
          headers: { 'x-admin-key': ADMIN_KEY }
        })
        setOrders(res.data.data)
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    socket.connect()
    socket.emit('join_admin')

    socket.on('order_status_changed', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
        )
      )
    })

    return () => {
      socket.off('order_status_changed')
      socket.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!selectedOrder) return
    const updated = orders.find((o) => o.id === selectedOrder.id)
    if (updated && updated.status !== selectedOrder.status) {
      setSelectedOrder(updated)
    }
  }, [orders, selectedOrder])

  const handleLogout = () => {
    localStorage.removeItem('isAdmin')
    onLogout()
  }

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
  }

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF1E9] md:flex-row">
      {/* Sidebar */}
      <aside className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:w-56 md:flex-col md:items-stretch md:justify-between md:border-b-0 md:border-r md:px-4 md:py-6">
        <nav className="flex gap-1 md:flex-col">
          <div className="flex items-center gap-2.5 rounded-lg bg-[#F0472A] px-3.5 py-2.5 text-sm font-semibold text-white">
            <ClipboardList size={18} />
            <span className="hidden sm:inline">Orders</span>
          </div>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#F0472A] hover:bg-red-50"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        <div className="hidden items-center border-b border-neutral-200 bg-white px-6 py-3 md:flex">
          <img src="/logo.png" alt="BiteQuick" className="h-9 w-auto object-contain" />
        </div>

        <div className="p-4 sm:p-6">
          <h1 className="mb-5 text-lg font-bold text-neutral-900">All Orders</h1>

          {loading ? (
            <div className="flex min-h-[50vh] items-center justify-center">
              <p className="text-2xl font-bold text-[#F0472A]">LOADING...</p>
            </div>
          ) : orders.length === 0 ? (
            <p className="py-16 text-center text-neutral-400">No orders yet.</p>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm shadow-black/5 sm:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-100 text-neutral-500">
                      <th className="px-5 py-3.5 font-semibold">Order ID</th>
                      <th className="px-5 py-3.5 font-semibold">Customer Name</th>
                      <th className="px-5 py-3.5 font-semibold">Status</th>
                      <th className="px-5 py-3.5 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-neutral-50 last:border-0">
                        <td className="px-5 py-4 font-semibold text-neutral-900">#BQ{order.id}</td>
                        <td className="px-5 py-4 text-neutral-700">{order.customer_name}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status] || statusStyles['Order Received']}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleViewOrder(order)}
                            className="rounded-lg border border-[#F0472A] px-4 py-1.5 text-sm font-semibold text-[#F0472A] hover:bg-red-50"
                          >
                            View Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-3 sm:hidden">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-neutral-900">#BQ{order.id}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status] || statusStyles['Order Received']}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-neutral-700">{order.customer_name}</p>
                    <button
                      type="button"
                      onClick={() => handleViewOrder(order)}
                      className="mt-3 w-full rounded-lg border border-[#F0472A] px-4 py-2 text-sm font-semibold text-[#F0472A] hover:bg-red-50"
                    >
                      View Order
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {selectedOrder && (
        <AdminOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  )
}

export default AdminDash