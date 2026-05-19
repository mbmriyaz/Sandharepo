import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ScanLine, Camera, User, QrCode, AlertCircle } from 'lucide-react'
import api from '../services/api'

const QRScanner = () => {
  const navigate = useNavigate()
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState(null)
  const [memberDetails, setMemberDetails] = useState(null)
  const [error, setError] = useState('')
  const [manualInput, setManualInput] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // For browsers that support QR scanning via getUserMedia + jsQR library
  // Fallback: manual entry if camera not available

  const handleManualSearch = async () => {
    if (!manualInput.trim()) return
    setError('')
    try {
      const res = await api.get(`/members/${manualInput.trim()}`)
      setMemberDetails(res.data)
      setScannedData(manualInput.trim())
    } catch (err) {
      setError('Member not found. Please check the ID.')
      setMemberDetails(null)
    }
  }

  const clearScan = () => {
    setScannedData(null)
    setMemberDetails(null)
    setError('')
    setManualInput('')
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>QR Scanner</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner Section */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ScanLine size={20} className="text-primary-500" /> Scan Member QR
          </h2>

          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-sm aspect-square rounded-lg border-4 border-dashed border-primary-500/30 flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--input-bg)' }}>
              <QrCode size={80} className="text-primary-500/50" />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Camera QR scanning coming soon</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Use manual entry below</p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Or enter Member ID manually</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter Member ID (e.g., PER00001)"
                  className="form-input font-normal flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                <button onClick={handleManualSearch} className="btn-primary px-4">
                  <ScanLine size={18} />
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Member Details Card */}
        {memberDetails && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <User size={20} className="text-primary-500" /> Member Details
              </h2>
              <button onClick={clearScan} className="btn-secondary text-sm">
                Scan Another
              </button>
            </div>

            <div className="space-y-4">
              {/* Photo */}
              <div className="flex justify-center mb-4">
                {memberDetails.photo_url ? (
                  <img 
                    src={memberDetails.photo_url} 
                    alt={memberDetails.full_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary-500/30"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-primary-500/30 flex items-center justify-center" style={{ backgroundColor: 'var(--input-bg)' }}>
                    <User size={48} className="text-primary-500/50" />
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <p className="text-3xl font-mono font-bold text-primary-500">{memberDetails.memno}</p>
                <p className="text-lg mt-1" style={{ color: 'var(--text-primary)' }}>{memberDetails.full_name}</p>
                {memberDetails.is_sub_member && (
                  <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 mt-2 inline-block">
                    Sub-member of {memberDetails.parent_memno}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Mobile</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{memberDetails.mobile_number || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>WhatsApp</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{memberDetails.whatsapp_number || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Residence</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{memberDetails.residence_type || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Sandha</p>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Rs. {memberDetails.sandha_amount}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--input-bg)' }}>
                <p style={{ color: 'var(--text-muted)' }}>Address</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{memberDetails.permanent_address || 'N/A'}</p>
              </div>

              <button 
                onClick={() => navigate(`/members/${memberDetails.memno}`)}
                className="btn-primary w-full mt-4"
              >
                View Full Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRScanner
