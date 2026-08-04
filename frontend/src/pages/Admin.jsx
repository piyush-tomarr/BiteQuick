import React, { useState } from 'react'
import AdminAuth from '../components/AdminAuth'
import AdminDash from '../components/AdminDash'

const Admin = () => {
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem('isAdmin') === 'true')

  return isAdmin ? (
    <AdminDash onLogout={() => setIsAdmin(false)} />
  ) : (
    <AdminAuth onLoginSuccess={() => setIsAdmin(true)} />
  )
}

export default Admin