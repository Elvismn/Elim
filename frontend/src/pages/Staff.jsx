// frontend/src/pages/Staff.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Briefcase, User, Mail, Phone, Edit, Trash2, RefreshCw, AlertCircle, Eye } from 'lucide-react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import Input from '../components/Input'
import { staffService } from '../services/staffService'
import { departmentService } from '../services/departmentService'

const Badge = ({ children, variant = 'default' }) => {
  const variants = { default: 'bg-gray-100 text-gray-800', success: 'bg-green-100 text-green-800', error: 'bg-red-100 text-red-800', warning: 'bg-yellow-100 text-yellow-800' }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>
}

const Card = ({ children }) => <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">{children}</div>

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Intern", "Temporary"]
const STATUS_OPTIONS = ["Active", "Inactive", "On Leave", "Terminated", "Resigned", "Retired"]

const Staff = () => {
  const [staff, setStaff] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', employeeId: '', position: '', department: '',
    employmentType: 'Full-time', hireDate: new Date().toISOString().split('T')[0], status: 'Active',
    salary: { amount: '', currency: 'KES', paymentFrequency: 'Monthly' }
  })

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const staffRes = await staffService.getStaff({ limit: 100 })
      const deptRes = await departmentService.getDepartments({ limit: 100 })
      setStaff(staffRes.data?.staff || staffRes.data?.data?.staff || [])
      setDepartments(deptRes.data?.departments || deptRes.data?.data?.departments || [])
    } catch (error) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredStaff = useMemo(() => {
    if (!Array.isArray(staff)) return []
    return staff.filter(s => !searchTerm || s.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || s.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [staff, searchTerm])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const staffData = {
        firstName: formData.firstName.trim(), lastName: formData.lastName.trim(),
        email: formData.email.trim(), phone: formData.phone.trim(), employeeId: formData.employeeId.trim(),
        position: formData.position, department: formData.department, employmentType: formData.employmentType,
        hireDate: formData.hireDate, status: formData.status, salary: formData.salary
      }
      if (editingStaff) {
        await staffService.updateStaff(editingStaff._id, staffData)
        alert('Staff updated!')
      } else {
        await staffService.createStaff(staffData)
        alert('Staff created!')
      }
      await fetchAllData()
      resetForm()
      setIsModalOpen(false)
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember)
    setFormData({
      firstName: staffMember.firstName || '', lastName: staffMember.lastName || '', email: staffMember.email || '',
      phone: staffMember.phone || '', employeeId: staffMember.employeeId || '', position: staffMember.position || '',
      department: staffMember.department?._id || staffMember.department || '', employmentType: staffMember.employmentType || 'Full-time',
      hireDate: staffMember.hireDate?.split('T')[0] || new Date().toISOString().split('T')[0], status: staffMember.status || 'Active',
      salary: staffMember.salary || { amount: '', currency: 'KES', paymentFrequency: 'Monthly' }
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this staff member?')) {
      try {
        await staffService.deleteStaff(id)
        alert('Staff deleted!')
        fetchAllData()
      } catch (error) {
        alert(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', employeeId: '', position: '', department: '',
      employmentType: 'Full-time', hireDate: new Date().toISOString().split('T')[0], status: 'Active',
      salary: { amount: '', currency: 'KES', paymentFrequency: 'Monthly' }
    })
    setEditingStaff(null)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'success'
      case 'Inactive': return 'error'
      case 'On Leave': return 'warning'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Staff Management</h1><p className="text-gray-600">Manage school staff</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchAllData}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true) }}><Plus className="w-4 h-4 mr-2" />Add Staff</Button>
        </div>
      </div>

      {error && <div className="bg-red-50 p-3 rounded-lg text-red-700">{error}</div>}

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search staff..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No staff found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStaff.map(member => (
              <div key={member._id} className="border rounded-lg p-4 hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
                    <div><h3 className="font-semibold">{member.firstName} {member.lastName}</h3><p className="text-xs text-gray-500">ID: {member.employeeId}</p></div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleEdit(member)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(member._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4" />{member.position}</div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{member.email}</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{member.phone}</div>
                  <div className="pt-2 border-t"><Badge variant={getStatusBadge(member.status)}>{member.status}</Badge></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title={editingStaff ? 'Edit Staff' : 'Add Staff'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            <Input label="Last Name" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input label="Phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Employee ID" required value={formData.employeeId} onChange={(e) => setFormData({...formData, employeeId: e.target.value})} />
            <Input label="Position" required value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Department</label><select value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Employment Type</label><select value={formData.employmentType} onChange={(e) => setFormData({...formData, employmentType: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{EMPLOYMENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hire Date" type="date" required value={formData.hireDate} onChange={(e) => setFormData({...formData, hireDate: e.target.value})} />
            <div><label className="block text-sm font-medium mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Salary Amount" type="number" value={formData.salary.amount} onChange={(e) => setFormData({...formData, salary: {...formData.salary, amount: e.target.value}})} placeholder="0.00" />
            <div><label className="block text-sm font-medium mb-1">Currency</label><select value={formData.salary.currency} onChange={(e) => setFormData({...formData, salary: {...formData.salary, currency: e.target.value}})} className="w-full px-3 py-2 border rounded-lg"><option>KES</option><option>USD</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Frequency</label><select value={formData.salary.paymentFrequency} onChange={(e) => setFormData({...formData, salary: {...formData.salary, paymentFrequency: e.target.value}})} className="w-full px-3 py-2 border rounded-lg"><option>Monthly</option><option>Bi-weekly</option><option>Weekly</option></select></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>Cancel</Button>
            <Button type="submit" loading={submitting}>{submitting ? 'Saving...' : (editingStaff ? 'Update' : 'Create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Staff