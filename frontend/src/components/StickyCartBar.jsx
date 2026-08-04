import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const StickyCartBar = () => {
  const items = useSelector(state => state.cart.items)
  const navigate = useNavigate()

  if (items.length === 0) return null

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <div className="w-[90vw] fixed bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center justify-between rounded-2xl bg-[#F0472A] px-5 py-4 shadow-xl shadow-black/20 sm:px-8">
      <div className="text-white">
        <p className="text-sm font-medium opacity-90">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
        <p className="text-lg font-bold">₹{totalPrice}</p>
      </div>
      <button
        type="button"
        onClick={() => navigate('/cart')}
        className="rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-[#F0472A] hover:brightness-95"
      >
        Continue
      </button>
    </div>
  )
}

export default StickyCartBar