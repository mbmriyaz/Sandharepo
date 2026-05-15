import React, { useState, useEffect } from 'react'
import { Search, CreditCard, Utensils, Heart, Calendar } from 'lucide-react'
import api from '../services/api'

const Payments = () => {
  const [activeTab, setActiveTab] = useState('sandha')
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7),
    amount: '',
    paid_on: new Date().toISOString().slice(0, 10)
  })

  useEffect(() => {
    fetchMembers()
  }, [search])

  const fetchMembers = async () => {
    try {
      const params = search ? `?search=${search}` : ''
      const response = await api.get(`/members${params}`)
      setMembers(response.data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedMember) {
      alert('Please select a member')
      return
    }

    setLoading(true)
    try {
      const [year, month] = formData.month.split('-')
      const monthDate = `${year}-${month}-01`

      if (activeTab === 'sandha') {
        await api.post(`/payments/sandha/${selectedMember}`, {
          ...formData,
          month: monthDate
        })
        alert('Sandha payment recorded successfully!')
      } else if (activeTab === 'meal') {
        await api.post(`/payments/meal/${selectedMember}`, {
          ...formData,
          month: monthDate
        })
        alert('Meal contribution recorded successfully!')
      } else if (activeTab === 'donation') {
        await api.post('/payments/donations', {
          donor_type: 'Member',
          donor_id: selectedMember,
          amount: parseFloat(formData.amount),
          reason: 'General Donation',
          dated: formData.paid_on
        })
        alert('Donation recorded successfully!')
      }

      setFormData({
        month: new Date().toISOString().slice(0, 7),
        amount: '',
        paid_on: new Date().toISOString().slice(0, 10)
      })
    } catch (error) {
      alert('Error recording payment: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'sandha', label: 'Sandha Payment', icon: CreditCard },
    { id: 'meal', label: 'Meal Contribution', icon: Utensils },
    { id: 'donation', label: 'Donation', icon: Heart },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Payments</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Record Payment</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white/70 mb-1">Search Member</label>
            <div className="flex items-center gap-2">
              <Search size={18} className="text-white/50" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or member no..."
                className="glass-input flex-1"
              />
            </div>
          </div>

          <div className="mb-4 max-h-48 overflow-y-auto">
            {members.map((member) => (
              <div
                key={member.memno}
                onClick={() => setSelectedMember(member.memno)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  selectedMember === member.memno
                    ? 'bg-primary-600/20 border border-primary-500/50'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{member.full_name}</p>
                    <p className="text-sm text-white/50">{member.memno}</p>
                  </div>
                  {selectedMember === member.memno && (
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab !== 'donation' && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Month</label>
                <input
                  type="month"
                  value={formData.month}
                  onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                  className="glass-input w-full"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="glass-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Date</label>
              <input
                type="date"
                value={formData.paid_on}
                onChange={(e) => setFormData(prev => ({ ...prev, paid_on: e.target.value }))}
                className="glass-input w-full"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </form>
        </div>

        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <CreditCard size={18} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Sandha Payment</p>
                <p className="text-sm text-white/50">Member #00001 - Jan 2024</p>
              </div>
              <p className="font-semibold text-green-400">Rs. 300</p>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Utensils size={18} className="text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Meal Contribution</p>
                <p className="text-sm text-white/50">Member #00002 - Jan 2024</p>
              </div>
              <p className="font-semibold text-orange-400">Rs. 500</p>
            </div>
            <div className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Heart size={18} className="text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Donation</p>
                <p className="text-sm text-white/50">Anonymous - Jan 2024</p>
              </div>
              <p className="font-semibold text-purple-400">Rs. 1000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Payments