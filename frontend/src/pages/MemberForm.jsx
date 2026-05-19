import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Plus, Trash2, Save, Users, Home, UserX, DollarSign, 
  MessageCircle, Calendar, Briefcase, Phone, Camera, QrCode, 
  X, User, Heart, Upload
} from 'lucide-react'
import api from '../services/api'

const toTitleCase = (str) => {
  if (!str || typeof str !== 'string') return str
  return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
}

const InputField = ({ label, name, type = "text", value, onChange, onBlur, placeholder, options = null, required = false, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {options ? (
      <select name={name} value={value} onChange={onChange} className="form-input font-normal" required={required}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className="form-input font-normal"
      />
    )}
  </div>
)

const MemberForm = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [membersList, setMembersList] = useState([])
  const [message, setMessage] = useState({ type: '', text: '' })
  const [previewMemno, setPreviewMemno] = useState('')
  const [memberPhoto, setMemberPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)

  const [formData, setFormData] = useState({
    full_name: '', id_number: '', mobile_number: '', whatsapp_number: '',
    permanent_address: '', date_of_birth: '', civil_status: 'Single',
    occupation: '', residence_type: '', owner_name: '', owner_mobile: '',
    sandha_amount: 300, meal_contribution: 'No', meal_contribution_amount: 0,
    paying_other_masjid: 'No', other_masjid_details: '',
    special_needs: '', is_sub_member: 'No', parent_memno: '', send_whatsapp: false
  })

  const [familyMembers, setFamilyMembers] = useState([])
  const [nonRelatives, setNonRelatives] = useState([])

  const [newFamily, setNewFamily] = useState({
    name: '', date_of_birth: '', relationship_type: 'Spouse',
    school_name: '', grade: '', quran_madrasa: '', occupation: '', contact_number: ''
  })

  const [newNonRelative, setNewNonRelative] = useState({
    name: '', id_card: '', address: '', purpose: ''
  })

  // Fetch members for sub-member selection
  useEffect(() => {
    api.get('/members/').then(res => {
      let data = res.data
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = Object.values(data).find(v => Array.isArray(v)) || []
      }
      setMembersList(Array.isArray(data) ? data : [])
    }).catch(err => console.error('Error fetching members:', err))
  }, [])

  // Update preview Memno
  useEffect(() => {
    updatePreviewMemno()
  }, [formData.residence_type, formData.is_sub_member, formData.parent_memno, membersList])

  const updatePreviewMemno = () => {
    if (!formData.residence_type) {
      setPreviewMemno('')
      return
    }
    const prefix = formData.residence_type === 'Own' ? 'PER' : 'REN'

    if (formData.is_sub_member === 'Yes' && formData.parent_memno) {
      const existingSubs = membersList.filter(m =>
        m.parent_memno === formData.parent_memno && m.memno && m.memno.startsWith(formData.parent_memno)
      )
      if (existingSubs.length > 0) {
        const suffixes = existingSubs.map(m => {
          const suffix = m.memno.replace(formData.parent_memno, '')
          return suffix.length === 1 ? suffix.charCodeAt(0) : 0
        }).filter(code => code >= 65)
        const maxSuffix = Math.max(...suffixes, 64)
        const nextSuffix = String.fromCharCode(maxSuffix + 1)
        setPreviewMemno(`${formData.parent_memno}${nextSuffix}`)
      } else {
        setPreviewMemno(`${formData.parent_memno}A`)
      }
    } else {
      const regularMembers = membersList.filter(m =>
        m.memno && m.memno.startsWith(prefix) && m.is_sub_member === 'No' && !m.memno.match(/[A-Z]$/)
      )
      if (regularMembers.length > 0) {
        const numbers = regularMembers.map(m => {
          const numMatch = m.memno.replace(prefix, '').match(/^\d+/)
          return numMatch ? parseInt(numMatch[0]) : 0
        })
        const maxNum = Math.max(...numbers, 0)
        setPreviewMemno(`${prefix}${String(maxNum + 1).padStart(5, '0')}`)
      } else {
        setPreviewMemno(`${prefix}00001`)
      }
    }
  }

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }, [])

  const formatOnBlur = useCallback((e) => {
    const { name, value } = e.target
    const fieldsToFormat = ['full_name', 'permanent_address', 'occupation', 'owner_name', 'special_needs', 'other_masjid_details']
    if (fieldsToFormat.includes(name) && value) {
      setFormData(prev => ({ ...prev, [name]: toTitleCase(value) }))
    }
  }, [])

  const handleFamilyChange = useCallback((e) => {
    const { name, value } = e.target
    setNewFamily(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleFamilyBlur = useCallback((e) => {
    const { name, value } = e.target
    const fieldsToFormat = ['name', 'occupation', 'school_name', 'quran_madrasa']
    if (fieldsToFormat.includes(name) && value) {
      setNewFamily(prev => ({ ...prev, [name]: toTitleCase(value) }))
    }
  }, [])

  const handleNonRelativeChange = useCallback((e) => {
    const { name, value } = e.target
    setNewNonRelative(prev => ({ ...prev, [name]: value }))
  }, [])

  const handleNonRelativeBlur = useCallback((e) => {
    const { name, value } = e.target
    const fieldsToFormat = ['name', 'address', 'purpose']
    if (fieldsToFormat.includes(name) && value) {
      setNewNonRelative(prev => ({ ...prev, [name]: toTitleCase(value) }))
    }
  }, [])

  // Photo handling
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMemberPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => setPhotoPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setMemberPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addFamilyMember = () => {
    if (!newFamily.name) return
    setFamilyMembers([...familyMembers, { ...newFamily, id: Date.now() }])
    setNewFamily({
      name: '', date_of_birth: '', relationship_type: 'Spouse',
      school_name: '', grade: '', quran_madrasa: '', occupation: '', contact_number: ''
    })
  }

  const removeFamilyMember = (id) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id))
  }

  const addNonRelative = () => {
    if (!newNonRelative.name) return
    setNonRelatives([...nonRelatives, { ...newNonRelative, id: Date.now() }])
    setNewNonRelative({ name: '', id_card: '', address: '', purpose: '' })
  }

  const removeNonRelative = (id) => {
    setNonRelatives(nonRelatives.filter(n => n.id !== id))
  }

  const clearForm = () => {
    if (window.confirm('Are you sure you want to clear all entered data?')) {
      setFormData({
        full_name: '', id_number: '', mobile_number: '', whatsapp_number: '',
        permanent_address: '', date_of_birth: '', civil_status: 'Single',
        occupation: '', residence_type: '', owner_name: '', owner_mobile: '',
        sandha_amount: 300, meal_contribution: 'No', meal_contribution_amount: 0,
        paying_other_masjid: 'No', other_masjid_details: '',
        special_needs: '', is_sub_member: 'No', parent_memno: '', send_whatsapp: false
      })
      setFamilyMembers([])
      setNonRelatives([])
      setPhotoPreview(null)
      setMemberPhoto(null)
      setMessage({ type: '', text: '' })
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      // Use FormData for file upload
      const submitData = new FormData()

      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key])
        }
      })

      // Append memno
      submitData.append('memno', previewMemno)

      // Append photo if exists
      if (memberPhoto) {
        submitData.append('photo', memberPhoto)
      }

      const memberRes = await api.post('/members/', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const memno = memberRes.data.memno

      // Add family members
      for (const child of familyMembers) {
        if (child.name.trim()) {
          await api.post(`/members/${memno}/children`, child)
        }
      }

      // Add non-related residents
      for (const resident of nonRelatives) {
        if (resident.name.trim()) {
          await api.post(`/members/${memno}/non-related`, resident)
        }
      }

      // Send WhatsApp if requested
      if (formData.send_whatsapp && (memberRes.data.whatsapp_number || memberRes.data.mobile_number)) {
        const phone = (memberRes.data.whatsapp_number || memberRes.data.mobile_number).replace(/\D/g, '')
        const message = `Assalamu Alaikum ${memberRes.data.full_name},\n\nYou have been successfully registered as a member of Masjidh Sandha.\n\nYour Member ID: ${memberRes.data.memno}\nSandha Amount: Rs. ${memberRes.data.sandha_amount}\nMeal Contribution: Rs. ${memberRes.data.meal_contribution_amount}\n\nJazakallah Khair.`
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
      }

      setMessage({ type: 'success', text: `Member created successfully! ID: ${memno}` })
      setTimeout(() => navigate('/members'), 2000)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ type: 'error', text: error.response?.data?.detail || JSON.stringify(error.response?.data) || 'Error creating member' })
    } finally {
      setLoading(false)
    }
  }

  const parentMembers = membersList.filter(m => m.is_sub_member === 'No' && m.memno)

  // Generate QR code preview URL
  const qrPreviewUrl = previewMemno 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(JSON.stringify({ memno: previewMemno, name: formData.full_name || 'New Member' }))}`
    : null

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Register New Member</h1>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Photo & QR Code Section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Camera size={20} className="text-primary-500" /> Member Photo & QR Code
          </h2>

          <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4">
              {photoPreview ? (
                <div className="relative">
                  <img 
                    src={photoPreview} 
                    alt="Member preview" 
                    className="w-40 h-40 object-cover rounded-full border-4 border-primary-500/30"
                  />
                  <button 
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="w-40 h-40 rounded-full border-4 border-dashed border-primary-500/30 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <User size={40} className="text-primary-500/50" />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>No photo</span>
                </div>
              )}
              <div className="flex gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label 
                  htmlFor="photo-upload"
                  className="btn-primary flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={16} />
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </label>
              </div>
            </div>

            {/* QR Code Preview */}
            <div className="flex flex-col items-center gap-4">
              {previewMemno ? (
                <>
                  <div className="w-40 h-40 rounded-lg border-2 border-primary-500/30 flex items-center justify-center p-2" style={{ backgroundColor: 'white' }}>
                    <img 
                      src={qrPreviewUrl} 
                      alt="QR Code Preview" 
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>QR Code for</p>
                    <p className="font-mono font-bold text-primary-500">{previewMemno}</p>
                  </div>
                </>
              ) : (
                <div className="w-40 h-40 rounded-lg border-2 border-dashed border-primary-500/30 flex flex-col items-center justify-center gap-2" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <QrCode size={40} className="text-primary-500/50" />
                  <span className="text-xs text-center px-2" style={{ color: 'var(--text-muted)' }}>Select residence type to generate QR</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Member ID Preview */}
        {previewMemno && (
          <div className="glass-card p-6 text-center" style={{ backgroundColor: 'rgba(22, 163, 74, 0.15)', borderColor: '#16a34a', borderWidth: '2px' }}>
            <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>Member ID will be</p>
            <p className="text-5xl font-mono font-bold text-primary-500">{previewMemno}</p>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {formData.is_sub_member === 'Yes' ? 'Sub Member' : formData.residence_type === 'Own' ? 'Permanent Resident' : 'Rented Resident'}
            </p>
          </div>
        )}

        {/* 1. Personal Details */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={20} className="text-primary-500" /> 1. Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField label="Full Name *" name="full_name" value={formData.full_name} onChange={handleChange} onBlur={formatOnBlur} required />
            <InputField label="ID Number" name="id_number" value={formData.id_number} onChange={handleChange} />
            <InputField label="Mobile Number *" name="mobile_number" value={formData.mobile_number} onChange={handleChange} required />
            <InputField label="WhatsApp Number" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} />
            <InputField label="Date of Birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} />
            <InputField label="Civil Status" name="civil_status" value={formData.civil_status} onChange={handleChange} options={['Single', 'Married', 'Widowed', 'Divorced']} />
            <InputField label="Occupation" name="occupation" value={formData.occupation} onChange={handleChange} onBlur={formatOnBlur} />
            <InputField label="Special Needs" name="special_needs" value={formData.special_needs} onChange={handleChange} onBlur={formatOnBlur} placeholder="Yes/No. If yes, describe..." />
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Permanent Address *</label>
              <textarea
                name="permanent_address"
                value={formData.permanent_address}
                onChange={handleChange}
                onBlur={formatOnBlur}
                placeholder="Enter permanent address"
                required
                className="form-textarea font-normal w-full mt-1"
              />
            </div>
          </div>
        </div>

        {/* 2. Residence & Member Type */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Home size={20} className="text-primary-500" /> 2. Residence & Member Type
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Residence Type *" name="residence_type" value={formData.residence_type} onChange={handleChange} options={['', 'Own', 'Rent']} required />

            {formData.residence_type === 'Rent' && (
              <>
                <InputField label="Owner Name" name="owner_name" value={formData.owner_name} onChange={handleChange} onBlur={formatOnBlur} />
                <InputField label="Owner Mobile" name="owner_mobile" value={formData.owner_mobile} onChange={handleChange} />
              </>
            )}

            {/* Member Type Toggle */}
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-3 block" style={{ color: 'var(--text-secondary)' }}>
                Member Type *
              </label>
              <div className="flex gap-4 flex-wrap">
                <label 
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all flex-1 min-w-[200px] ${
                    formData.is_sub_member === 'No' 
                      ? 'border-primary-500 bg-primary-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="is_sub_member"
                    value="No"
                    checked={formData.is_sub_member === 'No'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-primary-500"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Regular Member</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Head of household - gets new ID (PER00001)</p>
                  </div>
                </label>

                <label 
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all flex-1 min-w-[200px] ${
                    formData.is_sub_member === 'Yes' 
                      ? 'border-primary-500 bg-primary-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="is_sub_member"
                    value="Yes"
                    checked={formData.is_sub_member === 'Yes'}
                    onChange={handleChange}
                    className="w-5 h-5 accent-primary-500"
                  />
                  <div>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Sub Member</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Under existing member - gets suffix ID (PER00001A)</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Parent Member Dropdown - ONLY SHOWS WHEN SUB MEMBER IS SELECTED */}
            {formData.is_sub_member === 'Yes' && (
              <div className="md:col-span-2 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Select Parent Member (Head of Household) *
                </label>
                <select
                  name="parent_memno"
                  value={formData.parent_memno}
                  onChange={handleChange}
                  className="form-input font-normal w-full"
                  required={formData.is_sub_member === 'Yes'}
                >
                  <option value="">-- Select a registered member --</option>
                  {parentMembers.length === 0 ? (
                    <option value="" disabled>No registered members available</option>
                  ) : (
                    parentMembers.map(m => (
                      <option key={m.memno} value={m.memno}>
                        {m.memno} - {m.full_name} ({m.residence_type === 'Own' ? 'Own House' : 'Rented'})
                      </option>
                    ))
                  )}
                </select>

                {formData.parent_memno && previewMemno && (
                  <div className="mt-3 p-3 rounded bg-green-500/10 border border-green-500/20">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      Sub-member will be registered under <strong>{formData.parent_memno}</strong>
                    </p>
                    <p className="text-lg font-mono font-bold text-green-400 mt-1">
                      Generated ID: {previewMemno}
                    </p>
                  </div>
                )}

                {!formData.parent_memno && (
                  <p className="text-xs mt-2" style={{ color: '#fbbf24' }}>
                    Please select a parent member to generate the sub-member ID
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Family Members */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Users size={20} className="text-primary-500" /> 3. Family Members
          </h2>

          {/* Head of Household / Sub-Member Info Card */}
          <div className="mb-6 p-4 rounded-lg border-2 border-primary-500/30" style={{ backgroundColor: 'rgba(22, 163, 74, 0.05)' }}>
            <div className="flex items-center gap-2 mb-3">
              <User size={18} className="text-primary-500" />
              <span className="font-semibold text-primary-400">
                {formData.is_sub_member === 'Yes' ? 'Sub-Member' : 'Head of Household'}
              </span>
              {formData.is_sub_member === 'Yes' && formData.parent_memno && (
                <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 ml-auto">
                  Under: {formData.parent_memno}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formData.full_name || 'Not entered'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>DOB:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formData.date_of_birth || 'Not entered'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Relation:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formData.is_sub_member === 'Yes' ? 'Sub-Member' : 'Head of Household'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Occupation:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formData.occupation || 'Not entered'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Contact:</span>
                <span style={{ color: 'var(--text-primary)' }}>{formData.mobile_number || 'Not entered'}</span>
              </div>
            </div>
          </div>

          {/* Added Family Members */}
          {familyMembers.length > 0 && (
            <div className="space-y-3 mb-4">
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Added Family Members</h4>
              {familyMembers.map((member) => (
                <div key={member.id} className="p-4 rounded-lg border border-dashed" style={{ backgroundColor: 'var(--input-bg)', borderColor: 'var(--border-color)' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-primary-500" />
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-primary-500/20 text-primary-400">{member.relationship_type}</span>
                    </div>
                    <button type="button" onClick={() => removeFamilyMember(member.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    {member.date_of_birth && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-muted)' }}>DOB:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{member.date_of_birth}</span>
                      </div>
                    )}
                    {member.occupation && (
                      <div className="flex items-center gap-1">
                        <Briefcase size={12} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-muted)' }}>Occupation:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{member.occupation}</span>
                      </div>
                    )}
                    {member.contact_number && (
                      <div className="flex items-center gap-1">
                        <Phone size={12} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ color: 'var(--text-muted)' }}>Contact:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{member.contact_number}</span>
                      </div>
                    )}
                    {member.school_name && (
                      <div className="flex items-center gap-1">
                        <span style={{ color: 'var(--text-muted)' }}>School:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{member.school_name} {member.grade ? `(Grade ${member.grade})` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Family Member Form */}
          <div className="p-4 border border-dashed rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Add Family Member</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input name="name" placeholder="Name *" value={newFamily.name} onChange={handleFamilyChange} onBlur={handleFamilyBlur} className="form-input font-normal" />
              <input name="date_of_birth" type="date" value={newFamily.date_of_birth} onChange={handleFamilyChange} className="form-input font-normal" />
              <select name="relationship_type" value={newFamily.relationship_type} onChange={handleFamilyChange} className="form-input font-normal">
                {['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Grand Father', 'Grand Mother', 'Other'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <input name="school_name" placeholder="School" value={newFamily.school_name} onChange={handleFamilyChange} onBlur={handleFamilyBlur} className="form-input font-normal" />
              <input name="grade" placeholder="Grade" value={newFamily.grade} onChange={handleFamilyChange} className="form-input font-normal" />
              <input name="quran_madrasa" placeholder="Madrasa" value={newFamily.quran_madrasa} onChange={handleFamilyChange} onBlur={handleFamilyBlur} className="form-input font-normal" />
              <input name="occupation" placeholder="Occupation" value={newFamily.occupation} onChange={handleFamilyChange} onBlur={handleFamilyBlur} className="form-input font-normal" />
              <input name="contact_number" placeholder="Contact" value={newFamily.contact_number} onChange={handleFamilyChange} className="form-input font-normal" />
              <button type="button" onClick={addFamilyMember} className="btn-primary flex items-center justify-center gap-1">
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* 4. Non-Related Residents */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <UserX size={20} className="text-primary-500" /> 4. Non-Related Residents
          </h2>

          {nonRelatives.length > 0 && (
            <div className="space-y-2 mb-4">
              {nonRelatives.map((nr) => (
                <div key={nr.id} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <div>
                    <span style={{ color: 'var(--text-primary)' }}>{nr.name}</span>
                    <span className="text-sm ml-2" style={{ color: 'var(--text-muted)' }}>({nr.purpose})</span>
                  </div>
                  <button type="button" onClick={() => removeNonRelative(nr.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="p-4 border border-dashed rounded-lg" style={{ borderColor: 'var(--border-color)' }}>
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Add Non-Related Resident</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input name="name" placeholder="Full Name" value={newNonRelative.name} onChange={handleNonRelativeChange} onBlur={handleNonRelativeBlur} className="form-input font-normal" />
              <input name="id_card" placeholder="ID Number" value={newNonRelative.id_card} onChange={handleNonRelativeChange} className="form-input font-normal" />
              <input name="address" placeholder="Address" value={newNonRelative.address} onChange={handleNonRelativeChange} onBlur={handleNonRelativeBlur} className="form-input font-normal" />
              <input name="purpose" placeholder="Purpose" value={newNonRelative.purpose} onChange={handleNonRelativeChange} onBlur={handleNonRelativeBlur} className="form-input font-normal" />
              <button type="button" onClick={addNonRelative} className="btn-primary flex items-center justify-center gap-1">
                <Plus size={16} /> Add
              </button>
            </div>
          </div>
        </div>

        {/* 5. Sandha & Meal */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <DollarSign size={20} className="text-primary-500" /> 5. Sandha & Meal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField label="Sandha Amount *" name="sandha_amount" type="number" value={formData.sandha_amount} onChange={handleChange} required />
            <InputField label="Paying Other Masjid" name="paying_other_masjid" value={formData.paying_other_masjid} onChange={handleChange} options={['No', 'Yes']} />

            {formData.paying_other_masjid === 'Yes' && (
              <div className="md:col-span-2 lg:col-span-3">
                <InputField label="Other Masjid Name" name="other_masjid_details" value={formData.other_masjid_details} onChange={handleChange} onBlur={formatOnBlur} />
              </div>
            )}

            <InputField label="Meal Contribution" name="meal_contribution" value={formData.meal_contribution} onChange={handleChange} options={['No', 'Yes']} />

            {formData.meal_contribution === 'Yes' && (
              <InputField
                label="Meal Contribution Amount *"
                name="meal_contribution_amount"
                type="number"
                value={formData.meal_contribution_amount}
                onChange={handleChange}
                required={formData.meal_contribution === 'Yes'}
              />
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="glass-card p-6">
          <label className="flex items-center gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              name="send_whatsapp"
              checked={formData.send_whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, send_whatsapp: e.target.checked }))}
              className="w-5 h-5 rounded accent-primary-500"
            />
            <div>
              <p className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <MessageCircle size={18} className="text-green-500" />
                Send WhatsApp welcome message
              </p>
            </div>
          </label>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Save size={20} /> Register Member</>}
            </button>
            <button type="button" onClick={clearForm} className="btn-secondary flex items-center justify-center gap-2 py-3 px-6">
              <X size={20} /> Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default MemberForm
