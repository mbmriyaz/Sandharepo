import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CreditCard, TrendingUp, Calendar, Home, UserCheck } from 'lucide-react'
import api from '../services/api'

const StatCard = ({ title, value, icon: Icon, color, link }) => (
  <Link to={link} className="glass-card p-6 hover:opacity-80 transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{title}</p>
        <p className="text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </Link>
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    permanentResidents: 0,
    rentedResidents: 0,
    totalFamilies: 0,
    monthlySandha: 0,
    monthlyMeal: 0
  })
  const [recentMembers, setRecentMembers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const date = new Date()
      const year = date.getFullYear()
      const month = date.getMonth() + 1

      const [membersRes, summaryRes] = await Promise.all([
        api.get('/members/?limit=100'),
        api.get(`/reports/monthly-summary?year=${year}&month=${month}`)
      ])

      let members = membersRes.data || []
      // Handle JSONResponse wrapper if present
      if (members && typeof members === 'object' && !Array.isArray(members)) {
        members = Object.values(members).find(v => Array.isArray(v)) || []
      }
      members = Array.isArray(members) ? members : []
      const permanent = members.filter(m => m.memno?.startsWith('PER')).length
      const rented = members.filter(m => m.memno?.startsWith('REN')).length

      setStats({
        totalMembers: members.length,
        permanentResidents: permanent,
        rentedResidents: rented,
        totalFamilies: members.length,
        monthlySandha: summaryRes.data?.total_sandha || 0,
        monthlyMeal: summaryRes.data?.total_meal || 0
      })

      // Get recent members (last 5)
      setRecentMembers(members.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          color="bg-blue-600"
          link="/members"
        />
        <StatCard
          title="Permanent Residents"
          value={stats.permanentResidents}
          icon={Home}
          color="bg-green-600"
          link="/members"
        />
        <StatCard
          title="Rented Residents"
          value={stats.rentedResidents}
          icon={UserCheck}
          color="bg-orange-600"
          link="/members"
        />
        <StatCard
          title="Monthly Sandha"
          value={`Rs. ${stats.monthlySandha.toLocaleString()}`}
          icon={CreditCard}
          color="bg-purple-600"
          link="/payments"
        />
        <StatCard
          title="Meal Contributions"
          value={`Rs. ${stats.monthlyMeal.toLocaleString()}`}
          icon={Calendar}
          color="bg-pink-600"
          link="/payments"
        />
        <StatCard
          title="Total Families"
          value={stats.totalFamilies}
          icon={Users}
          color="bg-teal-600"
          link="/members"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Members */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Members</h2>
            <Link to="/members" className="text-sm text-primary-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentMembers.length > 0 ? recentMembers.map((member) => (
              <Link 
                key={member.memno} 
                to={`/members/${member.memno}`}
                className="flex items-center gap-4 p-3 rounded-lg transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--input-bg)' }}
              >
                <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {member.full_name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{member.full_name}</p>
                  <p className="text-xs font-mono text-primary-500">{member.memno}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  member.memno?.startsWith('PER') 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-orange-500/20 text-orange-500'
                }`}>
                  {member.memno?.startsWith('PER') ? 'PER' : 'REN'}
                </span>
              </Link>
            )) : (
              <p style={{ color: 'var(--text-muted)' }}>No members yet. Add your first member!</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/members/new" className="btn-primary text-center py-3">
              + Add Member
            </Link>
            <Link to="/payments" className="btn-secondary text-center py-3">
              Record Payment
            </Link>
            <Link to="/reports" className="btn-secondary text-center py-3">
              View Reports
            </Link>
            <Link to="/members" className="btn-secondary text-center py-3">
              Search Members
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard