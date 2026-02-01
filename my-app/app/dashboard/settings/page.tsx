'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Save, User, Lock, Bell } from 'lucide-react';
import { clearUserNotifications } from '@/lib/notifications';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  contactNumber: string;
  pmdcNumber?: string;
  specialization?: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    organization: '',
    pmdcNumber: '',
    specialization: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser: UserData = JSON.parse(userData);
        setUser(parsedUser);
        setProfileData({
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          email: parsedUser.email || '',
          contactNumber: parsedUser.contactNumber || '',
          organization: '',
          pmdcNumber: parsedUser.pmdcNumber || '',
          specialization: parsedUser.specialization || '',
        });
        setIsLoading(false);
      } else {
        // No user data, redirect to login
        router.push('/login');
      }
    }
  }, [router]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          contactNumber: profileData.contactNumber,
          pmdcNumber: profileData.pmdcNumber,
          specialization: profileData.specialization,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        setIsSaving(false);
        return;
      }

      // Update localStorage with new data
      if (user) {
        const updatedUser = {
          ...user,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          contactNumber: profileData.contactNumber,
          pmdcNumber: profileData.pmdcNumber,
          specialization: profileData.specialization,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      setSuccess('Profile updated successfully!');
      setIsSaving(false);
    } catch (error) {
      console.error('Update error:', error);
      setError('Something went wrong. Please try again.');
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});

    // Validation
    const newErrors: typeof passwordErrors = {};
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordErrors({ general: data.error || 'Failed to change password' });
        setIsChangingPassword(false);
        return;
      }

      // Get user ID before clearing
      const userId = user?.id;

      // Clear user-specific notifications
      if (userId) {
        clearUserNotifications(userId);
      }

      // Success - clear localStorage and redirect to login
      localStorage.removeItem('user');
      
      // Dispatch event to notify other components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userChanged'));
      }
      
      // Show success message briefly before redirecting
      setPasswordErrors({ general: 'Password changed successfully! Redirecting to login...' });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordErrors({ general: 'Something went wrong. Please try again.' });
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card title="Profile Information">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading profile...</p>
          </div>
        ) : (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={profileData.firstName}
                onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name"
                value={profileData.lastName}
                onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
              <Input
                label="Contact Number"
                type="tel"
                value={profileData.contactNumber}
                onChange={(e) => setProfileData({ ...profileData, contactNumber: e.target.value })}
                required
              />
              <Input
                label="Organization"
                value={profileData.organization}
                onChange={(e) => setProfileData({ ...profileData, organization: e.target.value })}
                placeholder="Organization (optional)"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  value={profileData.specialization}
                  onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Specialization</option>
                  <option value="Medical Officer">Medical Officer</option>
                 
                  <option value="Radiologist">Radiologist</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Researcher">Researcher</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <Input
                label="PMDC Number"
                value={profileData.pmdcNumber}
                onChange={(e) => setProfileData({ ...profileData, pmdcNumber: e.target.value })}
                placeholder="PMDC Registration Number (optional)"
              />
            </div>
            
            {/* Display Specialization Info */}
            {profileData.specialization && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-900">Professional Information</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Specialization:</span> {profileData.specialization}
                  </p>
                  {profileData.pmdcNumber && (
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">PMDC Number:</span> {profileData.pmdcNumber}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Password Settings */}
      <Card title="Change Password">
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordErrors.general && (
            <div className={`px-4 py-3 rounded-lg text-sm ${
              passwordErrors.general.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {passwordErrors.general}
            </div>
          )}
          <Input
            type="password"
            label="Current Password"
            placeholder="Enter your current password"
            value={passwordData.currentPassword}
            onChange={(e) => {
              setPasswordData({ ...passwordData, currentPassword: e.target.value });
              setPasswordErrors({ ...passwordErrors, currentPassword: undefined });
            }}
            error={passwordErrors.currentPassword}
            required
          />
          <Input
            type="password"
            label="New Password"
            placeholder="Enter new password (min. 6 characters)"
            value={passwordData.newPassword}
            onChange={(e) => {
              setPasswordData({ ...passwordData, newPassword: e.target.value });
              setPasswordErrors({ ...passwordErrors, newPassword: undefined });
            }}
            error={passwordErrors.newPassword}
            required
          />
          <Input
            type="password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            value={passwordData.confirmPassword}
            onChange={(e) => {
              setPasswordData({ ...passwordData, confirmPassword: e.target.value });
              setPasswordErrors({ ...passwordErrors, confirmPassword: undefined });
            }}
            error={passwordErrors.confirmPassword}
            required
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isChangingPassword}
            >
              <Lock className="w-4 h-4 mr-2" />
              {isChangingPassword ? 'Updating Password...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Notification Settings */}
      <Card title="Notification Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive email updates about analysis completion</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Processing Alerts</p>
                <p className="text-sm text-gray-600">Get notified when image processing is complete</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );
}

