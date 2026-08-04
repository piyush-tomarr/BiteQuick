import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, CircleUserRound, History, LogOut } from 'lucide-react'
import { useSelector } from 'react-redux'


const Navbar = () => {
  const cartItemCount = useSelector(state => state.cart.items.reduce((sum, item) => sum + item.quantity, 0))
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOrderHistory = () => {
    setDropdownOpen(false)
    navigate('/order-history')
  }

  const handleLogout = () => {
    setDropdownOpen(false)
    navigate('/auth')
  }

  return (
    <nav className="sticky top-0 z-40 flex items-center justify-between bg-[#FBF1E9] px-4 py-1 sm:px-5">
      <Link to="/">
        <img src="/logo.png" alt="BiteQuick" className="h-16 w-auto object-contain sm:h-20" />
      </Link>

      <div className="flex items-center gap-4 sm:gap-6">
        <Link to="/cart" className="relative">
          <ShoppingCart size={24} className="text-neutral-800" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#F0472A] text-[11px] font-semibold text-white">
              {cartItemCount}
            </span>
          )}
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-label="Account menu"
          >
            <CircleUserRound size={26} className="text-neutral-800" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-10 w-48 rounded-xl border border-neutral-100 bg-white p-1.5 shadow-xl shadow-black/10">
              <button
                type="button"
                onClick={handleOrderHistory}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <History size={17} />
                Order History
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#F0472A] hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar