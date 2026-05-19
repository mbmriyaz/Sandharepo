import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, MessageCircle, Users, Calendar, Home, CreditCard, User, QrCode } from 'lucide-react'
import api from '../services/api'

const MemberDetail = () => {
  const { memno } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchDetail() }, [memno])

  const fetchDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      const memberRes = await api.get(`/members/${memno}`)
      setMember(memberRes.data)

      try {
        const childrenRes = await api.get(`/members/${memno}/children`)
        setChildren(Array.isArray(childrenRes.data) ? childrenRes.data : [])
      } catch (e) {
        console.log('Children endpoint not available')
        setChildren([])
      }
    } catch (error) {
      console.error('Error fetching member:', error)
      setError('Failed to load member details')
    } finally {
      setLoading(false)
    }
  }

  const sendWhatsApp = () => {
    if (!member) return
    const phone = member.whatsapp_number || member.mobile_number
    if (!phone) { alert('No phone number available'); return }
    const cleanPhone = phone.replace(/\D/g, '')
    const message = `Assalamu Alaikum ${member.full_name},\n\nYour Member ID: ${member.memno}\nSandha: Rs. ${member.sandha_amount || 0}\nMeal: Rs. ${member.meal_contribution_amount || 0}\n\nJazakallah Khair.`
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const getAge = (dob) => {
    if (!dob) return '-'
    try {
      const birth = new Date(dob)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const m = today.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
      return age
    } catch {
      return '-'
    }
  }

  // Get full URL for images
  const getImageUrl = (path) => {
    if (!path) return null
    if (path.startsWith('http')) return path
    return `http://localhost:8000${path}`
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  )

  if (error) return (
    <div className="text-center py-12">
      <p className="text-red-400 mb-4">{error}</p>
      <button onClick={fetchDetail} className="btn-primary">Retry</button>
    </div>
  )

  if (!member) return (
    <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
      <p className="text-xl mb-4">Member not found</p>
      <button onClick={() => navigate('/members')} className="btn-primary">Back to Members</button>
    </div>
  )

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Member Details</h1>
      </div>

      {/* ID Banner with Photo and QR */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Member Photo */}
            {member.photo_url ? (
              <img 
                src={getImageUrl(member.photo_url)} 
                alt={member.full_name}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary-500/30"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
                {member.full_name?.[0] || '?'}
              </div>
            )}

            <div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Member ID</p>
              <p className="text-3xl font-mono font-bold text-primary-500">{member.memno}</p>
              <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{member.full_name}</p>
              {member.is_sub_member === 'Yes' && (
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                  Sub-member of {member.parent_memno}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* QR Code */}
            {member.qr_code_url && (
              <div className="w-24 h-24 rounded-lg border-2 border-primary-500/30 p-1" style={{ backgroundColor: 'white' }}>
                <img 
                  src={getImageUrl(member.qr_code_url)} 
                  alt="QR Code" 
                  className="w-full h-full"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              </div>
            )}

            {(member.whatsapp_number || member.mobile_number) && (
              <button onClick={sendWhatsApp} className="btn-primary flex items-center gap-2">
                <MessageCircle size={18} /> WhatsApp
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary-500">
            <Users size={20} /> Personal Information
          </h2>
          <div className="space-y-3">
            <InfoRow label="Full Name" value={member.full_name} />
            <InfoRow label="ID Number" value={member.id_number || '-'} />
            <InfoRow label="Mobile" value={member.mobile_number || '-'} />
            <InfoRow label="WhatsApp" value={member.whatsapp_number || '-'} />
            <InfoRow label="Date of Birth" value={member.date_of_birth || '-'} />
            <InfoRow label="Age" value={getAge(member.date_of_birth)} />
            <InfoRow label="Civil Status" value={member.civil_status || '-'} />
            <InfoRow label="Occupation" value={member.occupation || '-'} />
            <InfoRow label="Special Needs" value={member.special_needs || '-'} />
            <InfoRow label="Permanent Address" value={member.permanent_address || '-'} />
          </div>
        </div>

        {/* Residence & Payments */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary-500">
              <Home size={20} /> Residence
            </h2>
            <InfoRow label="Type" value={member.residence_type || '-'} />
            {member.residence_type === 'Rent' && (
              <>
                <InfoRow label="Owner Name" value={member.owner_name || '-'} />
                <InfoRow label="Owner Mobile" value={member.owner_mobile || '-'} />
              </>
            )}
            {member.is_sub_member === 'Yes' && (
              <InfoRow label="Parent Member" value={member.parent_memno || '-'} />
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary-500">
              <CreditCard size={20} /> Payments
            </h2>
            <InfoRow label="Sandha (Monthly)" value={`Rs. ${member.sandha_amount || 0}`} />
            <InfoRow label="Meal Contribution" value={member.meal_contribution || 'No'} />
            {member.meal_contribution === 'Yes' && (
              <InfoRow label="Meal Amount" value={`Rs. ${member.meal_contribution_amount || 0}`} />
            )}
            <InfoRow label="Other Masjid" value={member.paying_other_masjid || 'No'} />
            {member.paying_other_masjid === 'Yes' && (
              <InfoRow label="Masjid Name" value={member.other_masjid_details || '-'} />
            )}
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div className="glass-card p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary-500">
          <Users size={20} /> Family Members
        </h2>
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
          <div className="flex gap-6 text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>Head:</strong> {member.full_name}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>Children:</strong> {member.no_of_children || 0}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>Above 18:</strong> {member.children_above_18 || 0}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>Total:</strong> {member.total_family_members || 1}
            </span>
          </div>
        </div>

        {children.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th className="text-left p-3 text-sm" style={{ color: 'var(--text-muted)' }}>Name</th>
                  <th className="text-left p-3 text-sm" style={{ color: 'var(--text-muted)' }}>Relationship</th>
                  <th className="text-left p-3 text-sm" style={{ color: 'var(--text-muted)' }}>Age</th>
                  <th className="text-left p-3 text-sm" style={{ color: 'var(--text-muted)' }}>School</th>
                  <th className="text-left p-3 text-sm" style={{ color: 'var(--text-muted)' }}>Grade</th>
                  <th className="text-left p-3 text-sm" style={{ color: 'var(--text-muted)' }}>Madrasa</th>
                  <th className="text-left p-3 text-sm" style={{ color: 'var(--text-muted)' }}>Occupation</th>
                </tr>
              </thead>
              <tbody>
                {children.map(child => (
                  <tr key={child.id || child.name} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="p-3 font-medium">{child.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-primary-500/20 text-primary-500">
                        {child.relationship_type || 'Family'}
                      </span>
                    </td>
                    <td className="p-3">{getAge(child.date_of_birth)}</td>
                    <td className="p-3">{child.school_name || '-'}</td>
                    <td className="p-3">{child.grade || '-'}</td>
                    <td className="p-3">{child.quran_madrasa || '-'}</td>
                    <td className="p-3">{child.occupation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No family members recorded</p>
        )}
      </div>
    </div>
  )
}

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3 py-2">
    <div className="flex-1">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{value || '-'}</p>
    </div>
  </div>
)

export default MemberDetail
