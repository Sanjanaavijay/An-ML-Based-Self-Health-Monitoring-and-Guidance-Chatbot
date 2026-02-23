import React, { useState } from 'react';
import { User } from '../types';
import { Settings, LogOut, Trash2, Moon, Sun, Edit2, Save, X, AlertCircle } from 'lucide-react';

interface Props {
  user: User;
  theme: 'light' | 'dark';
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onClearData: () => void;
  onToggleTheme: () => void;
}

const Profile: React.FC<Props> = ({ user, theme, onUpdateUser, onLogout, onClearData, onToggleTheme }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const handleSave = () => {
    const newErrors: { name?: string; email?: string } = {};

    // Name Validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email Validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onUpdateUser({
      name: formData.name,
      email: formData.email
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ name: user.name, email: user.email });
    setErrors({});
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-400 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 p-1 relative group">
              <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-3xl font-bold overflow-hidden">
                 {/* Placeholder for avatar, just using initials for now */}
                 {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-14 px-8 pb-8 flex justify-between items-start">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({...formData, name: e.target.value});
                      if (errors.name) setErrors({...errors, name: undefined});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white ${
                      errors.name 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      if (errors.email) setErrors({...errors, email: undefined});
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white ${
                      errors.email 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button 
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  {user.name}
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-full transition"
                    title="Edit Profile"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </h2>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" /> Settings
        </h3>

        <div className="space-y-6">
          {/* Appearance */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Appearance</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Customize how HealthGuardian looks on your device.</p>
            </div>
            <button 
              onClick={onToggleTheme}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}>
                {theme === 'dark' ? (
                  <Moon className="h-4 w-4 text-primary-600 m-1" />
                ) : (
                  <Sun className="h-4 w-4 text-orange-400 m-1" />
                )}
              </span>
            </button>
          </div>

          {/* Data Management */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Data Management</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Clear your health history and chat logs.</p>
            </div>
            <button 
              onClick={onClearData}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 font-medium px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 className="w-5 h-5" /> Clear Data
            </button>
          </div>

          {/* Sign Out */}
          <div className="pt-2">
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full sm:w-auto"
            >
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;