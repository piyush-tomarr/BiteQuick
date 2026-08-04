import React, { useState } from 'react'
import { X, User, Phone, MapPin } from 'lucide-react'
import { toast } from 'react-toastify'
import http from '../api/http'

const ADMIN_KEY = 'admin123'
const STATUS_OPTIONS = ['Preparing', 'Out For Delivery', 'Delivered']
const FINAL_STATUSES = ['Cancelled', 'Delivered']

const AdminOrderModal = ({ order, onClose, onUpdateStatus }) => {
  const initialStatus = STATUS_OPTIONS.includes(order?.status) ? order.status : STATUS_OPTIONS[0]
  const [selectedStatus, setSelectedStatus] = useState(initialStatus)
  const [updating, setUpdating] = useState(false)

  if (!order) return null

  const isFinal = FINAL_STATUSES.includes(order.status)

  const handleUpdateStatus = async () => {
    if (selectedStatus === order.status) {
      return toast.info('Status is already set to this value')
    }

    setUpdating(true)
    try {
      const res = await http.patch(
        '/api/v1/orders/status',
        { order_id: order.id, status: selectedStatus },
        { headers: { 'x-admin-key': ADMIN_KEY } }
      )

      toast.success(res.data.message || 'Order status updated')
      onUpdateStatus?.(order.id, selectedStatus)
      onClose()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl shadow-black/10 sm:p-7">
        <div className="flex items-start justify-between">
          <h2 className="text-base font-bold text-neutral-900">Order ID: #BQ{order.id}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-bold text-neutral-900">Customer Details</h3>
          <div className="mt-3 flex flex-col gap-2.5 text-sm text-neutral-600">
            <div className="flex items-center gap-2.5">
              <User size={16} className="shrink-0 text-neutral-400" />
              <span>{order.customer_name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={16} className="shrink-0 text-neutral-400" />
              <span>{order.phone}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-neutral-400" />
              <span>{order.address}</span>
            </div>
          </div>
        </div>

        <hr className="my-5 border-neutral-100" />

        <div>
          <h3 className="text-sm font-bold text-neutral-900">Ordered Items</h3>
          <div className="mt-3 flex flex-col gap-3.5">
            {order.items.map((item) => (
              <div key={item.menu_item_id} className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBF1E9] text-sm font-bold text-[#F0472A]">
                  {item.name.charAt(0)}
                </div>
                <div className="flex-1 text-sm font-semibold text-neutral-800">{item.name}</div>
                <div className="text-sm text-neutral-400">
                  {item.quantity} x ₹{item.price}
                </div>
                <div className="w-16 text-right text-sm font-semibold text-neutral-900">
                  ₹{item.quantity * item.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="my-5 border-neutral-100" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-neutral-900">Total Amount</span>
          <span className="text-base font-bold text-[#F0472A]">
            ₹{Number(order.total_amount).toFixed(0)}
          </span>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-bold text-neutral-900">Update Status</h3>

          {isFinal ? (
            <p className="mt-3 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
              This order is <span className="font-semibold">{order.status}</span> — status cannot be updated further.
            </p>
          ) : (
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                disabled={updating}
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 outline-none focus:border-[#F0472A] focus:ring-2 focus:ring-[#F0472A]/15 disabled:opacity-60 sm:flex-1"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full rounded-xl bg-linear-to-b from-[#FF5B3D] to-[#F0472A] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[#F0472A]/30 transition hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
              >
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminOrderModal