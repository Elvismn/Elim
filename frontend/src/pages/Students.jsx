// frontend/src/pages/Students.jsx
import React, { useState, useEffect, useMemo } from 'react'
import { Search, Plus, RefreshCw, Edit, Trash2, Eye, User, Calendar, Users, MapPin, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import Input from '../components/Input'
import { studentService } from '../services/studentService'
import { parentService } from '../services/parentService'

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800'
  }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>{children}</span>
}

const Card = ({ children, className = '' }) => <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>{children}</div>

const GRADE_LEVELS = ["Nursery", "KG1", "KG2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"]
const GENDER_OPTIONS = ["Male", "Female", "Other"]
const STATUS_OPTIONS = ["Active", "Inactive", "Transferred", "Graduated", "Suspended"]
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"]

const Students = () => {
  const [students, setStudents] = useState([])
  const [parents, setParents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [expandedSections, setExpandedSections] = useState({ personal: true, address: true, medical: true })

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', studentId: '', grade: '', dateOfBirth: '', gender: 'Male',
    parents: [], classroom: '',
    address: { street: '', city: '', state: '', postalCode: '', country: 'Kenya' },
    emergencyContacts: [{ name: '', phone: '', relationship: '', isPrimary: true }],
    medicalInfo: { bloodGroup: '', allergies: [], medications: [], conditions: [], doctorName: '', doctorPhone: '', notes: '' },
    status: 'Active', enrollmentDate: new Date().toISOString().split('T')[0], profilePicture: null
  })

  useEffect(() => { fetchAllData() }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const studentsRes = await studentService.getStudents({ limit: 100 })
      const parentsRes = await parentService.getParents({ limit: 100 })
      setStudents(studentsRes.data?.students || studentsRes.data?.data?.students || [])
      setParents(parentsRes.data?.parents || parentsRes.data?.data?.parents || [])
      setError('')
    } catch (error) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return []
    return students.filter(student => {
      const matchesSearch = !searchTerm || (student.firstName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.studentId?.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [students, searchTerm, statusFilter])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }))
  }

  const handleMedicalChange = (field, value) => {
    setFormData(prev => ({ ...prev, medicalInfo: { ...prev.medicalInfo, [field]: value } }))
  }

  const handleArrayFieldChange = (field, value) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item)
    setFormData(prev => ({ ...prev, medicalInfo: { ...prev.medicalInfo, [field]: array } }))
  }

  const handleParentSelection = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => ({ ...prev, parents: selected }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const studentData = {
        firstName: formData.firstName.trim(), lastName: formData.lastName.trim(),
        studentId: formData.studentId.trim(), grade: formData.grade, dateOfBirth: formData.dateOfBirth,
        gender: formData.gender, parents: formData.parents,
        address: formData.address, emergencyContacts: formData.emergencyContacts.filter(ec => ec.name && ec.phone),
        medicalInfo: formData.medicalInfo, status: formData.status, enrollmentDate: formData.enrollmentDate
      }
      if (editingStudent) {
        await studentService.updateStudent(editingStudent._id, studentData)
        alert('Student updated successfully!')
      } else {
        await studentService.createStudent(studentData)
        alert('Student created successfully!')
      }
      await fetchAllData()
      resetForm()
      setIsModalOpen(false)
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save student')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (student) => {
    setEditingStudent(student)
    setFormData({
      firstName: student.firstName || '', lastName: student.lastName || '', studentId: student.studentId || '',
      grade: student.grade || '', dateOfBirth: student.dateOfBirth?.split('T')[0] || '', gender: student.gender || 'Male',
      parents: student.parents?.map(p => p._id || p) || [], classroom: student.classroom?._id || student.classroom || '',
      address: student.address || { street: '', city: '', state: '', postalCode: '', country: 'Kenya' },
      emergencyContacts: student.emergencyContacts?.length ? student.emergencyContacts : [{ name: '', phone: '', relationship: '', isPrimary: true }],
      medicalInfo: student.medicalInfo || { bloodGroup: '', allergies: [], medications: [], conditions: [], doctorName: '', doctorPhone: '', notes: '' },
      status: student.status || 'Active', enrollmentDate: student.enrollmentDate?.split('T')[0] || new Date().toISOString().split('T')[0], profilePicture: null
    })
    setIsModalOpen(true)
  }

  const handleView = (student) => {
    setSelectedStudent(student)
    setViewModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this student?')) {
      try {
        await studentService.deleteStudent(id)
        alert('Student deleted!')
        fetchAllData()
      } catch (error) {
        alert(error.response?.data?.error || 'Delete failed')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', studentId: '', grade: '', dateOfBirth: '', gender: 'Male',
      parents: [], classroom: '', address: { street: '', city: '', state: '', postalCode: '', country: 'Kenya' },
      emergencyContacts: [{ name: '', phone: '', relationship: '', isPrimary: true }],
      medicalInfo: { bloodGroup: '', allergies: [], medications: [], conditions: [], doctorName: '', doctorPhone: '', notes: '' },
      status: 'Active', enrollmentDate: new Date().toISOString().split('T')[0], profilePicture: null
    })
    setEditingStudent(null)
  }

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return 'success'
      case 'Inactive': return 'error'
      case 'Graduated': return 'purple'
      default: return 'default'
    }
  }

  const calculateAge = (dob) => {
    if (!dob) return 'N/A'
    const today = new Date(), birth = new Date(dob)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
  }

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A'

  const getParentNames = (student) => {
    if (!student.parents?.length) return 'No parents'
    return student.parents.map(p => typeof p === 'object' ? `${p.firstName || ''} ${p.lastName || ''}`.trim() : 'Unknown').filter(n => n).join(', ')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Students Management</h1><p className="text-gray-600">Manage student information and records</p></div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={fetchAllData}><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
          <Button onClick={() => { resetForm(); setIsModalOpen(true) }}><Plus className="w-4 h-4 mr-2" />Add Student</Button>
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-5 h-5" /><span>{error}</span></div>}

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="Search by name, ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div className="w-full md:w-48">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {loading ? (
          <div className="py-12 text-center"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div><p className="mt-4 text-gray-600">Loading...</p></div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-12 text-center"><p className="text-gray-500">No students found</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map(student => (
              <div key={student._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><User className="w-5 h-5 text-blue-600" /></div>
                    <div><h3 className="font-semibold">{student.firstName} {student.lastName}</h3><p className="text-xs text-gray-500">ID: {student.studentId}</p></div>
                  </div>
                  <div className="flex space-x-1">
                    <button onClick={() => handleView(student)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => handleEdit(student)} className="p-1 text-green-600 hover:bg-green-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(student._id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />Age: {calculateAge(student.dateOfBirth)} | Grade: {student.grade}</div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4" />{getParentNames(student)}</div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <Badge variant={getStatusBadge(student.status)}>{student.status}</Badge>
                    <span className="text-xs text-gray-500">Enrolled: {formatDate(student.enrollmentDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title={editingStudent ? 'Edit Student' : 'Add Student'} size="xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          <div className="border rounded-lg">
            <div className="flex justify-between p-4 bg-gray-50 cursor-pointer" onClick={() => toggleSection('personal')}>
              <h3 className="font-semibold">Personal Information</h3>
              {expandedSections.personal ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            {expandedSections.personal && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="First Name" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
                  <Input label="Last Name" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Student ID" name="studentId" required value={formData.studentId} onChange={handleInputChange} />
                  <div><label className="block text-sm font-medium mb-1">Grade *</label><select name="grade" required value={formData.grade} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg">{GRADE_LEVELS.map(g => <option key={g}>{g}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Date of Birth" name="dateOfBirth" type="date" required value={formData.dateOfBirth} onChange={handleInputChange} />
                  <div><label className="block text-sm font-medium mb-1">Gender</label><select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg">{GENDER_OPTIONS.map(g => <option key={g}>{g}</option>)}</select></div>
                </div>
                <div><label>Status</label><select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg">{STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
            )}
          </div>

          <div className="border rounded-lg">
            <div className="flex justify-between p-4 bg-gray-50 cursor-pointer" onClick={() => toggleSection('address')}>
              <h3 className="font-semibold">Address</h3>
              {expandedSections.address ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            {expandedSections.address && (
              <div className="p-4 space-y-4">
                <Input label="Street" name="street" value={formData.address.street} onChange={handleAddressChange} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" name="city" value={formData.address.city} onChange={handleAddressChange} />
                  <Input label="State" name="state" value={formData.address.state} onChange={handleAddressChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Postal Code" name="postalCode" value={formData.address.postalCode} onChange={handleAddressChange} />
                  <Input label="Country" name="country" value={formData.address.country} onChange={handleAddressChange} />
                </div>
              </div>
            )}
          </div>

          <div className="border rounded-lg">
            <div className="flex justify-between p-4 bg-gray-50 cursor-pointer" onClick={() => toggleSection('medical')}>
              <h3 className="font-semibold">Medical Information</h3>
              {expandedSections.medical ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
            {expandedSections.medical && (
              <div className="p-4 space-y-4">
                <div><label>Blood Group</label><select value={formData.medicalInfo.bloodGroup} onChange={(e) => handleMedicalChange('bloodGroup', e.target.value)} className="w-full px-3 py-2 border rounded-lg"><option value="">Select</option>{BLOOD_GROUPS.map(b => <option key={b}>{b}</option>)}</select></div>
                <Input label="Allergies (comma separated)" value={formData.medicalInfo.allergies.join(', ')} onChange={(e) => handleArrayFieldChange('allergies', e.target.value)} />
                <Input label="Medications (comma separated)" value={formData.medicalInfo.medications.join(', ')} onChange={(e) => handleArrayFieldChange('medications', e.target.value)} />
                <Input label="Conditions (comma separated)" value={formData.medicalInfo.conditions.join(', ')} onChange={(e) => handleArrayFieldChange('conditions', e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Doctor Name" value={formData.medicalInfo.doctorName} onChange={(e) => handleMedicalChange('doctorName', e.target.value)} />
                  <Input label="Doctor Phone" value={formData.medicalInfo.doctorPhone} onChange={(e) => handleMedicalChange('doctorPhone', e.target.value)} />
                </div>
                <textarea placeholder="Additional notes" value={formData.medicalInfo.notes} onChange={(e) => handleMedicalChange('notes', e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows="3" />
              </div>
            )}
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-4">Parents/Guardians</h3>
            <select multiple value={formData.parents} onChange={handleParentSelection} className="w-full px-3 py-2 border rounded-lg h-32">
              {parents.map(p => <option key={p._id} value={p._id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>Cancel</Button>
            <Button type="submit" loading={submitting}>{submitting ? 'Saving...' : (editingStudent ? 'Update' : 'Create')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="Student Details" size="lg">
        {selectedStudent && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"><User className="w-8 h-8 text-blue-600" /></div>
              <div><h3 className="text-xl font-bold">{selectedStudent.firstName} {selectedStudent.lastName}</h3><p className="text-gray-600">ID: {selectedStudent.studentId}</p><Badge variant={getStatusBadge(selectedStudent.status)}>{selectedStudent.status}</Badge></div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div><h4 className="font-medium text-gray-500 mb-2">Personal</h4><p><strong>Age:</strong> {calculateAge(selectedStudent.dateOfBirth)}</p><p><strong>Gender:</strong> {selectedStudent.gender}</p><p><strong>Grade:</strong> {selectedStudent.grade}</p><p><strong>Enrolled:</strong> {formatDate(selectedStudent.enrollmentDate)}</p></div>
              <div><h4 className="font-medium text-gray-500 mb-2">Parents</h4><p>{getParentNames(selectedStudent)}</p></div>
            </div>
            <div className="pt-4 border-t flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setViewModalOpen(false)}>Close</Button>
              <Button onClick={() => { setViewModalOpen(false); handleEdit(selectedStudent) }}>Edit</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Students