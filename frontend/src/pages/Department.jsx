// frontend/src/pages/Department.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { Search, Plus, Building, Users, DollarSign, Edit, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import Input from '../components/Input'
import { departmentService } from '../services/departmentService'
import { staffService } from '../services/staffService'

const Badge = ({ children, variant = 'default' }) => {
  const variants = { default: 'bg-gray-100 text-gray-800', success: 'bg-green-100 text-green-800', error: 'bg-red-100 text-red-800', warning: 'bg-yellow-100 text-yellow-800' }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>
}

const Card = ({ children }) => <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">{children}</div>

const STATUS_OPTIONS = ["Active", "Inactive", "Under Review"]

const Departments = () => {
  const [departments, setDepartments] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '', code: '', headOfDepartment: '', description: '', status: 'Active',
    budget: { allocated: '', spent: '', currency: 'KES' }
  })

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const deptRes = await departmentService.getDepartments({ limit: 100 })
      const staffRes = await staffService.getStaff({ limit: 100 })
      setDepartments(deptRes.data?.departments || deptRes.data?.data?.departments || [])
      setStaff(staffRes.data?.staff || staffRes.data?.data?.staff || [])
    } catch (error) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredDepartments = useMemo(() => {
    if (!Array.isArray(departments)) return []
    return departments.filter(d => !searchTerm || d.name?.toLowerCase().includes(searchTerm.toLowerCase()) || d.code?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [departments, searchTerm])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const deptData = {
        name: formData.name.trim(), code: formData.code.trim().toUpperCase(),
        headOfDepartment: formData.headOfDepartment || undefined, description: formData.description,
        status: formData.status, budget: formData.budget
      }
      if (editingDept) {
        await departmentService.updateDepartment(editingDept._id, deptData)
        alert('Department updated!')
      } else {
        await departmentService.createDepartment(deptData)
        alert('Department created!')
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

  const handleEdit = (dept) => {
    setEditingDept(dept)
    setFormData({
      name: dept.name || '', code: dept.code || '', headOfDepartment: dept.headOfDepartment?._id || dept.headOfDepartment || '',
      description: dept.description || '', status: dept.status || 'Active',
      budget: { allocated: dept.budget?.allocated?.toString() || '', spent: dept.budget?.spent?.toString() || '', currency: dept.budget?.currency || 'KES' }
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this department?')) {
      try {
        await departmentService.deleteDepartment(id)
        alert('Department deleted!')
        fetchAllData()
      } catch (error) {
        alert(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', code: '', headOfDepartment: '', description: '', status: 'Active', budget: { allocated: '', spent: '', currency: 'KES' } })
    setEditingDept(null)
  }

  const getHeadName = (dept) => {
    if (!dept.headOfDepartment) return 'Not assigned'
    if (typeof dept.headOfDepartment === 'object') return `${dept.headOfDepartment.firstName || ''} ${dept.headOfDepartment.lastName || ''}`
    const found = staff.find(s => s._id === dept.headOfDepartment)
    return found ? `${found.firstName} ${found.lastName}` : 'Unknown'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Departments Management</h1><p className="text-gray-600">Manage school departments</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchAllData}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true) }}><Plus className="w-4 h-4 mr-2" />Add Department</Button>
        </div>
      </div>

      {error && <div className="bg-red-50 p-3 rounded-lg text-red-700">{error}</div>}

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search departments..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredDepartments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No departments found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map(dept => (
              <div key={dept._id} className="border rounded-lg p-4 hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><Building className="w-5 h-5 text-blue-600" /></div>
                    <div><h3 className="font-semibold">{dept.name}</h3><p className="text-xs text-gray-500">Code: {dept.code}</p></div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleEdit(dept)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(dept._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" />Head: {getHeadName(dept)}</div>
                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" />Budget: KES {dept.budget?.allocated?.toLocaleString() || 0}</div>
                  <div className="pt-2 border-t"><Badge variant={dept.status === 'Active' ? 'success' : dept.status === 'Inactive' ? 'error' : 'warning'}>{dept.status}</Badge></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title={editingDept ? 'Edit Department' : 'Add Department'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Department Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <Input label="Department Code" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g., MATH" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Head of Department</label><select value={formData.headOfDepartment} onChange={(e) => setFormData({...formData, headOfDepartment: e.target.value})} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{staff.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1">Status</label><select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg">{STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Allocated Budget" type="number" value={formData.budget.allocated} onChange={(e) => setFormData({...formData, budget: {...formData.budget, allocated: e.target.value}})} placeholder="0.00" />
            <Input label="Spent Amount" type="number" value={formData.budget.spent} onChange={(e) => setFormData({...formData, budget: {...formData.budget, spent: e.target.value}})} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" className="w-full px-3 py-2 border rounded-lg" placeholder="Department description..." />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>Cancel</Button>
            <Button type="submit" loading={submitting}>{submitting ? 'Saving...' : (editingDept ? 'Update' : 'Create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Departments