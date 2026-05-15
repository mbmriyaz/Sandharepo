import React, { useState, useEffect } from 'react'
import { Download, FileText, BarChart3, Users, CreditCard } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const Reports = () => {
  const [activeReport, setActiveReport] = useState('monthly')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const { isAdmin } = useAuth()

  const reports = [
    { id: 'monthly', label: 'Monthly Summary', icon: BarChart3 },
    { id: 'defaulters', label: 'Sandha Defaulters', icon: Users },
    { id: 'meal', label: 'Meal Contributors', icon: CreditCard },
    { id: 'salary', label: 'Staff Salary', icon: FileText },
    { id: 'zakath', label: 'Zakath Summary', icon: Heart },
  ]

  const fetchReport = async () => {
    setLoading(true)
    try {
      let response
      switch (activeReport) {
        case 'monthly':
          response = await api.get(`/reports/monthly-summary?year=${year}&month=${month}`)
          break
        case 'defaulters':
          response = await api.get(`/reports/sandha-defaulters?year=${year}&month=${month}`)
          break
        case 'meal':
          response = await api.get(`/reports/meal-contributors?year=${year}&month=${month}`)
          break
        case 'salary':
          response = await api.get('/reports/staff-salary')
          break
        case 'zakath':
          response = await api.get(`/reports/zakath-summary?year=${year}`)
          break
        default:
          return
      }
      setData(response.data)
    } catch (error) {
      console.error('Error fetching report:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [activeReport, year, month])

  const exportCSV = async () => {
    try {
      const response = await api.get(`/reports/export-csv?report_type=${activeReport}&year=${year}&month=${month}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${activeReport}_report.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Error exporting report')
    }
  }

  const renderReportContent = () => {
    if (!data) return null

    switch (activeReport) {
      case 'monthly':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-white/50 text-sm">Total Sandha</p>
              <p className="text-2xl font-bold text-green-400">Rs. {data.total_sandha?.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-white/50 text-sm">Total Meal</p>
              <p className="text-2xl font-bold text-orange-400">Rs. {data.total_meal?.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-white/50 text-sm">Total Donations</p>
              <p className="text-2xl font-bold text-purple-400">Rs. {data.total_donations?.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-white/50 text-sm">Grand Total</p>
              <p className="text-2xl font-bold text-primary-400">Rs. {data.grand_total?.toLocaleString()}</p>
            </div>
          </div>
        )

      case 'defaulters':
        return (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4">Member No</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Mobile</th>
                  <th className="text-left p-4">Residence</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.map((member) => (
                  <tr key={member.memno} className="border-b border-white/5">
                    <td className="p-4 font-mono">{member.memno}</td>
                    <td className="p-4">{member.full_name}</td>
                    <td className="p-4">{member.mobile_number}</td>
                    <td className="p-4">{member.residence_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!Array.isArray(data) || data.length === 0) && (
              <div className="p-8 text-center text-white/50">No defaulters found</div>
            )}
          </div>
        )

      case 'salary':
        return (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-right p-4">Basic Salary</th>
                  <th className="text-right p-4">Incentive</th>
                  <th className="text-right p-4">Bonus</th>
                  <th className="text-right p-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.map((staff) => (
                  <tr key={staff.id} className="border-b border-white/5">
                    <td className="p-4">{staff.name}</td>
                    <td className="p-4">{staff.category}</td>
                    <td className="p-4 text-right">Rs. {staff.basic_salary?.toLocaleString()}</td>
                    <td className="p-4 text-right">Rs. {staff.incentive?.toLocaleString()}</td>
                    <td className="p-4 text-right">Rs. {staff.bonus?.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold">Rs. {staff.total?.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'zakath':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-4 text-center">
              <p className="text-white/50 text-sm">Total Collected</p>
              <p className="text-2xl font-bold text-green-400">Rs. {data.total_collected?.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-white/50 text-sm">Total Distributed</p>
              <p className="text-2xl font-bold text-orange-400">Rs. {data.total_distributed?.toLocaleString()}</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-white/50 text-sm">Remaining</p>
              <p className="text-2xl font-bold text-primary-400">Rs. {data.remaining?.toLocaleString()}</p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Reports</h1>
        {isAdmin() && (
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeReport === report.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Icon size={18} />
              {report.label}
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-1">Year</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="glass-input w-32"
          />
        </div>
        {activeReport !== 'salary' && activeReport !== 'zakath' && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="glass-input w-32"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('default', { month: 'long' })}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        renderReportContent()
      )}
    </div>
  )
}

export default Reports