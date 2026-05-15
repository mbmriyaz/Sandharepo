import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Users, Home, UserCheck } from 'lucide-react'
import api from '../services/api'

const Members = () => {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  useEffect(() => {
    fetchMembers()
  }, [search])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      setError('')
      setDebugInfo('Fetching...')

      const response = await api.get('/members/')

      // Debug: log everything
      console.log('Full response:', response)
      console.log('Response data:', response.data)
      console.log('Data type:', typeof response.data)
      console.log('Is array:', Array.isArray(response.data))

      setDebugInfo(`Response type: ${typeof response.data}, Is array: ${Array.isArray(response.data)}, Length: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`)

      // Direct assignment - response.data should be the array
      if (Array.isArray(response.data)) {
        setMembers(response.data)
      } else {
        setMembers([])
        setError('API returned non-array data: ' + JSON.stringify(response.data).substring(0, 100))
      }
    } catch (err) {
      console.error('Error:', err)
      setError(err.message || 'Failed to load members')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Members</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Total: {members.length} members
          </p>
        </div>
        <Link to="/members/new" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Member
        </Link>
      </div>

      {/* Debug Panel */}
      {debugInfo && (
        <div className="glass-card p-3 mb-4" style={{ backgroundColor: 'rgba(255,255,0,0.1)' }}>
          <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>Debug: {debugInfo}</p>
        </div>
      )}

      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <Search size={20} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, member no, or mobile..."
            className="glass-input flex-1"
          />
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 mb-4 bg-red-500/10 border-red-500/20">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchMembers} className="btn-secondary mt-2 text-sm">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Link 
              key={member.memno}
              to={`/members/${member.memno}`}
              className="glass-card p-5 hover:opacity-80 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white text-lg font-bold">
                    {member.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{member.full_name}</p>
                    <p className="text-xs font-mono text-primary-500">{member.memno}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  member.memno?.startsWith('PER') 
                    ? 'bg-green-500/20 text-green-500' 
                    : 'bg-orange-500/20 text-orange-500'
                }`}>
                  {member.memno?.startsWith('PER') ? 'PER' : 'REN'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <Users size={14} />
                  <span>{member.total_family_members || 1} family members (incl. head)</span>
                </div>
                {member.children_above_18 > 0 && (
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span>👨‍👩‍👧‍👦 {member.children_above_18} above 18</span>
                  </div>
                )}
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span>📱 {member.mobile_number || '-'}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                  <span>💰 Sandha: Rs. {member.sandha_amount}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {members.length === 0 && !loading && (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <Users size={48} className="mx-auto mb-4 opacity-50" />
          <p className="mb-2">No members found.</p>
          <p className="text-sm">Click "Add Member" to create your first member.</p>
        </div>
      )}
    </div>
  )
}

export default Members