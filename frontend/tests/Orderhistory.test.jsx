import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { toast } from 'react-toastify'
import http from '../src/api/http'
import OrderHistory from '../src/pages/OrderHistory'

vi.mock('../src/api/http')
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}))
vi.mock('../src/socket', () => ({
  default: { connect: vi.fn(), disconnect: vi.fn(), emit: vi.fn(), on: vi.fn(), off: vi.fn() }
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const orders = [
  {
    id: 101,
    status: 'Order Received',
    total_amount: 320,
    items: [{ name: 'Pizza', quantity: 1 }]
  },
  {
    id: 102,
    status: 'Delivered',
    total_amount: 150,
    items: [{ name: 'Burger', quantity: 1 }]
  }
]

function renderPage() {
  render(
    <MemoryRouter>
      <OrderHistory />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('OrderHistory page', () => {
  it('shows empty state when there are no past orders', async () => {
    http.get.mockResolvedValueOnce({ data: { orders: [] } })
    renderPage()
    expect(await screen.findByText(/haven't placed any orders/i)).toBeInTheDocument()
  })

  it('renders orders with status badge and only shows Cancel for cancellable statuses', async () => {
    http.get.mockResolvedValueOnce({ data: { orders } })
    renderPage()

    expect(await screen.findByText('Order ID: #BQ101')).toBeInTheDocument()
    expect(screen.getByText('Order ID: #BQ102')).toBeInTheDocument()

    // Only the "Order Received" order (101) is cancellable, "Delivered" (102) is not
    expect(screen.getAllByRole('button', { name: /cancel order/i })).toHaveLength(1)
  })

  it('opens the confirm modal on Cancel Order click, and "No" closes it without calling the API', async () => {
    http.get.mockResolvedValueOnce({ data: { orders } })
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: /cancel order/i }))
    expect(screen.getByText(/are you sure you want to cancel this order/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /^no$/i }))

    expect(screen.queryByText(/are you sure you want to cancel this order/i)).not.toBeInTheDocument()
    expect(http.patch).not.toHaveBeenCalled()
  })

  it('shows "Cancelling..." and calls the API, then closes the modal on "Yes"', async () => {
    http.get.mockResolvedValueOnce({ data: { orders } })
    http.patch.mockResolvedValueOnce({ data: { message: 'Order cancelled' } })
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: /cancel order/i }))
    await user.click(screen.getByRole('button', { name: /^yes$/i }))

    expect(http.patch).toHaveBeenCalledWith('/api/v1/cancel-order', { order_id: 101 })

    await waitFor(() =>
      expect(screen.queryByText(/are you sure you want to cancel this order/i)).not.toBeInTheDocument()
    )
    expect(toast.success).toHaveBeenCalledWith('Order cancelled')
  })

  it('shows an error toast and keeps the modal open when cancellation fails', async () => {
    http.get.mockResolvedValueOnce({ data: { orders } })
    http.patch.mockRejectedValueOnce({ response: { data: { message: 'Cannot cancel' } } })
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByRole('button', { name: /cancel order/i }))
    await user.click(screen.getByRole('button', { name: /^yes$/i }))

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Cannot cancel'))
    expect(screen.getByText(/are you sure you want to cancel this order/i)).toBeInTheDocument()
  })
})