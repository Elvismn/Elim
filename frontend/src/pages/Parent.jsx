// frontend/src/pages/Parents.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { Search, Plus, UserCircle, Mail, Phone, Edit, Trash2, RefreshCw, AlertCircle, Eye } from 'lucide-react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import Input from '../components/Input'
import { parentService } from '../services/parentService'
import { studentService } from '../services/studentService'

const Badge = ({ children, variant = 'default' }) => {
  const variants = { default: 'bg-gray-100 text-gray-800', success: 'bg-green-100 text-green-800', error: 'bg-red-100 text-red-800' }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>{children}</span>
}

const Card = ({ children }) => <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6`}>{children}</div>

const RELATIONSHIP_OPTIONS = ["Father", "Mother", "Guardian", "Grandparent", "Other"]

const Parents = () => {
  const [parents, setParents] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingParent, setEditingParent] = useState(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', relationship: 'Guardian', children: [],
    address: { street: '', city: '', state: '', postalCode: '', country: 'Kenya' },
    isActive: true, occupation: '', employer: '', notes: ''
  })

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const parentsRes = await parentService.getParents({ limit: 100 })
      const studentsRes = await studentService.getStudents({ limit: 100 })
      setParents(parentsRes.data?.parents || parentsRes.data?.data?.parents || [])
      setStudents(studentsRes.data?.students || studentsRes.data?.data?.students || [])
    } catch (error) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredParents = useMemo(() => {
    if (!Array.isArray(parents)) return []
    return parents.filter(p => !searchTerm || p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) || p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) || p.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [parents, searchTerm])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const parentData = {
        firstName: formData.firstName.trim(), lastName: formData.lastName.trim(),
        email: formData.email.trim(), phone: formData.phone.trim(), relationship: formData.relationship,
        children: formData.children, address: formData.address, isActive: formData.isActive,
        occupation: formData.occupation, employer: formData.employer, notes: formData.notes
      }
      if (editingParent) {
        await parentService.updateParent(editingParent._id, parentData)
        alert('Parent updated!')
      } else {
        await parentService.createParent(parentData)
        alert('Parent created!')
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

  const handleEdit = (parent) => {
    setEditingParent(parent)
    setFormData({
      firstName: parent.firstName || '', lastName: parent.lastName || '', email: parent.email || '',
      phone: parent.phone || '', relationship: parent.relationship || 'Guardian',
      children: parent.children?.map(c => c._id || c) || [],
      address: parent.address || { street: '', city: '', state: '', postalCode: '', country: 'Kenya' },
      isActive: parent.isActive ?? true, occupation: parent.occupation || '', employer: parent.employer || '', notes: parent.notes || ''
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this parent?')) {
      try {
        await parentService.deleteParent(id)
        alert('Parent deleted!')
        fetchAllData()
      } catch (error) {
        alert(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '', relationship: 'Guardian', children: [],
      address: { street: '', city: '', state: '', postalCode: '', country: 'Kenya' },
      isActive: true, occupation: '', employer: '', notes: ''
    })
    setEditingParent(null)
  }

  const getChildNames = (parent) => {
    if (!parent.children?.length) return 'No children'
    return parent.children.map(c => typeof c === 'object' ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : 'Unknown').filter(n => n).join(', ')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-2xl font-bold">Parents Management</h1><p className="text-gray-600">Manage parent accounts</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchAllData}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true) }}><Plus className="w-4 h-4 mr-2" />Add Parent</Button>
        </div>
      </div>

      {error && <div className="bg-red-50 p-3 rounded-lg text-red-700">{error}</div>}

      <Card>
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search parents..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : filteredParents.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No parents found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParents.map(parent => (
              <div key={parent._id} className="border rounded-lg p-4 hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><UserCircle className="w-5 h-5 text-blue-600" /></div>
                    <div><h3 className="font-semibold">{parent.firstName} {parent.lastName}</h3><p className="text-xs text-gray-500">{parent.email}</p></div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleEdit(parent)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(parent._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{parent.phone}</div>
                  <div className="flex items-center gap-2"><UserCircle className="w-4 h-4" />Relationship: {parent.relationship}</div>
                  <div>Children: {getChildNames(parent)}</div>
                  <div className="pt-2 border-t"><Badge variant={parent.isActive ? 'success' : 'error'}>{parent.isActive ? 'Active' : 'Inactive'}</Badge></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title={editingParent ? 'Edit Parent' : 'Add Parent'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" name="firstName" required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            <Input label="Last Name" name="lastName" required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <Input label="Phone" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Relationship</label>
            <select value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
              {RELATIONSHIP_OPTIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Link Children</label>
            <select multiple value={formData.children} onChange={(e) => setFormData({...formData, children: Array.from(e.target.selectedOptions, o => o.value)})} className="w-full px-3 py-2 border rounded-lg h-32">
              {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} - {s.grade}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>Cancel</Button>
            <Button type="submit" loading={submitting}>{submitting ? 'Saving...' : (editingParent ? 'Update' : 'Create')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Parents