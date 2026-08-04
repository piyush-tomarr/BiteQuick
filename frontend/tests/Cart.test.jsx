import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import cartReducer from '../src/store/cartSlice'
import http from '../src/api/http'
import Cart from '../src/pages/Cart'

vi.mock('../src/api/http')
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const item = { id: 1, name: 'Pizza', price: '299', image_url: '/pizza.png', quantity: 2 }

function renderCart(items = []) {
  const store = configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart: { items } }
  })
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    </Provider>
  )
  return store
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('Cart page', () => {
  it('shows empty cart state when there are no items', () => {
    renderCart([])
    expect(screen.getByText(/cart is empty/i)).toBeInTheDocument()
  })

  it('renders cart items with correct grand total (item total + delivery + packaging)', () => {
    renderCart([item])
    expect(screen.getByText('Pizza')).toBeInTheDocument()
    // 299 * 2 = 598 item total, + 40 delivery + 20 packaging = 658
    expect(screen.getByText('₹658')).toBeInTheDocument()
  })

  it('blocks placing order and shows a toast when delivery details are missing', async () => {
    renderCart([item])
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /place order/i }))

    expect(toast.error).toHaveBeenCalledWith('Full name is required')
    expect(http.post).not.toHaveBeenCalled()
  })

  it('places order with correct payload, clears cart and navigates on success', async () => {
    http.post.mockResolvedValueOnce({ data: { message: 'Order placed successfully' } })
    const store = renderCart([item])
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText(/full name/i), 'Piyush')
    await user.type(screen.getByPlaceholderText(/phone number/i), '9999999999')
    await user.type(screen.getByPlaceholderText(/delivery address/i), '123 Street')
    await user.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => expect(http.post).toHaveBeenCalledWith('/api/v1/place-order', {
      customer_name: 'Piyush',
      phone: '9999999999',
      address: '123 Street',
      items: [{ menu_item_id: 1, quantity: 2, price: 299 }]
    }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/order-history'))
    expect(store.getState().cart.items).toEqual([])
    expect(toast.success).toHaveBeenCalled()
  })

  it('shows an error toast and keeps cart intact when placing the order fails', async () => {
    http.post.mockRejectedValueOnce({ response: { data: { message: 'Server error' } } })
    const store = renderCart([item])
    const user = userEvent.setup()

    await user.type(screen.getByPlaceholderText(/full name/i), 'Piyush')
    await user.type(screen.getByPlaceholderText(/phone number/i), '9999999999')
    await user.type(screen.getByPlaceholderText(/delivery address/i), '123 Street')
    await user.click(screen.getByRole('button', { name: /place order/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server error'))
    expect(store.getState().cart.items).toHaveLength(1)
  })
})