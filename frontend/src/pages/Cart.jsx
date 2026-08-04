import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { increaseQty, decreaseQty, removeItem, clearCart } from '../store/cartSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import http from '../api/http'

const DELIVERY_FEE = 40
const PACKAGING_FEE = 20

const Cart = () => {
  const items = useSelector((state) => state.cart.items)
  const dispatch = useDispatch()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const itemTotal = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0)
  const grandTotal = itemTotal + DELIVERY_FEE + PACKAGING_FEE

  const handlePlaceOrder = async () => {
    if (!fullName.trim()) return toast.error('Full name is required')
    if (!phone.trim()) return toast.error('Phone number is required')
    if (!address.trim()) return toast.error('Delivery address is required')

    const payload = {
      customer_name: fullName,
      phone,
      address,
      items: items.map((item) => ({
        menu_item_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }))
    }

    try {
      setLoading(true)
      const res = await http.post('/api/v1/place-order', payload)
      toast.success(res.data.message || 'Order placed successfully')
      dispatch(clearCart())
      navigate('/order-history')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to place order, please try again')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[90vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F0472A]/10">
          <ShoppingCart size={28} className="text-[#F0472A]" />
        </div>
        <p className="text-lg font-semibold text-neutral-700">Cart is empty</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-xl bg-[#F0472A] px-6 py-3 text-sm font-semibold text-white hover:brightness-105 active:brightness-95"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-8">
      <div className="flex flex-col gap-5 rounded-2xl bg-white p-4 shadow-sm shadow-black/5 sm:p-5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <img src={item.image_url} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />

            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900">{item.name}</h3>
              <p className="text-sm text-neutral-500">₹{item.price}</p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5">
              <button type="button" onClick={() => dispatch(decreaseQty(item.id))} className="flex h-5 w-5 items-center justify-center text-neutral-500 hover:text-[#F0472A]" aria-label="Decrease quantity">
                <Minus size={14} />
              </button>
              <span className="min-w-4.5 text-center text-sm font-semibold text-neutral-900">{item.quantity}</span>
              <button type="button" onClick={() => dispatch(increaseQty(item.id))} className="flex h-5 w-5 items-center justify-center text-neutral-500 hover:text-[#F0472A]" aria-label="Increase quantity">
                <Plus size={14} />
              </button>
            </div>

            <button type="button" onClick={() => dispatch(removeItem(item.id))} className="text-[#F0472A] hover:brightness-90" aria-label="Remove item">
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm shadow-black/5">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between text-neutral-500">
            <span>Item Total</span>
            <span>₹{itemTotal}</span>
          </div>
          <div className="flex items-center justify-between text-neutral-500">
            <span>Delivery Fee</span>
            <span>₹{DELIVERY_FEE}</span>
          </div>
          <div className="flex items-center justify-between border-b border-dashed border-neutral-200 pb-3 text-neutral-500">
            <span>Packaging Fee</span>
            <span>₹{PACKAGING_FEE}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-bold text-neutral-900">Grand Total</span>
            <span className="text-base font-bold text-[#F0472A]">₹{grandTotal}</span>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <h2 className="mb-3 font-semibold text-neutral-900">Delivery Details</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 outline-none transition focus:border-[#F0472A] focus:ring-2 focus:ring-[#F0472A]/15" />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 outline-none transition focus:border-[#F0472A] focus:ring-2 focus:ring-[#F0472A]/15" />
          </div>
          <textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery Address" rows={2} className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[15px] text-neutral-800 placeholder:text-neutral-400 outline-none transition focus:border-[#F0472A] focus:ring-2 focus:ring-[#F0472A]/15" />
        </div>
      </div>

      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={loading}
        className="mt-5 w-full rounded-xl bg-linear-to-b from-[#FF5B3D] to-[#F0472A] py-3.5 text-[15px] font-semibold text-white shadow-sm shadow-[#F0472A]/30 transition hover:brightness-105 active:brightness-95 disabled:opacity-60"
      >
        {loading ? 'Placing Order...' : <>Place Order &nbsp;•&nbsp; ₹{grandTotal}</>}
      </button>
    </div>
  )
}

export default Cart