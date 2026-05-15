import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Phone, MessageCircle, Users, Calendar, MapPin, Home, CreditCard, Heart, FileText } from 'lucide-react'
import api from '../services/api'

const MemberDetail = () => {
  const { memno } = useParams()
  const navigate = useNavigate()
  const [member, setMember] = useState(null)
  const [children, setChildren] = useState([])
  const [remarks, setRemarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [whatsappMsg, setWhatsappMsg] = useState('')
  const [showWhatsapp, setShowWhatsapp] = useState(false)

  useEffect(() => {
    fetchMemberDetail()
  }, [memno])

  const fetchMemberDetail = async () => {
    try {
      setLoading(true)
      const [memberRes, childrenRes, remarksRes] = await Promise.all([
        api.get(`/members/${memno}`),
        api.get(`/members/${memno}/children`),
        api.get(`/members/${memno}/remarks`)
      ])
      setMember(memberRes.data)
      setChildren(childrenRes.data)
      setRemarks(remarksRes.data)
      // Default WhatsApp message
      setWhatsappMsg(`Assalamu Alaikum ${memberRes.data.full_name},\n\nYou have been successfully registered as a member of Masjidh Sandha.\n\nYour Member ID: ${memberRes.data.memno}\nSandha Amount: Rs. ${memberRes.data.sandha_amount}\n\nJazakallah Khair.`)
    } catch (error) {
      console.error('Error fetching member:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendWhatsApp = () => {
    const phone = member.whatsapp_number || member.mobile_number
    if (!phone) {
      alert('No WhatsApp/Mobile number available')
      return
    }
    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`
    window.open(url, '_blank')
  }

  const getAge = (dob) => {
    if (!dob) return '-'
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!member) {
    return <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>Member not found</div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold">Member Details</h1>
      </div>

      {/* Member ID Banner */}
      <div className="glass-card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold">
            {member.full_name?.[0] || '?'}
          </div>
          <div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Member ID</p>
            <p className="text-3xl font-mono font-bold text-primary-500">{member.memno}</p>
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>{member.full_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {(member.whatsapp_number || member.mobile_number) && (
            <button 
              onClick={() => setShowWhatsapp(!showWhatsapp)}
              className="btn-primary flex items-center gap-2"
            >
              <MessageCircle size={18} />
              WhatsApp
            </button>
          )}
        </div>
      </div>

      {/* WhatsApp Panel */}
      {showWhatsapp && (
        <div className="glass-card p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <MessageCircle size={20} className="text-green-500" />
            Send WhatsApp Message
          </h3>
          <textarea
            value={whatsappMsg}
            onChange={(e) => setWhatsappMsg(e.target.value)}
            className="glass-input w-full h-32 resize-none mb-3"
            placeholder="Type your message..."
          />
          <div className="flex gap-2">
            <button onClick={sendWhatsApp} className="btn-primary flex items-center gap-2">
              <MessageCircle size={18} />
              Send via WhatsApp
            </button>
            <button onClick={() => setShowWhatsapp(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={20} className="text-primary-500" />
            Personal Information
          </h2>
          <div className="space-y-3">
            <InfoRow label="Full Name" value={member.full_name} />
            <InfoRow label="ID Number" value={member.id_number || '-'} />
            <InfoRow label="Mobile" value={member.mobile_number} icon={<Phone size={16} />} />
            <InfoRow label="WhatsApp" value={member.whatsapp_number || '-'} />
            <InfoRow label="Date of Birth" value={member.date_of_birth} icon={<Calendar size={16} />} />
            <InfoRow label="Age" value={getAge(member.date_of_birth)} />
            <InfoRow label="Civil Status" value={member.civil_status} />
            <InfoRow label="Occupation" value={member.occupation || '-'} />
            <InfoRow label="Address" value={member.permanent_address} icon={<MapPin size={16} />} />
          </div>
        </div>

        {/* Residence & Sandha */}
        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Home size={20} className="text-primary-500" />
              Residence Information
            </h2>
            <div className="space-y-3">
              <InfoRow label="Residence Type" value={member.residence_type} />
              {member.residence_type === 'Rent' && (
                <>
                  <InfoRow label="Owner Name" value={member.owner_name || '-'} />
                  <InfoRow label="Owner Mobile" value={member.owner_mobile || '-'} />
                </>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CreditCard size={20} className="text-primary-500" />
              Sandha Information
            </h2>
            <div className="space-y-3">
              <InfoRow label="Sandha Amount" value={`Rs. ${member.sandha_amount}`} />
              <InfoRow label="Paying Other Masjid" value={member.paying_other_masjid} />
              {member.paying_other_masjid === 'Yes' && (
                <InfoRow label="Other Masjid" value={member.other_masjid_details || '-'} />
              )}
              <InfoRow label="Meal Contribution" value={member.meal_contribution} />
            </div>
          </div>
        </div>
      </div>

      {/* Family Members */}
      <div className="glass-card p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Users size={20} className="text-primary-500" />
          Family Members ({member.total_family_members || 1} total)
        </h2>
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
          <div className="flex gap-4 text-sm">
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Head:</strong> {member.full_name}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Children:</strong> {member.no_of_children || 0}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Above 18:</strong> {member.children_above_18 || 0}
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
                  <th className="text-left p-3 text-sm" style={{ color: 'var(--text-muted)' }}>Contact</th>
                </tr>
              </thead>
              <tbody>
                {children.map((child) => (
                  <tr key={child.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td className="p-3 font-medium" style={{ color: 'var(--text-primary)' }}>{child.name}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-xs bg-primary-500/20 text-primary-500">
                        {child.relationship_type}
                      </span>
                    </td>
                    <td className="p-3">{getAge(child.date_of_birth)}</td>
                    <td className="p-3">{child.school_name || '-'}</td>
                    <td className="p-3">{child.grade || '-'}</td>
                    <td className="p-3">{child.quran_madrasa || '-'}</td>
                    <td className="p-3">{child.contact_number || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)' }}>No family members recorded</p>
        )}
      </div>

      {/* Remarks */}
      {remarks.length > 0 && (
        <div className="glass-card p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileText size={20} className="text-primary-500" />
            Remarks
          </h2>
          <div className="space-y-3">
            {remarks.map((remark) => (
              <div key={remark.id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                <p style={{ color: 'var(--text-primary)' }}>{remark.remark}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  By {remark.added_by} on {remark.added_on}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const InfoRow = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    {icon && <span style={{ color: 'var(--text-muted)' }}>{icon}</span>}
    <div className="flex-1">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  </div>
)

export default MemberDetail