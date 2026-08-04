import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { User, Lock, Eye, EyeOff } from 'lucide-react'

const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'admin123'

const AdminAuth = ({onLoginSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleLogin = () => {
    if (!username || !password) return toast.error('Username and password are required')

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdmin', 'true')
      toast.success('Welcome Admin')
      onLoginSuccess()   
    } else {
      toast.error('Invalid admin credentials')
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF1E9] px-4 py-10">
      <div className="w-full max-w-105 rounded-3xl bg-white p-8 shadow-xl shadow-black/5 sm:p-10">
        <div className="flex items-center justify-center">
          <img src="/logo.png" alt="BiteQuick" className="h-12 w-auto object-contain" />
        </div>

        <h1 className="mt-5 text-center text-lg font-bold text-neutral-900">Admin Login</h1>

        <div className="mt-7 flex flex-col gap-5">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              <User size={20} />
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full rounded-xl border border-neutral-200 bg-white py-3.5 pl-11 pr-4 text-[15px] text-neutral-800 placeholder:text-neutral-400 outline-none transition focus:border-[#F0472A] focus:ring-2 focus:ring-[#F0472A]/15"
            />
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
              <Lock size={20} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-neutral-200 bg-white py-3.5 pl-11 pr-11 text-[15px] text-neutral-800 placeholder:text-neutral-400 outline-none transition focus:border-[#F0472A] focus:ring-2 focus:ring-[#F0472A]/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-xl bg-linear-to-b from-[#FF5B3D] to-[#F0472A] py-3.5 text-[15px] font-semibold text-white shadow-sm shadow-[#F0472A]/30 transition hover:brightness-105 active:brightness-95"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminAuth