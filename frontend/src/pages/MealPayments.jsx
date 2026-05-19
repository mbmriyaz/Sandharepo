import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Utensils, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Simple Pie Chart Component using SVG
const SimplePieChart = ({ paid, unpaid }) => {
  const total = paid + unpaid
  if (total === 0) return null

  const paidAngle = (paid / total) * 360
  const unpaidAngle = (unpaid / total) * 360

  return (
    <div className="flex items-center justify-center">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#ef4444" strokeWidth="40" 
          strokeDasharray={`${unpaidAngle * 1.396} ${360 * 1.396}`} 
          strokeDashoffset="0" transform="rotate(-90 100 100)" />
        <circle cx="100" cy="100" r="80" fill="none" stroke="#16a34a" strokeWidth="40" 
          strokeDasharray={`${paidAngle * 1.396} ${360 * 1.396}`} 
          strokeDashoffset={`-${unpaidAngle * 1.396}`} transform="rotate(-90 100 100)" />
        <text x="100" y="95" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontWeight="bold">
          {Math.round((paid / total) * 100)}%
        </text>
        <text x="100" y="110" textAnchor="middle" fill="var(--text-muted)" fontSize="10">
          Paid
        </text>
      </svg>
    </div>
  )
}

const MealPayments = () => {
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [selectedMember, setSelectedMember] = useState('')
  const [search, setSearch] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())
  const [paymentMode, setPaymentMode] = useState('Partial')
  const [selectedMonths, setSelectedMonths] = useState([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    fetchMembers()
  }, [search])

  useEffect(() => {
    if (selectedMember) {
      fetchSummary()
    }
  }, [selectedMember, year])

  const fetchMembers = async () => {
    try {
      const params = search ? `?search=${search}` : ''
      const response = await api.get(`/members/${params}`)
      let data = response.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = Object.values(data).find(v => Array.isArray(v)) || []
      }
      setMembers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/payments/meal/${selectedMember}/summary?year=${year}`)
      setSummary(response.data)
    } catch (error) {
      console.error('Error fetching summary:', error)
      setSummary(null)
    }
  }

  const toggleMonth = (monthIndex) => {
    if (paymentMode === 'Full') return
    setSelectedMonths(prev => 
      prev.includes(monthIndex) 
        ? prev.filter(m => m !== monthIndex)
        : [...prev, monthIndex]
    )
  }

  const handlePayment = async () => {
    if (!selectedMember || selectedMonths.length === 0) {
      alert('Please select a member and at least one month')
      return
    }

    setLoading(true)
    try {
      const member = members.find(m => m.memno === selectedMember)
      const monthlyAmount = member.meal_contribution_amount || 0

      if (monthlyAmount === 0) {
        alert('This member has no meal contribution amount set')
        setLoading(false)
        return
      }

      for (const month of selectedMonths) {
        const paymentData = {
          year: year,
          month: month,
          amount: monthlyAmount,
          paid_on: new Date().toISOString().split('T')[0],
          payment_mode: paymentMode,
          receipt_no: `MEAL-${year}-${month}-${selectedMember}`
        }

        await api.post(`/payments/meal/${selectedMember}`, paymentData)
      }

      alert(`Meal contribution recorded for ${selectedMonths.length} months!`)
      setSelectedMonths([])
      fetchSummary()
    } catch (error) {
      alert('Error recording payment: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Meal Contribution Payments</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Selection */}
        <div>
          <div className="glass-card p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members..."
                className="glass-input flex-1"
              />
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {members.map((member) => (
                <div 
                  key={member.memno}
                  onClick={() => { setSelectedMember(member.memno); setSelectedMonths([]); }}
                  className={`glass-card p-3 cursor-pointer transition-all ${
                    selectedMember === member.memno ? 'ring-2 ring-primary-500' : 'hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                      {member.full_name?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{member.full_name}</p>
                      <p className="text-xs font-mono text-primary-500">{member.memno}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    🍽️ Meal: Rs. {member.meal_contribution_amount || 0}/mo
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Form & Summary */}
        <div className="lg:col-span-2">
          {selectedMember && summary ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Meal Contribution Summary - {year}
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Monthly</p>
                    <p className="text-lg font-bold text-primary-500">Rs. {summary.monthly_amount}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Annual Total</p>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Rs. {summary.annual_total}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Paid</p>
                    <p className="text-lg font-bold text-green-500">Rs. {summary.paid_amount}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Remaining</p>
                    <p className="text-lg font-bold text-red-500">Rs. {summary.remaining}</p>
                  </div>
                </div>

                {/* Pie Chart */}
                <div className="flex justify-center mb-4">
                  <SimplePieChart 
                    paid={summary.paid_months.length} 
                    unpaid={summary.unpaid_months.length} 
                  />
                </div>

                {/* Month Status Grid */}
                <div className="grid grid-cols-6 gap-2">
                  {MONTHS.map((month, idx) => {
                    const isPaid = summary.paid_months.includes(idx + 1)
                    return (
                      <div 
                        key={month}
                        className={`p-2 rounded text-center text-xs ${
                          isPaid ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}
                      >
                        {isPaid ? <CheckCircle size={14} className="mx-auto mb-1"/> : <XCircle size={14} className="mx-auto mb-1"/>}
                        {month.slice(0, 3)}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Payment Form */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Record Meal Contribution Payment
                </h3>

                {/* Payment Mode */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Payment Mode</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setPaymentMode('Full'); setSelectedMonths([1,2,3,4,5,6,7,8,9,10,11,12]); }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        paymentMode === 'Full' ? 'bg-primary-600 text-white' : 'btn-secondary'
                      }`}
                    >
                      Full Year (Rs. {summary.annual_total})
                    </button>
                    <button
                      onClick={() => { setPaymentMode('Partial'); setSelectedMonths([]); }}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        paymentMode === 'Partial' ? 'bg-primary-600 text-white' : 'btn-secondary'
                      }`}
                    >
                      Partial (Select Months)
                    </button>
                  </div>
                </div>

                {/* Month Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                    Select Months {paymentMode === 'Partial' ? '(click to select)' : '(all selected)'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {MONTHS.map((month, idx) => {
                      const monthNum = idx + 1
                      const isSelected = selectedMonths.includes(monthNum)
                      const isAlreadyPaid = summary.paid_months.includes(monthNum)

                      return (
                        <button
                          key={month}
                          onClick={() => {
                            if (!isAlreadyPaid && paymentMode === 'Partial') {
                              toggleMonth(monthNum)
                            }
                          }}
                          disabled={isAlreadyPaid || paymentMode === 'Full'}
                          className={`p-2 rounded text-xs transition-all ${
                            isAlreadyPaid 
                              ? 'bg-green-500/20 text-green-500 cursor-not-allowed'
                              : isSelected
                                ? 'bg-primary-600 text-white'
                                : 'bg-white/5 hover:bg-white/10'
                          }`}
                        >
                          {month.slice(0, 3)}
                          {isAlreadyPaid && <span className="block text-[10px]">PAID</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Payment Summary */}
                {selectedMonths.length > 0 && (
                  <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <p style={{ color: 'var(--text-primary)' }}>
                      <strong>Selected:</strong> {selectedMonths.length} months
                    </p>
                    <p style={{ color: 'var(--text-primary)' }}>
                      <strong>Amount:</strong> Rs. {selectedMonths.length * summary.monthly_amount}
                    </p>
                  </div>
                )}

                <button 
                  onClick={handlePayment}
                  disabled={loading || selectedMonths.length === 0}
                  className="btn-primary w-full"
                >
                  {loading ? 'Recording...' : 'Record Meal Contribution Payment'}
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              <Utensils size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a member to view meal contribution details and record payments</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MealPayments