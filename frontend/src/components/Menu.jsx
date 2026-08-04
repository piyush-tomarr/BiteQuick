import React from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { Plus, Minus } from 'lucide-react'
import { addItem, increaseQty, decreaseQty } from '../store/cartSlice'
const Menu = ({ items }) => {
    const dispatch = useDispatch()
    const cartItems = useSelector(state => state.cart.items)
  if (!items || items.length === 0) {
    return <p className="py-10 text-center text-neutral-400">No items found.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => {

        const cartItem = cartItems.find(i=>i.id===item.id)
        return <div key={item.id} className="overflow-hidden rounded-lg bg-white shadow-sm shadow-black/5">
          <img src={item.image_url} alt={item.name} className="h-56 w-full object-cover" />
          <div className="p-3">
            <h3 className="font-semibold text-neutral-900">{item.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{item.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-bold text-neutral-900">₹{item.price}</span>
              {cartItem ? (
                  <div className="flex items-center gap-3 rounded-md bg-[#F0472A] px-2 py-1">
                    <button type="button" onClick={() => dispatch(decreaseQty(item.id))} className="text-white">
                      <Minus size={16} />
                    </button>
                    <span className="text-sm font-semibold text-white">{cartItem.quantity}</span>
                    <button type="button" onClick={() => dispatch(increaseQty(item.id))} className="text-white">
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => dispatch(addItem({ id: item.id, name: item.name, price: item.price, image_url: item.image_url }))}
                    className="rounded-md bg-[#F0472A] px-3 py-1.5 text-sm font-semibold text-white hover:brightness-105 active:brightness-95"
                  >
                    Add to Cart
                  </button>
                )}
            </div>
          </div>
        </div>
})}
    </div>
  )
}

export default Menu