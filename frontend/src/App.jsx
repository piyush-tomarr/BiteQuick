import React from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Cart from './pages/Cart'
import OrderHistory from './pages/OrderHistory'
import Admin from './pages/Admin'
import Auth from './pages/Auth'
import Layout from './layout/Layout'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  return (
    <>

    <ToastContainer position="top-center" autoClose={3000} />
    <Routes>
      <Route path='/auth' element={<Auth/>} />
      <Route element={<Layout/>}>
        <Route path='/' element={<Home/>}/>
        <Route path='/cart' element={<Cart/>}/>
        <Route path='/order-history' element={<OrderHistory/>}/>
      </Route>
      <Route path='/admin' element={<Admin/>}/>

      
    </Routes>
    </>
  )
}

export default App