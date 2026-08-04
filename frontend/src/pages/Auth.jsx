import React, { useState } from 'react'
import Signin from '../components/Signin'
import Signup from '../components/Signup'

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin')

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF1E9] px-4 py-5">
      <div className="w-full max-w-105 rounded-3xl bg-white p-5 shadow-xl shadow-black/5 sm:p-10">
        <div className="flex items-center justify-center ">
          <img src="/logo.png" alt="BiteQuick" className="h-32 w-auto object-contain" />
        </div>

        <div className="mt-2 flex border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab('signin')}
            className={`flex-1 pb-3 text-[15px] font-semibold transition ${
              activeTab === 'signin'
                ? 'border-b-2 border-[#F0472A] text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('signup')}
            className={`flex-1 pb-3 text-[15px] font-semibold transition ${
              activeTab === 'signup'
                ? 'border-b-2 border-[#F0472A] text-neutral-900'
                : 'text-neutral-400 hover:text-neutral-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="mt-7">
          {activeTab === 'signin' ? (
            <Signin switchToSignup={() => setActiveTab('signup')} />
          ) : (
            <Signup switchToSignin={() => setActiveTab('signin')} />
          )}
        </div>
      </div>
    </div>
  )
}

export default Auth