import { describe, it, expect, beforeEach, vi } from 'vitest'
import cartReducer, { addItem, removeItem, increaseQty, decreaseQty, clearCart } from '../src/store/cartSlice'

// cartSlice reads localStorage at import time (loadCart), so we stub it
// before each test to keep tests isolated and predictable.
beforeEach(() => {
  vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null)
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {})
})

const pizza = { id: 1, name: 'Pizza', price: '299' }
const burger = { id: 2, name: 'Burger', price: '149' }

describe('cartSlice', () => {
  it('returns empty items array as initial state', () => {
    const state = cartReducer(undefined, { type: '@@INIT' })
    expect(state.items).toEqual([])
  })

  it('adds a new item with quantity 1', () => {
    const state = cartReducer({ items: [] }, addItem(pizza))
    expect(state.items).toHaveLength(1)
    expect(state.items[0]).toMatchObject({ id: 1, quantity: 1 })
  })

  it('increments quantity if item already exists in cart', () => {
    let state = cartReducer({ items: [] }, addItem(pizza))
    state = cartReducer(state, addItem(pizza))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(2)
  })

  it('increases quantity of an existing item', () => {
    let state = { items: [{ ...pizza, quantity: 1 }] }
    state = cartReducer(state, increaseQty(1))
    expect(state.items[0].quantity).toBe(2)
  })

  it('decreases quantity but keeps item if quantity stays above 1', () => {
    let state = { items: [{ ...pizza, quantity: 2 }] }
    state = cartReducer(state, decreaseQty(1))
    expect(state.items[0].quantity).toBe(1)
  })

  it('removes item entirely when decreasing quantity below 1', () => {
    let state = { items: [{ ...pizza, quantity: 1 }] }
    state = cartReducer(state, decreaseQty(1))
    expect(state.items).toHaveLength(0)
  })

  it('removes a specific item via removeItem', () => {
    let state = { items: [{ ...pizza, quantity: 1 }, { ...burger, quantity: 3 }] }
    state = cartReducer(state, removeItem(1))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].id).toBe(2)
  })

  it('does not affect other items when modifying one', () => {
    let state = { items: [{ ...pizza, quantity: 1 }, { ...burger, quantity: 1 }] }
    state = cartReducer(state, increaseQty(1))
    expect(state.items.find(i => i.id === 2).quantity).toBe(1)
  })

  it('clears all items from the cart', () => {
    let state = { items: [{ ...pizza, quantity: 2 }, { ...burger, quantity: 1 }] }
    state = cartReducer(state, clearCart())
    expect(state.items).toEqual([])
  })

  it('ignores increaseQty for an id not present in the cart', () => {
    let state = { items: [{ ...pizza, quantity: 1 }] }
    state = cartReducer(state, increaseQty(999))
    expect(state.items).toHaveLength(1)
    expect(state.items[0].quantity).toBe(1)
  })
})