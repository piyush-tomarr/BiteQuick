import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import http from '../api/http'

const Signin = ({ switchToSignup }) => {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignin = async () => {
    if (!identifier) return toast.error('Email or username is required')
    if (!password) return toast.error('Password is required')

    const isEmail = identifier.includes('@')
    const payload = isEmail
      ? { email: identifier, password }
      : { username: identifier, password }

    try {
      setLoading(true)
      const res = await http.post('/api/v1/signin', payload)
      localStorage.setItem('token', res.data.token)
      toast.success(res.data.message || 'Signin successful')
      navigate('/')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong, please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
          <Mail size={20} />
        </span>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="Email or Username"
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
        onClick={handleSignin}
        disabled={loading}
        className="w-full rounded-xl bg-linear-to-b from-[#FF5B3D] to-[#F0472A] py-3.5 text-[15px] font-semibold text-white shadow-sm shadow-[#F0472A]/30 transition hover:brightness-105 active:brightness-95 disabled:opacity-60"
      >
        {loading ? 'Signing In...' : 'Sign In'}
      </button>

      <p className="text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={switchToSignup} className="font-semibold text-[#F0472A] hover:underline">
          Sign Up
        </button>
      </p>
    </div>
  )
}

export default Signin