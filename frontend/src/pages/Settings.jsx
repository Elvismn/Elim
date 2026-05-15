// frontend/src/pages/Settings.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Bell, Globe, Moon, Sun, Save, Eye, EyeOff, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'

const Card = ({ children, title, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
    {title && <div className="px-6 py-4 border-b border-gray-200"><h3 className="text-lg font-semibold text-gray-900">{title}</h3></div>}
    <div className="p-6">{children}</div>
  </div>
)

const Settings = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  
  const [profile, setProfile] = useState({
    name: user?.name || 'Admin User',
    email: user?.email || 'admin@elim.com'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })

  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences')
    return saved ? JSON.parse(saved) : {
      theme: 'light',
      emailNotifications: true,
      itemsPerPage: 10,
      language: 'en'
    }
  })

  const handleProfileUpdate = async () => {
    setLoading(true)
    try {
      await userService.updateProfile(profile.name, profile.email)
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...profile }))
      alert('Profile updated successfully!')
    } catch (error) {
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert('Please fill in all password fields')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match')
      return
    }
    if (passwordData.newPassword.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await userService.changePassword(passwordData.currentPassword, passwordData.newPassword)
      alert('Password changed successfully!')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = (key, value) => {
    const updated = { ...preferences, [key]: value }
    setPreferences(updated)
    localStorage.setItem('userPreferences', JSON.stringify(updated))
    if (key === 'theme') {
      if (value === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { id: 'preferences', label: 'Preferences', icon: <Globe className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <Card title="Profile Information">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  <p className="text-xs text-gray-500 mt-1">This email is used for login and notifications</p>
                </div>
                <div className="pt-4 flex justify-end">
                  <button onClick={handleProfileUpdate} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Change Password">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input type={showPassword.current ? "text" : "password"} value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10" placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, current: !showPassword.current})} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input type={showPassword.new ? "text" : "password"} value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10" placeholder="Enter new password (min. 6 characters)" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, new: !showPassword.new})} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input type={showPassword.confirm ? "text" : "password"} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg pr-10" placeholder="Confirm new password" />
                    <button type="button" onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button onClick={handlePasswordChange} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50">
                    <Lock className="w-4 h-4" />
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card title="Preferences">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-gray-900">Theme</p><p className="text-sm text-gray-600">Choose light or dark mode</p></div>
                  <button onClick={() => handlePreferenceChange('theme', preferences.theme === 'light' ? 'dark' : 'light')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    {preferences.theme === 'light' ? <><Moon className="w-4 h-4" /><span>Dark</span></> : <><Sun className="w-4 h-4" /><span>Light</span></>}
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select value={preferences.language} onChange={(e) => handlePreferenceChange('language', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Items Per Page</label>
                  <select value={preferences.itemsPerPage} onChange={(e) => handlePreferenceChange('itemsPerPage', parseInt(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="10">10 items</option>
                    <option value="25">25 items</option>
                    <option value="50">50 items</option>
                    <option value="100">100 items</option>
                  </select>
                </div>
                <div className="pt-4 border-t">
                  <button onClick={() => { localStorage.removeItem('userPreferences'); setPreferences({ theme: 'light', emailNotifications: true, itemsPerPage: 10, language: 'en' }); alert('Preferences reset to default'); }} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Reset to defaults
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Notification Settings">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="font-medium text-gray-900">Email Notifications</p><p className="text-sm text-gray-600">Receive updates via email</p></div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={preferences.emailNotifications} onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Notify me about:</h4>
                  <div className="space-y-3">
                    {['Student updates', 'Vehicle maintenance', 'Expiring documents', 'Fuel records', 'Staff changes'].map(item => (
                      <div key={item} className="flex items-center justify-between"><span className="text-sm text-gray-700">{item}</span><input type="checkbox" className="rounded text-blue-600" defaultChecked /></div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Account Info">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0) || 'A'}</span>
                </div>
                <div><p className="font-medium text-gray-900">{user?.name || 'Admin User'}</p><p className="text-sm text-gray-600">{user?.email || 'admin@elim.com'}</p></div>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Role</span><span className="font-medium text-gray-900">Administrator</span></div>
                <div className="flex justify-between text-sm mt-2"><span className="text-gray-600">Last Login</span><span className="font-medium text-gray-900">{new Date().toLocaleDateString()}</span></div>
              </div>
            </div>
          </Card>
          <Card title="Quick Links">
            <div className="space-y-2">
              <button onClick={() => navigate('/profile')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">View Profile</button>
              <button onClick={() => alert('Help center coming soon')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Help & Support</button>
              <button onClick={() => alert('System version 1.0.0')} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">About</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Settings