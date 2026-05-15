import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import api from '../services/api'

const MemberForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    id_number: '',
    mobile_number: '',
    whatsapp_number: '',
    permanent_address: '',
    date_of_birth: '',
    civil_status: 'Single',
    occupation: '',
    residence_type: '',
    owner_name: '',
    owner_mobile: '',
    sandha_amount: 300,
    paying_other_masjid: 'No',
    other_masjid_details: '',
    meal_contribution: 'No',
    special_needs: ''
  })
  const [children, setChildren] = useState([])
  const [nonRelated, setNonRelated] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addChild = () => {
    setChildren(prev => [...prev, {
      name: '',
      date_of_birth: '',
      relationship: 'Son',
      school_name: '',
      grade: '',
      quran_madrasa: '',
      occupation: '',
      contact_number: ''
    }])
  }

  const removeChild = (index) => {
    setChildren(prev => prev.filter((_, i) => i !== index))
  }

  const updateChild = (index, field, value) => {
    setChildren(prev => prev.map((child, i) => 
      i === index ? { ...child, [field]: value } : child
    ))
  }

  const addNonRelated = () => {
    setNonRelated(prev => [...prev, {
      name: '',
      id_card: '',
      address: '',
      purpose: ''
    }])
  }

  const removeNonRelated = (index) => {
    setNonRelated(prev => prev.filter((_, i) => i !== index))
  }

  const updateNonRelated = (index, field, value) => {
    setNonRelated(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create member
      const memberRes = await api.post('/members/', formData)
      const memno = memberRes.data.memno
      const newMember = memberRes.data

      // Add children
      for (const child of children) {
        if (child.name.trim()) {
          await api.post(`/members/${memno}/children`, child)
        }
      }

      // Add non-related residents
      for (const resident of nonRelated) {
        if (resident.name.trim()) {
          await api.post(`/members/${memno}/non-related`, resident)
        }
      }

      // Send WhatsApp if requested
      if (formData.send_whatsapp && (newMember.whatsapp_number || newMember.mobile_number)) {
        const phone = (newMember.whatsapp_number || newMember.mobile_number).replace(/\D/g, '')
        const message = `Assalamu Alaikum ${newMember.full_name},\n\nYou have been successfully registered as a member of Masjidh Sandha.\n\nYour Member ID: ${newMember.memno}\nSandha Amount: Rs. ${newMember.sandha_amount}\n\nJazakallah Khair.`
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
        window.open(whatsappUrl, '_blank')
      }

      alert('Member created successfully!' + (formData.send_whatsapp ? ' WhatsApp message sent!' : ''))
      navigate('/members')
    } catch (error) {
      alert('Error creating member: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold">Add New Member</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-400">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="glass-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">ID Number *</label>
              <input
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                className="glass-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Mobile Number *</label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                className="glass-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                className="glass-input w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-1">Permanent Address *</label>
              <textarea
                name="permanent_address"
                value={formData.permanent_address}
                onChange={handleChange}
                className="glass-input w-full h-20 resize-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Civil Status *</label>
              <select
                name="civil_status"
                value={formData.civil_status}
                onChange={handleChange}
                className="glass-input w-full"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Occupation</label>
              <input
                type="text"
                name="occupation"
                value={formData.occupation}
                onChange={handleChange}
                className="glass-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Special Needs</label>
              <input
                type="text"
                name="special_needs"
                value={formData.special_needs}
                onChange={handleChange}
                className="glass-input w-full"
                placeholder="Yes/No. If yes, describe..."
              />
            </div>
          </div>
        </div>

        {/* Residence Information */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-400">Residence Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Residence Type *</label>
              <select
                name="residence_type"
                value={formData.residence_type}
                onChange={handleChange}
                className="glass-input w-full"
                required
              >
                <option value="">Select...</option>
                <option value="Own">Own</option>
                <option value="Rent">Rent</option>
              </select>
            </div>
            {formData.residence_type && (
              <div className="md:col-span-2">
                <div className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Member ID will be</p>
                    <p className="text-2xl font-mono font-bold text-primary-500">
                      {formData.residence_type === 'Own' ? 'PER' : 'REN'}XXXXX
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Sequential ascending order
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {formData.residence_type === 'Own' ? 'Permanent Resident' : 'Rented Resident'}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      Special cases: suffix A, B, C...
                    </p>
                  </div>
                </div>
              </div>
            )}
            {formData.residence_type === 'Rent' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Owner Name</label>
                  <input
                    type="text"
                    name="owner_name"
                    value={formData.owner_name}
                    onChange={handleChange}
                    className="glass-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1">Owner Mobile</label>
                  <input
                    type="tel"
                    name="owner_mobile"
                    value={formData.owner_mobile}
                    onChange={handleChange}
                    className="glass-input w-full"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sandha & Other */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 text-primary-400">Registration Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Sandha Amount *</label>
              <input
                type="number"
                name="sandha_amount"
                value={formData.sandha_amount}
                onChange={handleChange}
                className="glass-input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Paying Other Masjid *</label>
              <select
                name="paying_other_masjid"
                value={formData.paying_other_masjid}
                onChange={handleChange}
                className="glass-input w-full"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            {formData.paying_other_masjid === 'Yes' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white/70 mb-1">Other Masjid Details</label>
                <input
                  type="text"
                  name="other_masjid_details"
                  value={formData.other_masjid_details}
                  onChange={handleChange}
                  className="glass-input w-full"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Meal Contribution</label>
              <select
                name="meal_contribution"
                value={formData.meal_contribution}
                onChange={handleChange}
                className="glass-input w-full"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Children */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-400">Children / Dependents</h2>
            <button type="button" onClick={addChild} className="btn-secondary flex items-center gap-2">
              <Plus size={16} />
              Add Child
            </button>
          </div>
          {children.map((child, index) => (
            <div key={index} className="border border-white/10 rounded-lg p-4 mb-4">
              <div className="flex justify-end mb-2">
                <button type="button" onClick={() => removeChild(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Child Name *"
                  value={child.name}
                  onChange={(e) => updateChild(index, 'name', e.target.value)}
                  className="glass-input"
                  required
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={child.date_of_birth}
                  onChange={(e) => updateChild(index, 'date_of_birth', e.target.value)}
                  className="glass-input"
                />
                <select
                  value={child.relationship_type}
                  onChange={(e) => updateChild(index, 'relationship_type', e.target.value)}
                  className="glass-input"
                >
                  <option value="Head of house hold">Head of house hold</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Son">Son</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Grand Father">Grand Father</option>
                  <option value="Grand Mother">Grand Mother</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="School Name"
                  value={child.school_name}
                  onChange={(e) => updateChild(index, 'school_name', e.target.value)}
                  className="glass-input"
                />
                <input
                  type="text"
                  placeholder="Grade/Class"
                  value={child.grade}
                  onChange={(e) => updateChild(index, 'grade', e.target.value)}
                  className="glass-input"
                />
                <input
                  type="text"
                  placeholder="Quran Madrasa"
                  value={child.quran_madrasa}
                  onChange={(e) => updateChild(index, 'quran_madrasa', e.target.value)}
                  className="glass-input"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Non-Related Residents */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary-400">Non-Related Residents</h2>
            <button type="button" onClick={addNonRelated} className="btn-secondary flex items-center gap-2">
              <Plus size={16} />
              Add Resident
            </button>
          </div>
          {nonRelated.map((resident, index) => (
            <div key={index} className="border border-white/10 rounded-lg p-4 mb-4">
              <div className="flex justify-end mb-2">
                <button type="button" onClick={() => removeNonRelated(index)} className="text-red-400 hover:text-red-300">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={resident.name}
                  onChange={(e) => updateNonRelated(index, 'name', e.target.value)}
                  className="glass-input"
                  required
                />
                <input
                  type="text"
                  placeholder="ID Card Number"
                  value={resident.id_card}
                  onChange={(e) => updateNonRelated(index, 'id_card', e.target.value)}
                  className="glass-input"
                />
                <textarea
                  placeholder="Address"
                  value={resident.address}
                  onChange={(e) => updateNonRelated(index, 'address', e.target.value)}
                  className="glass-input h-20 resize-none"
                />
                <textarea
                  placeholder="Purpose of Staying"
                  value={resident.purpose}
                  onChange={(e) => updateNonRelated(index, 'purpose', e.target.value)}
                  className="glass-input h-20 resize-none"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-4 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="send_whatsapp"
              checked={formData.send_whatsapp || false}
              onChange={(e) => setFormData(prev => ({ ...prev, send_whatsapp: e.target.checked }))}
              className="w-5 h-5 rounded accent-primary-500"
            />
            <div>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Send WhatsApp welcome message</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Automatically send registration confirmation via WhatsApp</p>
            </div>
          </label>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? 'Creating...' : 'Create Member'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default MemberForm