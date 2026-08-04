import { createSlice } from '@reduxjs/toolkit'

const loadCart = () => {
  try {
    const data = localStorage.getItem('cart')
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: loadCart() },
  reducers: {
    addItem: (state, action) => {
      const existing = state.items.find(i => i.id === action.payload.id)
      if (existing) existing.quantity += 1
      else state.items.push({ ...action.payload, quantity: 1 })
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(i => i.id !== action.payload)
    },
    increaseQty: (state, action) => {
      const item = state.items.find(i => i.id === action.payload)
      if (item) item.quantity += 1
    },
    decreaseQty: (state, action) => {
      const item = state.items.find(i => i.id === action.payload)
      if (item && item.quantity > 1) item.quantity -= 1
      else state.items = state.items.filter(i => i.id !== action.payload)
    },
    clearCart: (state) => {
      state.items = []
    }
  }
})

export const { addItem, removeItem, increaseQty, decreaseQty, clearCart } = cartSlice.actions
export default cartSlice.reducer