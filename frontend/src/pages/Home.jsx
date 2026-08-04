import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import http from '../api/http'
import Menu from '../components/Menu'
import StickyCartBar from '../components/StickyCartBar'
const Home = () => {
  const [menuData, setMenuData] = useState({})
  const [activeTab, setActiveTab] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await http.get('/api/v1/menu')
        setMenuData(res.data.data)
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load menu, please try again')
      } finally {
        setLoading(false)
      }
    }
    fetchMenu()
  }, [])

  const tabs = ['All', ...Object.keys(menuData)]

  const getFilteredData = () => {
    if (activeTab === 'All') return menuData
    return { [activeTab]: menuData[activeTab] || [] }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-2xl font-bold text-[#F0472A]">LOADING...</p>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-8">
      <div className="flex gap-3 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${
              activeTab === tab
                ? 'bg-[#F0472A] text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-8">
        {Object.entries(getFilteredData()).map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-4 text-2xl font-bold text-[#F0472A] ">{category}</h2>
            <Menu items={items} />
          </section>
        ))}
      </div>
      <StickyCartBar/>
    </div>
  )
}

export default Home